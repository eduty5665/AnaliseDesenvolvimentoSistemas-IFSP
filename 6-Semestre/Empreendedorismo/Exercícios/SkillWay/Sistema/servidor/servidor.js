/* ==========================================================================
   SkillWay — Servidor
   Node.js puro, sem dependências a instalar. Faz quatro coisas:
     1. entrega as páginas do sistema (index.html, app.html, css, js);
     2. cuida do login (senhas com scrypt, sessão em cookie HttpOnly);
     3. grava e lê os dados no banco, com regras de permissão que seguem a
        hierarquia da empresa. O banco é o PostgreSQL do Supabase quando há
        DATABASE_URL no arquivo .env; sem ela, é um SQLite na pasta dados/;
     4. conversa com a API do Claude, guardando a chave fora do navegador.
   Para iniciar:  node servidor/servidor.js   (ou dois cliques em iniciar.bat)
   ========================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');

// Lê o arquivo .env (opcional) antes de qualquer configuração.
(function lerEnv() {
  const arq = path.join(RAIZ, '.env');
  if (!fs.existsSync(arq)) return;
  fs.readFileSync(arq, 'utf8').replace(/^﻿/, '').split(/\r?\n/).forEach(linha => {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m || linha.trim().startsWith('#')) return;
    const valor = m[2].replace(/^["']|["']$/g, '');
    if (process.env[m[1]] === undefined && valor !== '') process.env[m[1]] = valor;
  });
})();

if (typeof fetch !== 'function') {
  console.error('\nO SkillWay precisa do Node.js 18 ou mais novo. Versão encontrada: ' + process.version + '\nBaixe a versão LTS em https://nodejs.org e tente de novo.\n');
  process.exit(1);
}

const banco = require('./banco');
const regras = require('./regras');
const ia = require('./ia');

const PORTA = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';
const URL_BANCO = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
const ARQ_BANCO = process.env.SKILLWAY_BANCO || path.join(RAIZ, 'dados', 'skillway.db');
const LIMITE_IA = parseInt(process.env.SKILLWAY_IA_LIMITE || '60', 10);   // chamadas por pessoa por dia
const SESSAO_DIAS = 30;
const SENHA_DEMO = 'skillway123';
const COLECOES = ['empresas', 'usuarios', 'diagnosticos', 'trilhas', 'eventos', 'quizzes', 'tentativas', 'mensagens', 'certificados'];
const DO_USUARIO = ['diagnosticos', 'trilhas', 'eventos', 'tentativas', 'certificados'];

let bd = null;

/* ====================================================================== */
/* Utilidades                                                              */
/* ====================================================================== */
class Erro extends Error { constructor(status, mensagem, detalhe) { super(mensagem); this.status = status; this.detalhe = detalhe; } }
const agora = () => new Date().toISOString();
const uid = prefixo => prefixo + '_' + crypto.randomBytes(9).toString('hex');
const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const texto = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 500);

function hashSenha(senha) {
  const sal = crypto.randomBytes(16).toString('hex');
  return 'scrypt$' + sal + '$' + crypto.scryptSync(String(senha), sal, 32).toString('hex');
}
function conferirSenha(senha, guardado) {
  const partes = String(guardado || '').split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;
  const a = Buffer.from(partes[2], 'hex'), b = crypto.scryptSync(String(senha), partes[1], 32);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Configurações (chave da IA, modelo, dados da demonstração). Ficam um minuto em memória: são lidas em todo
// pedido e, com o banco na nuvem, cada consulta a menos conta.
const cacheConfig = new Map();
const config = {
  async ler(chave) {
    const c = cacheConfig.get(chave);
    if (c && c.ate > Date.now()) return c.valor;
    const l = await bd.get('SELECT valor FROM config WHERE chave = ?', [chave]);
    const valor = l ? l.valor : null;
    cacheConfig.set(chave, { valor, ate: Date.now() + 60000 });
    return valor;
  },
  async gravar(chave, valor, q) {
    await (q || bd).run('INSERT INTO config (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor', [chave, valor]);
    cacheConfig.delete(chave);
  },
  async apagar(chave) { await bd.run('DELETE FROM config WHERE chave = ?', [chave]); cacheConfig.delete(chave); }
};

function responder(res, status, corpo, cabecalhos) {
  const dados = Buffer.from(JSON.stringify(corpo));
  res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': dados.length, 'Cache-Control': 'no-store' }, cabecalhos || {}));
  res.end(dados);
}
function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    const partes = []; let tamanho = 0;
    req.on('data', p => { tamanho += p.length; if (tamanho > 2 * 1024 * 1024) { reject(new Erro(413, 'O envio é grande demais.')); req.destroy(); } else partes.push(p); });
    req.on('end', () => {
      if (!partes.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(partes).toString('utf8'))); } catch (e) { reject(new Erro(400, 'O corpo do pedido não é um JSON válido.')); }
    });
    req.on('error', reject);
  });
}
/** Pedido feito no próprio computador do servidor (e não repassado por um proxy de hospedagem). */
const ehLocal = req => !req.headers['x-forwarded-for'] && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].indexOf(req.socket.remoteAddress) >= 0;
const cookie = (req, valor, idade) => 'sw_sessao=' + valor + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + idade +
  (req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '');

/* ====================================================================== */
/* Dados: leitura por empresa, hierarquia e recorte por permissão           */
/* ====================================================================== */
async function dadosEmpresa(empresaId) {
  const listas = await Promise.all(COLECOES.map(c => banco.listar(bd, c, empresaId)));
  const d = { versao: 2 };
  COLECOES.forEach((c, i) => { d[c] = listas[i]; });
  return d;
}
function abaixoDe(id, usuarios) {
  const filhos = {}, saida = new Set(), fila = [id];
  usuarios.forEach(u => { if (u.gestorId) (filhos[u.gestorId] = filhos[u.gestorId] || []).push(u.id); });
  while (fila.length) (filhos[fila.shift()] || []).forEach(f => { if (!saida.has(f) && f !== id) { saida.add(f); fila.push(f); } });
  return saida;
}
/** Quem a pessoa administra: o RH, a empresa toda; o gestor, quem está abaixo dele. */
function escopoDe(eu, usuarios) {
  if (eu.rh) return new Set(usuarios.filter(u => u.id !== eu.id).map(u => u.id));
  return abaixoDe(eu.id, usuarios);
}
const ehAdmin = (eu, usuarios) => eu.rh || usuarios.some(u => u.gestorId === eu.id && u.ativo);

async function estadoPara(eu) {
  const [tudo, analises] = await Promise.all([dadosEmpresa(eu.empresaId), banco.listar(bd, 'analises', eu.empresaId)]);
  const escopo = escopoDe(eu, tudo.usuarios);
  const vis = new Set([eu.id].concat(Array.from(escopo)));

  // Resumo público da empresa: médias e quem já domina cada competência (sem expor diagnósticos alheios).
  // Atenção: nada de "await" entre regras.usar() e os cálculos, pois as regras são compartilhadas entre pedidos.
  regras.usar(tudo);
  const resumo = regras.Engine.resumoEquipe(tudo.usuarios.filter(u => u.ativo));
  const referencias = {};
  resumo.perfis.forEach(p => p.itens.forEach(i => { if (i.nivel >= 4) (referencias[i.comp] = referencias[i.comp] || []).push({ userId: p.user.id, nivel: i.nivel }); }));
  const publico = {
    empresa: {
      total: resumo.total, comDiagnostico: resumo.comDiagnostico, aderenciaMedia: resumo.aderenciaMedia, progressoMedio: resumo.progressoMedio,
      horas: resumo.horas, certificados: resumo.certificados,
      competencias: resumo.competencias.map(c => ({ comp: c.comp, nivel: c.nivel, alvo: c.alvo, pessoas: c.pessoas, cobertura: c.cobertura }))
    },
    referencias
  };

  const estado = { versao: 2, servidor: true, publico };
  estado.empresas = tudo.empresas;
  estado.usuarios = tudo.usuarios.map(u => vis.has(u.id) ? u : Object.assign({}, u, { curriculo: '', rascunho: null }));
  DO_USUARIO.forEach(c => { estado[c] = tudo[c].filter(x => vis.has(x.userId)); });
  estado.quizzes = tudo.quizzes.filter(q => eu.rh || q.autorId === eu.id || (q.destinatarios || []).indexOf(eu.id) >= 0);
  estado.mensagens = tudo.mensagens.filter(m => eu.rh || m.de === eu.id || m.para === eu.id);
  estado.analises = analises.filter(a => a.tipo === 'perfil' ? vis.has(a.userId) : a.userId === eu.id);
  return estado;
}

/* ====================================================================== */
/* Sessões                                                                 */
/* ====================================================================== */
function tokenDe(req) {
  const m = String(req.headers.cookie || '').match(/(?:^|;\s*)sw_sessao=([a-f0-9]{64})/);
  return m ? m[1] : null;
}
async function usuarioDaSessao(req) {
  const token = tokenDe(req);
  if (!token) return null;
  const l = await bd.get('SELECT u.* FROM usuarios u JOIN sessoes s ON s.usuario_id = u.id WHERE s.token = ? AND s.expira_em > ?', [token, agora()]);
  const u = l ? banco.objeto('usuarios', l) : null;
  return u && u.ativo ? u : null;
}
async function abrirSessao(req, usuarioId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + SESSAO_DIAS * 86400000).toISOString();
  await bd.run('INSERT INTO sessoes (token, usuario_id, criado_em, expira_em) VALUES (?, ?, ?, ?)', [token, usuarioId, agora(), expira]);
  return { 'Set-Cookie': cookie(req, token, SESSAO_DIAS * 86400) };
}
const tentativasLogin = new Map();

/* ====================================================================== */
/* Demonstração                                                            */
/* ====================================================================== */
async function semearDemo() {
  const d = regras.demo();
  const senha = hashSenha(SENHA_DEMO);
  const empresaId = d.empresas[0].id;
  await bd.transacao(async tx => {
    // Um INSERT com várias linhas por tabela: poucas idas ao banco, rápido mesmo com ele na nuvem.
    for (const c of COLECOES) await banco.gravarVarios(tx, c, d[c], empresaId);
    await tx.run('UPDATE usuarios SET senha_hash = ? WHERE empresa_id = ?', [senha, empresaId]);
    await config.gravar('demo', JSON.stringify({ empresaId, acessos: d.demo.acessos, senha: SENHA_DEMO }), tx);
  });
  cacheConfig.delete('demo');
}
async function apagarEmpresa(empresaId) {
  await bd.transacao(async tx => {
    await tx.run('DELETE FROM sessoes WHERE usuario_id IN (SELECT id FROM usuarios WHERE empresa_id = ?)', [empresaId]);
    const tabelas = COLECOES.filter(c => c !== 'empresas').concat(['analises', 'conversas', 'ia_uso']);
    await Promise.all(tabelas.map(c => tx.run('DELETE FROM ' + c + ' WHERE empresa_id = ?', [empresaId])));   // seguem juntos pela mesma conexão
    await tx.run('DELETE FROM empresas WHERE id = ?', [empresaId]);
  });
}
async function infoDemo() {
  try {
    const d = JSON.parse(await config.ler('demo') || 'null');
    return d && await banco.buscar(bd, 'empresas', d.empresaId) ? d : null;
  } catch (e) { return null; }
}

/* ====================================================================== */
/* Sincronização: o navegador envia o que mudou; o servidor confere quem     */
/* pode gravar o quê antes de salvar. Tudo em uma transação: ou grava o      */
/* lote inteiro, ou nada.                                                    */
/* ====================================================================== */
async function sincronizar(eu, corpo) {
  const gravar = corpo.gravar || {}, apagar = corpo.apagar || {};
  const usuarios = await banco.listar(bd, 'usuarios', eu.empresaId);
  const escopo = escopoDe(eu, usuarios);
  const admin = ehAdmin(eu, usuarios);
  const negar = (msg) => { throw new Erro(403, msg || 'Você não tem permissão para esta alteração.'); };
  const mesmaEmpresa = (colecao, atual) => (colecao === 'empresas' ? atual.id : atual.empresaId) === eu.empresaId;

  // Hierarquia como ficará depois deste lote (para validar gestores novos e ciclos).
  const futuro = new Map(usuarios.map(u => [u.id, u.gestorId || null]));
  (Array.isArray(gravar.usuarios) ? gravar.usuarios : []).forEach(u => { if (u && u.id && u.id !== eu.id) futuro.set(String(u.id), u.gestorId || null); });
  const chegaEm = (id, alvo) => {
    let atual = futuro.get(id), passos = 0;
    while (atual && passos++ < 80) { if (atual === alvo) return true; atual = futuro.get(atual); }
    if (passos >= 80) throw new Erro(400, 'A hierarquia informada tem um ciclo.');
    return false;
  };

  // E-mails já usados (em qualquer empresa) entre os que chegaram neste lote: e-mail -> id de quem usa.
  const donos = new Map();
  const regra = {
    async empresas(tx, obj, atual) {
      if (!atual || obj.id !== eu.empresaId || !eu.rh) negar('Só o RH altera os dados da empresa.');
      return Object.assign({}, atual, { nome: texto(obj.nome, 120) || atual.nome, segmento: texto(obj.segmento, 60), cidade: texto(obj.cidade, 80), meta: obj.meta || null });
    },
    async usuarios(tx, obj, atual) {
      if (obj.id === eu.id) {
        return Object.assign({}, atual, { nome: texto(obj.nome, 120) || atual.nome, curriculo: texto(obj.curriculo, 4000), rascunho: obj.rascunho || null,
          cargo: texto(obj.cargo, 80) || atual.cargo, area: regras.Catalog.area(obj.area) ? obj.area : atual.area });
      }
      if (!admin) negar('Só gestores e RH cadastram ou alteram pessoas.');
      const email = texto(obj.email, 160).toLowerCase();
      if (!texto(obj.nome)) throw new Erro(400, 'Informe o nome.');
      if (!emailValido(email)) throw new Erro(400, 'E-mail inválido: ' + (email || '(vazio)'));
      const dono = donos.get(email);
      if (dono && dono !== obj.id) throw new Erro(409, 'Já existe uma pessoa com o e-mail ' + email + '.');
      if (atual && atual.email !== email && donos.get(atual.email) === obj.id) donos.delete(atual.email);
      donos.set(email, obj.id);
      const gestorId = obj.gestorId || null;
      if (gestorId && !futuro.has(gestorId)) throw new Erro(400, 'O superior informado não existe nesta empresa.');
      if (gestorId === obj.id) throw new Erro(400, 'Uma pessoa não pode ser gestora de si mesma.');
      chegaEm(obj.id, '__nenhum__'); // detecta ciclo
      if (!eu.rh) {
        if (atual && !escopo.has(atual.id)) negar('Esta pessoa não faz parte da sua equipe.');
        if (!chegaEm(obj.id, eu.id)) negar('O superior precisa ser você ou alguém da sua equipe.');
      }
      const base = atual || { criadoEm: agora(), ultimoAcesso: null, curriculo: '', rascunho: null, trocarSenha: true, rh: false };
      return Object.assign({}, base, {
        id: obj.id, nome: texto(obj.nome, 120), email, cargo: texto(obj.cargo, 80) || 'Colaborador(a)',
        area: regras.Catalog.area(obj.area) ? obj.area : 'administrativo', unidade: texto(obj.unidade, 80), gestorId,
        ativo: obj.ativo !== false, admissao: texto(obj.admissao, 10), rh: eu.rh ? !!obj.rh : !!base.rh
      });
    },
    async mensagens(tx, obj, atual) {
      if (atual) {
        if (atual.de === eu.id) return Object.assign({}, obj, { de: atual.de, para: atual.para });
        if (atual.para === eu.id) return Object.assign({}, atual, { lidoEm: obj.lidoEm || atual.lidoEm, resposta: texto(obj.resposta, 2000), respondidoEm: obj.respondidoEm || null });
        negar();
      }
      if (!obj.de) { if (obj.para !== eu.id || obj.tipo !== 'sistema') negar(); return obj; }
      if (obj.de !== eu.id || !admin || !escopo.has(obj.para)) negar('Você só envia mensagens para quem faz parte da sua equipe.');
      return obj;
    },
    async quizzes(tx, obj, atual) {
      if (!admin || obj.autorId !== eu.id || (atual && atual.autorId !== eu.id)) negar('Só gestores e RH criam quizzes.');
      if (!Array.isArray(obj.destinatarios) || obj.destinatarios.some(id => !escopo.has(id))) negar('O quiz só pode ir para pessoas da sua equipe.');
      if (!Array.isArray(obj.perguntas) || !obj.perguntas.length) throw new Erro(400, 'O quiz precisa de pelo menos uma pergunta.');
      return obj;
    }
  };
  DO_USUARIO.forEach(c => {
    regra[c] = async (tx, obj, atual) => {
      if (obj.userId !== eu.id || (atual && atual.userId !== eu.id)) negar('Cada pessoa só grava os próprios registros.');
      return obj;
    };
  });

  // Com o banco na nuvem cada consulta custa uma viagem: por tabela, uma leitura do que já existe e uma gravação em lote.
  let gravados = 0, apagados = 0;
  await bd.transacao(async tx => {
    for (const colecao of COLECOES) {
      const lista = Array.isArray(gravar[colecao]) ? gravar[colecao] : [];
      if (!lista.length) continue;
      lista.forEach(obj => {
        if (!obj || typeof obj !== 'object' || !obj.id) throw new Erro(400, 'Registro sem identificador.');
        obj.id = String(obj.id).slice(0, 80);
      });
      const atuais = await banco.buscarVarios(tx, colecao, lista.map(o => o.id));
      if (colecao === 'usuarios') {
        const emails = Array.from(new Set(lista.map(o => texto(o.email, 160).toLowerCase()).filter(Boolean)));
        if (emails.length) {
          (await tx.all('SELECT id, email FROM usuarios WHERE email IN (' + emails.map(() => '?').join(', ') + ')', emails, emails.length > 1))
            .forEach(l => donos.set(l.email, l.id));
        }
      }
      const prontos = [];
      for (const obj of lista) {
        const atual = atuais.get(obj.id) || null;
        if (atual && !mesmaEmpresa(colecao, atual)) negar();
        const pronto = await regra[colecao](tx, obj, atual);
        atuais.set(obj.id, Object.assign({}, pronto, { empresaId: eu.empresaId }));   // o mesmo id de novo no lote parte do que acabou de valer
        prontos.push(pronto);
      }
      await banco.gravarVarios(tx, colecao, prontos, eu.empresaId);
      gravados += lista.length;
    }
    for (const colecao of ['mensagens', 'quizzes']) {
      const ids = (Array.isArray(apagar[colecao]) ? apagar[colecao] : []).map(String);
      if (!ids.length) continue;
      const atuais = await banco.buscarVarios(tx, colecao, ids);
      const quizzes = colecao === 'mensagens'
        ? await banco.buscarVarios(tx, 'quizzes', Array.from(atuais.values()).map(m => m.quizId).filter(Boolean)) : null;
      const saem = [];
      atuais.forEach(atual => {
        if (!mesmaEmpresa(colecao, atual)) negar();
        let pode = eu.rh;
        if (colecao === 'quizzes') pode = pode || atual.autorId === eu.id;
        else {
          const quiz = atual.quizId ? quizzes.get(atual.quizId) : null;
          pode = pode || atual.de === eu.id || (quiz && quiz.autorId === eu.id) || (atual.quizId && !quiz && admin);
        }
        if (!pode) negar();
        saem.push(atual.id);
      });
      await banco.apagarVarios(tx, colecao, saem);
      apagados += saem.length;
    }
  });
  return { gravados, apagados };
}

/* ====================================================================== */
/* Inteligência artificial                                                 */
/* ====================================================================== */
async function cfgIA() {
  const doAmbiente = process.env.ANTHROPIC_API_KEY || '';
  const [salva, modelo] = await Promise.all([doAmbiente ? null : config.ler('ia_chave'), process.env.SKILLWAY_MODELO ? null : config.ler('ia_modelo')]);
  const chave = doAmbiente || salva || '';
  return {
    chave, origem: doAmbiente ? 'ambiente' : (chave ? 'banco' : ''),
    modelo: process.env.SKILLWAY_MODELO || modelo || ia.MODELO_PADRAO,
    base: process.env.ANTHROPIC_BASE_URL || ''
  };
}
function registrarUso(eu, tipo, modelo, uso) {
  return bd.run('INSERT INTO ia_uso (id, empresa_id, usuario_id, tipo, modelo, tokens_entrada, tokens_saida, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [uid('ia'), eu.empresaId, eu.id, tipo, modelo || '', (uso && uso.entrada) || 0, (uso && uso.saida) || 0, agora()]);
}
async function conferirLimite(eu) {
  const inicio = new Date(); inicio.setHours(0, 0, 0, 0);
  const l = await bd.get('SELECT COUNT(*) AS n FROM ia_uso WHERE usuario_id = ? AND criado_em >= ?', [eu.id, inicio.toISOString()]);
  if (Number(l.n) >= LIMITE_IA) throw new Erro(429, 'Você atingiu o limite de ' + LIMITE_IA + ' pedidos à IA por dia. Volte amanhã.');
}
/** Executa um pedido estruturado, registrando o consumo de tokens mesmo quando falha. */
async function pedir(eu, tipo, montagem) {
  await conferirLimite(eu);
  const cfg = await cfgIA();
  try {
    const r = await ia.pedirJSON(cfg, montagem, montagem.validar);
    await registrarUso(eu, tipo, r.modelo, r.uso);
    return r;
  } catch (e) {
    if (e.uso) await registrarUso(eu, tipo, cfg.modelo, e.uso);
    throw e;
  }
}
async function guardarAnalise(eu, id, dono, tipo, chave, modelo, resultado) {
  const a = { id, userId: dono, tipo, chave, modelo, criadoEm: agora(), resultado };
  await banco.gravar(bd, 'analises', a, eu.empresaId);
  return Object.assign({ empresaId: eu.empresaId }, a);
}
/** Dados do perfil no formato enviado à IA (sem nome nem e-mail). Síncrono: chamar logo depois de regras.usar(). */
function retratoPerfil(R, userId) {
  const C = R.Catalog, p = R.Engine.perfil(userId), u = p.user;
  if (!p.diag) return { perfil: p, dados: { cargo: u.cargo, area: (C.area(u.area) || {}).nome, semDiagnostico: true } };
  const situacao = s => s === 'concluido' ? 'concluído' : (s === 'andamento' ? 'em andamento' : 'pendente');
  return {
    perfil: p,
    dados: {
      cargo: u.cargo, areaDeReferencia: C.area(p.diag.areaAlvo).nome, objetivo: C.OBJETIVOS[p.diag.objetivo].nome,
      tempoDisponivel: C.TEMPOS[p.diag.tempo].nome, orcamento: C.ORCAMENTOS[p.diag.orcamento].nome,
      aderenciaAoCargo: p.aderencia + '%', progressoDaTrilha: p.progresso + '%', horasEstudadas: p.horas, certificados: p.certificados.length,
      horasDeConteudoRestantes: p.horasRestantes,
      competencias: p.itens.map(i => ({ id: i.comp, nome: i.nome, nivelAtual: i.nivel, nivelEsperado: i.alvo, autoavaliacao: i.auto,
        melhorQuiz: i.quiz == null ? null : i.quiz + '%', citadaNoCurriculo: !!i.evidencia })),
      trilha: (p.trilha ? p.trilha.modulos : []).map(m => ({
        competencia: C.comp(m.comp).nome,
        passos: m.passos.map(ps => {
          if (ps.tipo === 'quiz') return { passo: 'Quiz de validação', situacao: situacao(ps.status) };
          const ct = C.conteudo(ps.conteudoId);
          return { passo: ct.titulo, tipo: C.TIPOS[ct.tipo], horas: ct.horas, custo: C.CUSTOS[ct.custo], situacao: situacao(ps.status) };
        })
      }))
    }
  };
}

// Em cada rota: primeiro busca os dados (await), depois calcula tudo de uma vez com as regras (sem await no meio),
// e só então chama a IA. As regras são um contexto compartilhado; não podem ficar "abertas" entre dois awaits.
const rotasIA = {
  async curriculo(eu, corpo) {
    const cv = texto(corpo.curriculo, 4000);
    if (cv.length < 30) throw new Erro(400, 'Escreva um pouco mais sobre a sua formação e experiência para a IA poder ler.');
    const tudo = await dadosEmpresa(eu.empresaId);
    const R = regras.usar(tudo), C = R.Catalog;
    const areaRef = (corpo.objetivo === 'reskilling' && C.area(corpo.areaAlvo)) ? corpo.areaAlvo : (C.area(corpo.areaAtual) ? corpo.areaAtual : eu.area);
    const competencias = R.Engine.alvos(R.Store.usuario(eu.id), areaRef).map(a => ({ id: a.comp, nome: C.comp(a.comp).nome, alvo: a.alvo }));
    const r = await pedir(eu, 'curriculo', ia.curriculo({ cargo: texto(corpo.cargo, 80) || eu.cargo, area: C.area(areaRef).nome, curriculo: cv, competencias }));
    return { sugestao: r.dados, modelo: r.modelo };
  },

  async perfil(eu, corpo) {
    const tudo = await dadosEmpresa(eu.empresaId), alvoId = corpo.userId || eu.id;
    if (alvoId !== eu.id && !escopoDe(eu, tudo.usuarios).has(alvoId)) throw new Erro(403, 'Esta pessoa não faz parte da sua equipe.');
    const ret = retratoPerfil(regras.usar(tudo), alvoId);
    if (!ret.perfil.diag) throw new Erro(400, 'A leitura da IA depende do diagnóstico. Faça o diagnóstico primeiro.');
    const diagId = ret.perfil.diag.id, cv = texto(ret.perfil.diag.curriculo || ret.perfil.user.curriculo, 4000);
    const r = await pedir(eu, 'perfil', ia.perfil({ dados: ret.dados, curriculo: cv }));
    return { analise: await guardarAnalise(eu, 'an_perfil_' + alvoId, alvoId, 'perfil', diagId, r.modelo, r.dados) };
  },

  async quiz(eu, corpo) {
    const tudo = await dadosEmpresa(eu.empresaId), comp = regras.Catalog.comp(corpo.comp);
    if (!comp) throw new Erro(400, 'Competência desconhecida.');
    const admin = ehAdmin(eu, tudo.usuarios);
    const quantidade = Math.max(2, Math.min(admin ? 8 : 5, parseInt(corpo.quantidade, 10) || 5));
    const nivel = ['básico', 'intermediário', 'avançado'].indexOf(corpo.nivel) >= 0 ? corpo.nivel : 'intermediário';
    let publico;
    if (admin) {
      const esc = escopoDe(eu, tudo.usuarios);
      const cargos = Array.from(new Set(tudo.usuarios.filter(u => esc.has(u.id) && u.ativo).map(u => u.cargo))).slice(0, 6);
      publico = 'equipe de uma empresa de ' + (tudo.empresas[0].segmento || 'serviços').toLowerCase() + (cargos.length ? ', com cargos como ' + cargos.join(', ') : '');
    } else publico = 'uma pessoa no cargo de ' + eu.cargo;
    const r = await pedir(eu, 'quiz', ia.quiz({ competencia: comp.nome, quantidade, nivel, publico, contexto: texto(corpo.contexto, 300), existentes: comp.perguntas.map(p => p.p) }));
    return { perguntas: r.dados.perguntas, modelo: r.modelo };
  },

  async equipe(eu) {
    const tudo = await dadosEmpresa(eu.empresaId);
    if (!ehAdmin(eu, tudo.usuarios)) throw new Erro(403, 'Disponível para gestores e RH.');
    const R = regras.usar(tudo), C = R.Catalog;
    const pessoas = R.Store.equipe(R.Store.usuario(eu.id));
    if (!pessoas.length) throw new Erro(400, 'Sua equipe ainda não tem pessoas cadastradas.');
    const resumo = R.Engine.resumoEquipe(pessoas);
    const ordem = { 'sem-diagnostico': 0, parado: 1, 'em-dia': 2, concluida: 3 };
    const perfis = resumo.perfis.slice().sort((a, b) => (ordem[a.status] - ordem[b.status]) || ((a.aderencia || 0) - (b.aderencia || 0))).slice(0, 40);
    const dados = {
      escopo: eu.rh ? 'empresa inteira' : 'equipe do gestor', pessoas: resumo.total, comDiagnostico: resumo.comDiagnostico,
      progressoMedioNaTrilha: resumo.progressoMedio + '%', aderenciaMediaAoCargo: resumo.aderenciaMedia + '%', certificadosEmitidos: resumo.certificados,
      equipe: perfis.map((p, i) => ({
        codigo: 'P' + (i + 1), cargo: p.user.cargo, situacao: R.Engine.rotuloStatus(p).texto,
        progressoNaTrilha: p.diag ? p.progresso + '%' : null, aderenciaAoCargo: p.aderencia == null ? null : p.aderencia + '%',
        diasSemAtividade: p.diasParado, certificados: p.certificados.length,
        maioresLacunas: p.itens.filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 2).map(x => ({ comp: x.comp, nome: x.nome, nivel: x.nivel, esperado: x.alvo }))
      })),
      competencias: resumo.competencias.map(c => ({ comp: c.comp, nome: c.nome, mediaDaEquipe: c.nivel, esperado: c.alvo, cobertura: c.cobertura + '%', pessoasAbaixo: c.abaixo.length, pessoasAvaliadas: c.pessoas }))
    };
    const nomes = {}; perfis.forEach((p, i) => { nomes['P' + (i + 1)] = { id: p.user.id, nome: p.user.nome }; });
    const comps = C.competencias().map(c => c.id), total = String(resumo.total);

    const r = await pedir(eu, 'equipe', ia.equipe({ dados, comps }));
    // Troca os códigos (P1, P2...) pelos nomes: os nomes nunca saem do servidor.
    const comNomes = s => String(s).replace(/\bP(\d{1,2})\b/g, (m) => nomes[m] ? nomes[m].nome.split(' ')[0] : m);
    const res = r.dados;
    res.panorama = comNomes(res.panorama); res.destaques = res.destaques.map(comNomes); res.riscos = res.riscos.map(comNomes);
    res.acoes = res.acoes.map(a => ({ titulo: comNomes(a.titulo), motivo: comNomes(a.motivo), tipo: a.tipo, comp: a.comp,
      ids: a.pessoas.map(c => nomes[c] && nomes[c].id).filter(Boolean) }));
    return { analise: await guardarAnalise(eu, 'an_equipe_' + eu.id, eu.id, 'equipe', total, r.modelo, res) };
  },

  async respostas(eu, corpo) {
    const grupo = texto(corpo.grupo, 80);
    const msgs = (await banco.listar(bd, 'mensagens', eu.empresaId)).filter(m => m.tipo === 'pergunta' && (m.grupo === grupo || m.id === grupo) && m.de === eu.id);
    const dadas = msgs.filter(m => m.respondidoEm && m.resposta);
    if (dadas.length < 2) throw new Erro(400, 'O resumo precisa de pelo menos duas respostas.');
    const r = await pedir(eu, 'respostas', ia.respostas({ pergunta: msgs[0].titulo, respostas: dadas.map(m => texto(m.resposta, 600)) }));
    return { analise: await guardarAnalise(eu, 'an_resp_' + grupo, eu.id, 'respostas', grupo, r.modelo, Object.assign({ respostas: dadas.length }, r.dados)) };
  },

  async mentor(eu, corpo) {
    const mensagem = texto(corpo.mensagem, 1500);
    if (!mensagem) throw new Erro(400, 'Escreva a sua pergunta.');
    await conferirLimite(eu);
    const [tudo, ultimas, cfg] = await Promise.all([
      dadosEmpresa(eu.empresaId),
      bd.all('SELECT papel, texto FROM conversas WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 12', [eu.id]),
      cfgIA()
    ]);
    const sistema = ia.mentorSistema(retratoPerfil(regras.usar(tudo), eu.id).dados);
    const historico = ultimas.reverse();
    while (historico.length && historico[0].papel !== 'user') historico.shift();
    const mensagens = historico.map(h => ({ role: h.papel, content: h.texto })).concat([{ role: 'user', content: mensagem }]);
    const r = await ia.chamar(cfg, { sistema, mensagens, maxTokens: 800 });
    await registrarUso(eu, 'mentor', r.modelo, r.uso);
    const resposta = r.texto || 'Não consegui responder agora. Tente reformular a pergunta.';
    const t = Date.now(), inserir = 'INSERT INTO conversas (id, empresa_id, usuario_id, papel, texto, criado_em) VALUES (?, ?, ?, ?, ?, ?)';
    await bd.run(inserir, [uid('cv'), eu.empresaId, eu.id, 'user', mensagem, new Date(t).toISOString()]);
    await bd.run(inserir, [uid('cv'), eu.empresaId, eu.id, 'assistant', resposta, new Date(t + 1).toISOString()]);
    return { resposta, modelo: r.modelo };
  }
};

async function statusIA(eu, req) {
  const [cfg, uso, porTipo] = await Promise.all([
    cfgIA(),
    bd.get('SELECT COUNT(*) AS chamadas, COALESCE(SUM(tokens_entrada), 0) AS entrada, COALESCE(SUM(tokens_saida), 0) AS saida FROM ia_uso WHERE empresa_id = ?', [eu.empresaId]),
    bd.all('SELECT tipo, COUNT(*) AS n FROM ia_uso WHERE empresa_id = ? GROUP BY tipo ORDER BY n DESC', [eu.empresaId])
  ]);
  return {
    ativa: !!cfg.chave, origem: cfg.origem, modelo: cfg.modelo, final: cfg.chave ? cfg.chave.slice(-4) : '',
    modeloFixo: !!process.env.SKILLWAY_MODELO, podeConfigurar: ehLocal(req), modelos: ia.MODELOS, limiteDiario: LIMITE_IA,
    uso: { chamadas: Number(uso.chamadas), entrada: Number(uso.entrada), saida: Number(uso.saida) },
    porTipo: porTipo.map(t => ({ tipo: t.tipo, n: Number(t.n) }))
  };
}

/* ====================================================================== */
/* Rotas da API                                                            */
/* ====================================================================== */
async function api(req, res, rota) {
  const metodo = req.method;
  const corpo = (metodo === 'POST' || metodo === 'DELETE') ? await lerCorpo(req) : {};
  const [eu, cfg] = await Promise.all([usuarioDaSessao(req), cfgIA()]);
  const exigirLogin = () => { if (!eu) throw new Erro(401, 'Sua sessão terminou. Entre de novo.'); return eu; };
  const exigirRH = () => { if (!exigirLogin().rh) throw new Erro(403, 'Disponível só para o RH.'); return eu; };
  const resumoIA = { ativa: !!cfg.chave, modelo: cfg.modelo };
  const semCookie = { 'Set-Cookie': cookie(req, '', 0) };

  if (rota === 'sessao' && metodo === 'GET') {
    const [demo, estado] = await Promise.all([infoDemo(), eu ? estadoPara(eu) : null]);
    return responder(res, 200, { servidor: true, motor: bd.motor, ia: resumoIA, demo: demo ? { acessos: demo.acessos, senha: demo.senha } : null,
      usuario: eu ? eu.id : null, estado });
  }

  if (rota === 'entrar' && metodo === 'POST') {
    const email = texto(corpo.email, 160).toLowerCase();
    const t = tentativasLogin.get(email);
    if (t && t.bloqueadoAte > Date.now()) throw new Erro(429, 'Muitas tentativas. Aguarde um minuto e tente de novo.');
    const linha = await bd.get('SELECT id, senha_hash, ativo FROM usuarios WHERE email = ?', [email]);
    if (!linha || !conferirSenha(corpo.senha || '', linha.senha_hash)) {
      const n = ((t && t.n) || 0) + 1;
      tentativasLogin.set(email, { n, bloqueadoAte: n >= 8 ? Date.now() + 60000 : 0 });
      throw new Erro(401, 'E-mail ou senha incorretos.');
    }
    if (!linha.ativo) throw new Erro(403, 'Este acesso foi desativado. Fale com o RH da sua empresa.');
    tentativasLogin.delete(email);
    await bd.run('UPDATE usuarios SET ultimo_acesso = ? WHERE id = ?', [agora(), linha.id]);
    const [u, cabecalho] = await Promise.all([banco.buscar(bd, 'usuarios', linha.id), abrirSessao(req, linha.id)]);
    const estado = await estadoPara(u);
    return responder(res, 200, { ok: true, usuario: u.id, estado, ia: resumoIA }, cabecalho);
  }

  if (rota === 'sair' && metodo === 'POST') {
    const token = tokenDe(req);
    if (token) await bd.run('DELETE FROM sessoes WHERE token = ?', [token]);
    return responder(res, 200, { ok: true }, semCookie);
  }

  if (rota === 'cadastro' && metodo === 'POST') {
    const email = texto(corpo.email, 160).toLowerCase();
    if (!texto(corpo.empresa)) throw new Erro(400, 'Informe o nome da empresa.');
    if (!texto(corpo.nome)) throw new Erro(400, 'Informe o seu nome.');
    if (!emailValido(email)) throw new Erro(400, 'E-mail inválido.');
    if (String(corpo.senha || '').length < 6) throw new Erro(400, 'A senha precisa ter pelo menos 6 caracteres.');
    if (await bd.get('SELECT id FROM usuarios WHERE email = ?', [email])) throw new Erro(409, 'Já existe uma conta com esse e-mail. Entre com ela ou use outro e-mail.');
    const empresaId = uid('e'), usuarioId = uid('u'), senha = hashSenha(corpo.senha);
    await bd.transacao(async tx => {
      await banco.gravar(tx, 'empresas', { id: empresaId, nome: texto(corpo.empresa, 120), segmento: texto(corpo.segmento, 60) || 'Serviços', cidade: texto(corpo.cidade, 80),
        porte: parseInt(corpo.porte, 10) || 0, demo: false, meta: null, criadoEm: agora() });
      await banco.gravar(tx, 'usuarios', { id: usuarioId, nome: texto(corpo.nome, 120), email, cargo: texto(corpo.cargo, 80) || 'Responsável de RH', area: 'rh', unidade: 'Matriz',
        gestorId: null, rh: true, ativo: true, trocarSenha: false, curriculo: '', admissao: agora().slice(0, 10), criadoEm: agora(), ultimoAcesso: agora() }, empresaId);
      await tx.run('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senha, usuarioId]);
    });
    const u = await banco.buscar(bd, 'usuarios', usuarioId);
    const [estado, cabecalho] = await Promise.all([estadoPara(u), abrirSessao(req, u.id)]);
    return responder(res, 200, { ok: true, usuario: u.id, estado, ia: resumoIA }, cabecalho);
  }

  if (rota === 'estado' && metodo === 'GET') return responder(res, 200, { usuario: exigirLogin().id, estado: await estadoPara(eu), ia: resumoIA });

  if (rota === 'sincronizar' && metodo === 'POST') return responder(res, 200, Object.assign({ ok: true }, await sincronizar(exigirLogin(), corpo)));

  if (rota === 'senha' && metodo === 'POST') {
    exigirLogin();
    const nova = String(corpo.nova || '');
    if (nova.length < 6) throw new Erro(400, 'A senha precisa ter pelo menos 6 caracteres.');
    const alvoId = corpo.userId || eu.id;
    if (alvoId === eu.id) {
      const linha = await bd.get('SELECT senha_hash FROM usuarios WHERE id = ?', [eu.id]);
      if (!eu.trocarSenha && !conferirSenha(corpo.atual || '', linha.senha_hash)) throw new Erro(400, 'A senha atual não confere.');
      await bd.run('UPDATE usuarios SET senha_hash = ?, trocar_senha = ? WHERE id = ?', [hashSenha(nova), bd.bool(false), eu.id]);
    } else {
      const usuarios = await banco.listar(bd, 'usuarios', eu.empresaId);
      if (!escopoDe(eu, usuarios).has(alvoId)) throw new Erro(403, 'Esta pessoa não faz parte da sua equipe.');
      await bd.run('UPDATE usuarios SET senha_hash = ?, trocar_senha = ? WHERE id = ?', [hashSenha(nova), bd.bool(corpo.trocar !== false), alvoId]);
      await bd.run('DELETE FROM sessoes WHERE usuario_id = ?', [alvoId]);
    }
    return responder(res, 200, { ok: true });
  }

  if (rota === 'banco' && metodo === 'GET') {
    exigirRH();
    const nomes = COLECOES.concat(['analises', 'conversas']);
    const contagens = await Promise.all(nomes.map(c =>
      bd.get(c === 'empresas' ? 'SELECT COUNT(*) AS n FROM empresas WHERE id = ?' : 'SELECT COUNT(*) AS n FROM ' + c + ' WHERE empresa_id = ?', [eu.empresaId])));
    const tabelas = {};
    nomes.forEach((c, i) => { tabelas[c] = Number(contagens[i].n); });
    let tamanho = null;
    if (!bd.pg) { try { await bd.persistir(); tamanho = fs.statSync(bd.destino).size; } catch (e) { /* arquivo ainda não gravado */ } }
    return responder(res, 200, { motor: bd.motor, nuvem: !!bd.pg, destino: bd.pg ? bd.destino : (ehLocal(req) ? bd.destino : path.basename(bd.destino)), tamanho, tabelas });
  }

  if (rota === 'demo/restaurar' && metodo === 'POST') {
    exigirRH();
    const emp = await banco.buscar(bd, 'empresas', eu.empresaId);
    if (!emp.demo) throw new Erro(403, 'Só o RH da empresa de demonstração restaura a demonstração.');
    await apagarEmpresa(emp.id);
    await semearDemo();
    return responder(res, 200, { ok: true }, semCookie);
  }

  /* ---------- IA ---------- */
  if (rota === 'ia/config' && metodo === 'GET') return responder(res, 200, await statusIA(exigirRH(), req));
  if (rota === 'ia/config' && metodo === 'POST') {
    exigirRH();
    if (!ehLocal(req)) throw new Erro(403, 'A chave da API só pode ser alterada no computador onde o servidor está rodando. Em hospedagem, defina ANTHROPIC_API_KEY nas variáveis de ambiente.');
    if (corpo.remover) await config.apagar('ia_chave');
    if (corpo.chave != null && String(corpo.chave).trim()) {
      const chave = String(corpo.chave).trim();
      if (chave.length < 20 || /\s/.test(chave)) throw new Erro(400, 'Essa chave não parece válida. Copie a chave inteira do console da Anthropic.');
      await config.gravar('ia_chave', chave);
    }
    if (corpo.modelo != null && String(corpo.modelo).trim()) {
      const modelo = String(corpo.modelo).trim();
      if (!/^[a-z0-9.\-_:@]{3,80}$/i.test(modelo)) throw new Erro(400, 'Nome de modelo inválido.');
      await config.gravar('ia_modelo', modelo);
    }
    return responder(res, 200, await statusIA(eu, req));
  }
  if (rota === 'ia/testar' && metodo === 'POST') {
    exigirRH();
    const r = await ia.chamar(await cfgIA(), { sistema: 'Responda somente com a palavra: ok', mensagens: [{ role: 'user', content: 'Teste de conexão do SkillWay.' }], maxTokens: 16 });
    await registrarUso(eu, 'teste', r.modelo, r.uso);
    return responder(res, 200, { ok: true, modelo: r.modelo, resposta: r.texto.slice(0, 40) });
  }
  if (rota === 'ia/mentor' && metodo === 'GET') {
    exigirLogin();
    const msgs = (await bd.all('SELECT papel, texto, criado_em FROM conversas WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 60', [eu.id])).reverse();
    return responder(res, 200, { mensagens: msgs.map(m => ({ papel: m.papel, texto: m.texto, criadoEm: m.criado_em })) });
  }
  if (rota === 'ia/mentor' && metodo === 'DELETE') {
    await bd.run('DELETE FROM conversas WHERE usuario_id = ?', [exigirLogin().id]);
    return responder(res, 200, { ok: true });
  }
  const m = rota.match(/^ia\/(curriculo|perfil|quiz|equipe|respostas|mentor)$/);
  if (m && metodo === 'POST') return responder(res, 200, Object.assign({ ok: true }, await rotasIA[m[1]](exigirLogin(), corpo)));

  throw new Erro(404, 'Rota não encontrada.');
}

/* ====================================================================== */
/* Arquivos estáticos                                                      */
/* ====================================================================== */
const TIPOS = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', svg: 'image/svg+xml',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', ico: 'image/x-icon', woff2: 'font/woff2', txt: 'text/plain; charset=utf-8' };
function estatico(req, res, caminho) {
  let rel;
  try { rel = decodeURIComponent(caminho); } catch (e) { rel = '/'; }
  if (rel === '/' || rel === '') rel = '/index.html';
  const partes = rel.split('/').filter(Boolean);
  const ext = (path.extname(rel).slice(1) || '').toLowerCase();
  const proibido = partes.some(p => p.startsWith('.') || p === '..') || ['servidor', 'dados', 'node_modules'].indexOf(partes[0]) >= 0 || /^env\./i.test(partes[0] || '') || !TIPOS[ext];
  const arquivo = path.join(RAIZ, partes.join(path.sep));
  if (proibido || !arquivo.startsWith(RAIZ + path.sep) || !fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Página não encontrada.');
  }
  res.writeHead(200, { 'Content-Type': TIPOS[ext], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(arquivo).pipe(res);
}

/* ====================================================================== */
/* Inicialização                                                           */
/* ====================================================================== */
async function tratar(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    return estatico(req, res, url.pathname);
  }
  try {
    await api(req, res, url.pathname.slice(5).replace(/\/+$/, ''));
  } catch (e) {
    if (res.headersSent) return;
    if (e instanceof Erro || e instanceof ia.ErroIA) return responder(res, e.status || 500, { erro: e.message, detalhe: e.detalhe || undefined });
    if (/idx_usuarios_email|UNIQUE constraint failed: usuarios\.email/.test(String(e && e.message))) return responder(res, 409, { erro: 'Já existe uma pessoa com esse e-mail.' });
    console.error('[erro]', req.method, req.url, e);
    const semBanco = e && (e.code === 'CONNECTION_CLOSED' || e.code === 'CONNECT_TIMEOUT' || e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT' || e.code === 'ENOTFOUND');
    responder(res, semBanco ? 503 : 500, { erro: semBanco ? 'O banco de dados não respondeu. Confira a internet do servidor e tente de novo.' : 'Erro interno do servidor. Veja a janela do servidor para detalhes.' });
  }
}

async function iniciar() {
  if (URL_BANCO) console.log('\n  Conectando ao banco de dados na nuvem…');
  bd = await banco.abrir({ url: URL_BANCO, arquivo: ARQ_BANCO, forcar: process.env.SKILLWAY_SQLITE || '' });
  await bd.run('DELETE FROM sessoes WHERE expira_em < ?', [agora()]);
  const vazio = !Number((await bd.get('SELECT COUNT(*) AS n FROM empresas')).n);
  if (vazio) {
    if (URL_BANCO) console.log('  Banco vazio: criando as tabelas e a empresa de demonstração…');
    await semearDemo();
  }

  const servidor = http.createServer((req, res) => { tratar(req, res); });
  let porta = PORTA, tentativas = 0;
  servidor.on('error', e => {
    if (e.code === 'EADDRINUSE' && tentativas++ < 10) { porta++; servidor.listen(porta, HOST); return; }
    console.error('Não foi possível iniciar o servidor:', e.message); process.exit(1);
  });
  servidor.on('listening', async () => {
    const cfg = await cfgIA(), endereco = 'http://localhost:' + porta;
    console.log('\n  SkillWay no ar: ' + endereco);
    console.log('  Banco de dados: ' + bd.motor + '  (' + bd.destino + ')');
    if (!URL_BANCO) console.log('                  Para gravar no Supabase, feche esta janela e abra o conectar-supabase.bat.');
    console.log('  IA do Claude:   ' + (cfg.chave ? 'ativa, modelo ' + cfg.modelo : 'sem chave. Entre como RH e abra Empresa > Inteligência artificial'));
    console.log('\n  Deixe esta janela aberta enquanto usa o sistema. Para encerrar: Ctrl + C.\n');
    if (process.env.SKILLWAY_ABRIR !== '0' && HOST === '127.0.0.1') {
      const cmd = process.platform === 'win32' ? 'start "" "' + endereco + '"' : (process.platform === 'darwin' ? 'open ' : 'xdg-open ') + endereco;
      require('child_process').exec(cmd, () => {});
    }
  });
  servidor.listen(porta, HOST);

  const encerrar = () => { Promise.resolve(bd.fechar()).catch(() => {}).then(() => process.exit(0)); };
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

// Um erro inesperado em um pedido não deve derrubar o servidor inteiro.
process.on('uncaughtException', e => console.error('[erro inesperado]', e));
process.on('unhandledRejection', e => console.error('[erro inesperado]', e));

// Uso de apoio:  node servidor/servidor.js --sql   imprime o esquema do Postgres e sai.
if (process.argv.indexOf('--sql') >= 0) {
  banco.sqlPostgres().then(s => { console.log(s); process.exit(0); });
} else {
  iniciar().catch(e => {
    console.error('\n  Falha ao iniciar o SkillWay.\n  ' + (e && e.amigavel ? e.message : (e && e.stack || e)) + '\n');
    process.exit(1);
  });
}
