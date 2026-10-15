/* ==========================================================================
   SkillWay — Banco de dados
   Três motores, a mesma interface (sempre assíncrona):
     1. PostgreSQL — usado quando existe DATABASE_URL no arquivo .env. É o caso
        do Supabase: as tabelas ficam no esquema "skillway" do seu projeto.
     2. SQLite embutido no Node (node:sqlite, Node 22.5 ou mais novo), em
        dados/skillway.db — usado quando não há DATABASE_URL.
     3. SQLite em WebAssembly (pasta sqljs) — reserva para Node mais antigo.
   As consultas são escritas uma vez, com "?" nos parâmetros; o adaptador de
   Postgres troca por $1, $2... e acrescenta o esquema ao nome das tabelas.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

// Tipos: t = texto · i = inteiro · r = decimal · b = booleano · j = JSON · d = data e hora
const ESQUEMA = {
  empresas:     { nome: 't', segmento: 't', cidade: 't', porte: 'i', demo: 'b', meta: 'j', criadoEm: 'd' },
  usuarios:     { empresaId: 't', nome: 't', email: 't', cargo: 't', area: 't', unidade: 't', gestorId: 't', rh: 'b', ativo: 'b',
                  trocarSenha: 'b', curriculo: 't', admissao: 't', criadoEm: 'd', ultimoAcesso: 'd', rascunho: 'j' },
  diagnosticos: { userId: 't', data: 'd', areaAtual: 't', cargo: 't', objetivo: 't', areaAlvo: 't', notas: 'j', tempo: 't', orcamento: 't', curriculo: 't' },
  trilhas:      { userId: 't', diagId: 't', criadaEm: 'd', aprofundamento: 'b', modulos: 'j' },
  eventos:      { userId: 't', tipo: 't', data: 'd', comp: 't', ref: 't', horas: 'r', pct: 'i' },
  quizzes:      { autorId: 't', titulo: 't', comp: 't', prazo: 't', criadoEm: 'd', origem: 't', perguntas: 'j', destinatarios: 'j' },
  tentativas:   { userId: 't', quizId: 't', comp: 't', acertos: 'i', total: 'i', pct: 'i', data: 'd', pratica: 'b', detalhe: 'j' },
  mensagens:    { de: 't', para: 't', tipo: 't', titulo: 't', corpo: 't', conteudoId: 't', link: 't', quizId: 't', grupo: 't',
                  criadoEm: 'd', lidoEm: 'd', resposta: 't', respondidoEm: 'd' },
  certificados: { userId: 't', comp: 't', titulo: 't', horas: 'r', nota: 'i', emitidoEm: 'd', codigo: 't' },
  analises:     { userId: 't', tipo: 't', chave: 't', modelo: 't', criadoEm: 'd', resultado: 'j' }
};
// Tabelas de apoio do servidor (não trafegam para o navegador).
const APOIO = {
  sessoes:   'token TEXT PRIMARY KEY, usuario_id TEXT NOT NULL, criado_em DATAHORA, expira_em DATAHORA',
  config:    'chave TEXT PRIMARY KEY, valor TEXT',
  ia_uso:    'id TEXT PRIMARY KEY, empresa_id TEXT, usuario_id TEXT, tipo TEXT, modelo TEXT, tokens_entrada INTEGER, tokens_saida INTEGER, criado_em DATAHORA',
  conversas: 'id TEXT PRIMARY KEY, empresa_id TEXT, usuario_id TEXT, papel TEXT, texto TEXT, criado_em DATAHORA'
};
const TIPO_SQLITE = { t: 'TEXT', i: 'INTEGER', r: 'REAL', b: 'INTEGER', j: 'TEXT', d: 'TEXT' };
const TIPO_PG = { t: 'text', i: 'integer', r: 'double precision', b: 'boolean', j: 'jsonb', d: 'timestamptz' };
const ESQUEMA_PG = 'skillway';
const TABELAS = Object.keys(ESQUEMA).concat(Object.keys(APOIO));
const coluna = campo => campo.replace(/[A-Z]/g, m => '_' + m.toLowerCase());

/* ====================================================================== */
/* SQLite (dois motores síncronos, embrulhados em uma interface assíncrona) */
/* ====================================================================== */
function sqliteNativo(arquivo) {
  const emitir = process.emitWarning;
  process.emitWarning = function (aviso) { if (String(aviso && aviso.message || aviso).indexOf('SQLite') >= 0) return; return emitir.apply(process, arguments); };
  let DatabaseSync;
  try { ({ DatabaseSync } = require('node:sqlite')); } finally { process.emitWarning = emitir; }
  const db = new DatabaseSync(arquivo);
  const cache = new Map();
  const prep = sql => { let s = cache.get(sql); if (!s) { s = db.prepare(sql); cache.set(sql, s); } return s; };
  return {
    motor: 'SQLite nativo do Node (node:sqlite)',
    exec: sql => db.exec(sql),
    run: (sql, p) => { prep(sql).run(...(p || [])); },
    all: (sql, p) => prep(sql).all(...(p || [])).map(l => Object.assign({}, l)),
    persistir() {}, fechar() { try { db.close(); } catch (e) { /* já fechado */ } }
  };
}

async function sqliteWasm(arquivo) {
  const initSqlJs = require('./sqljs/sql-wasm.js');
  const SQL = await initSqlJs({ locateFile: f => path.join(__dirname, 'sqljs', f) });
  const db = new SQL.Database(fs.existsSync(arquivo) ? fs.readFileSync(arquivo) : undefined);
  let timer = null, aberta = false;
  const gravar = () => {
    timer = null;
    if (aberta) { agendar(); return; }
    const tmp = arquivo + '.tmp';
    try {
      fs.writeFileSync(tmp, Buffer.from(db.export()));
      fs.renameSync(tmp, arquivo);
    } catch (e) {
      // Arquivo em uso por outro programa (comum no Windows): tenta de novo em instantes.
      console.error('[banco] não foi possível gravar agora (' + e.code + '). Feche outros programas que estejam com o arquivo aberto.');
      timer = setTimeout(gravar, 1500);
    }
  };
  const agendar = () => { if (!timer) timer = setTimeout(gravar, 120); };
  return {
    motor: 'SQLite em WebAssembly (sql.js)',
    exec: sql => { db.run(sql); if (/^\s*BEGIN/i.test(sql)) aberta = true; if (/^\s*(COMMIT|ROLLBACK)/i.test(sql)) { aberta = false; agendar(); } },
    run: (sql, p) => { db.run(sql, p || []); if (!aberta) agendar(); },
    all: (sql, p) => {
      const st = db.prepare(sql), linhas = [];
      try { st.bind(p || []); while (st.step()) linhas.push(st.getAsObject()); } finally { st.free(); }
      return linhas;
    },
    persistir() { if (timer) clearTimeout(timer); aberta = false; gravar(); },
    fechar() { this.persistir(); db.close(); }
  };
}

function embrulharSqlite(s, arquivo) {
  let fila = Promise.resolve();
  const bd = {
    motor: s.motor, pg: false, destino: arquivo, arquivo,
    exec: async sql => s.exec(sql),
    run: async (sql, p) => s.run(sql, p),
    all: async (sql, p) => s.all(sql, p),
    get: async (sql, p) => s.all(sql, p)[0] || null,
    bool: v => (v ? 1 : 0),
    persistir: async () => s.persistir(),
    fechar: async () => s.fechar(),
    /** Uma transação por vez; se a função falhar, nada é gravado. */
    transacao(fn) {
      const r = fila.then(async () => {
        s.exec('BEGIN');
        try { const v = await fn(bd); s.exec('COMMIT'); return v; }
        catch (e) { try { s.exec('ROLLBACK'); } catch (e2) { /* nada aberto */ } throw e; }
      });
      fila = r.catch(() => {});
      return r;
    }
  };
  return bd;
}

/* ====================================================================== */
/* PostgreSQL (Supabase)                                                   */
/* ====================================================================== */
const RE_TABELA = new RegExp('\\b(FROM|INTO|UPDATE|JOIN|EXISTS|ON)\\s+(' + TABELAS.join('|') + ')\\b', 'g');
/** "FROM usuarios" -> "FROM skillway.usuarios" e "?" -> "$1". */
const convertidos = new Map();
function paraPostgres(sql) {
  let pronto = convertidos.get(sql);
  if (pronto) return pronto;
  let n = 0;
  pronto = sql.replace(RE_TABELA, '$1 ' + ESQUEMA_PG + '.$2').replace(/\?/g, () => '$' + (++n));
  if (convertidos.size < 500) convertidos.set(sql, pronto);
  return pronto;
}

function abrirPostgres(url) {
  const postgres = require('./vendor/postgres.js');
  let alvo;
  const invalida = msg => { const e = new Error(msg + '\n  O jeito mais fácil de acertar é abrir o conectar-supabase.bat: ele pede a senha, testa e grava o .env.'); e.amigavel = true; return e; };
  if (/\[YOUR-PASSWORD\]/i.test(url)) throw invalida('A DATABASE_URL do arquivo .env ainda está com [YOUR-PASSWORD] no lugar da senha do banco.');
  try { alvo = new URL(url); } catch (e) { throw invalida('A DATABASE_URL do arquivo .env é inválida. O formato é postgresql://usuario:senha@host:porta/postgres (símbolos como @ # / ? na senha precisam ser codificados).'); }
  const local = ['localhost', '127.0.0.1', '::1'].indexOf(alvo.hostname) >= 0;
  // Comandos preparados poupam uma ida e volta por consulta (o banco fica longe). O pooler do Supabase em
  // "modo transação" (porta 6543) não aceita comandos preparados; nas demais conexões eles ficam ligados.
  const preparar = String(alvo.port || '5432') !== '6543';
  const sql = postgres(url, {
    prepare: preparar,
    max: 8, idle_timeout: 240, connect_timeout: 20,
    ssl: local ? false : 'require',
    onnotice() {},
    connection: { application_name: 'skillway' },
    types: { bigint: { to: 20, from: [20], parse: x => Number(x), serialize: x => String(x) } }
  });
  const normal = linhas => Array.from(linhas).map(l => {
    const o = {};
    Object.keys(l).forEach(k => { o[k] = l[k] instanceof Date ? l[k].toISOString() : l[k]; });
    return o;
  });
  const interface_ = q => ({
    pg: true,
    exec: async texto => { await q.unsafe(paraPostgres(texto)); },
    // "avulso" marca comandos montados na hora (lotes de tamanho variável), que não vale a pena deixar preparados.
    run: async (texto, p, avulso) => { await q.unsafe(paraPostgres(texto), p || [], { prepare: preparar && !avulso }); },
    all: async (texto, p, avulso) => normal(await q.unsafe(paraPostgres(texto), p || [], { prepare: preparar && !avulso })),
    get: async (texto, p) => normal(await q.unsafe(paraPostgres(texto), p || [], { prepare: preparar }))[0] || null,
    bool: v => !!v
  });
  const bd = interface_(sql);
  bd.motor = alvo.hostname.indexOf('supabase') >= 0 ? 'PostgreSQL no Supabase' : 'PostgreSQL';
  bd.destino = alvo.hostname + ':' + (alvo.port || 5432) + alvo.pathname + ' · esquema ' + ESQUEMA_PG;
  bd.persistir = async () => {};
  bd.fechar = async () => { await sql.end({ timeout: 3 }); };
  bd.transacao = fn => sql.begin(tx => fn(interface_(tx)));
  return bd;
}

/* ====================================================================== */
/* Abertura e criação das tabelas                                          */
/* ====================================================================== */
async function abrir(opcoes) {
  let bd;
  if (opcoes.url) {
    bd = abrirPostgres(opcoes.url);
    try { await bd.get('SELECT 1 AS ok'); }
    catch (e) { await bd.fechar().catch(() => {}); throw explicarErroPostgres(e); }
  } else {
    fs.mkdirSync(path.dirname(opcoes.arquivo), { recursive: true });
    let s = null;
    if (opcoes.forcar !== 'wasm') {
      try { s = sqliteNativo(opcoes.arquivo); } catch (e) { if (opcoes.forcar === 'nativo') throw e; }
    }
    if (!s) s = await sqliteWasm(opcoes.arquivo);
    bd = embrulharSqlite(s, opcoes.arquivo);
  }
  await criarTabelas(bd);
  return bd;
}

function explicarErroPostgres(e) {
  const m = String(e && e.message || e), c = e && e.code;
  let dica = 'Confira a DATABASE_URL no arquivo .env (ou abra o conectar-supabase.bat para refazer a conexão).';
  if (c === 'ENOTFOUND' || c === 'EAI_AGAIN') dica = 'O endereço do banco não foi encontrado. Confira a internet deste computador e o host da DATABASE_URL.';
  else if (c === 'ETIMEDOUT' || c === 'CONNECT_TIMEOUT' || c === 'ENETUNREACH' || c === 'EHOSTUNREACH') dica = 'Não houve resposta do banco. No Supabase, use a string do "Session pooler" (a conexão direta só funciona em redes com IPv6) e veja no painel se o projeto não está pausado.';
  else if (c === '28P01' || /password authentication failed/i.test(m)) dica = 'Usuário ou senha do banco incorretos. No pooler do Supabase o usuário tem o formato postgres.CODIGO-DO-PROJETO, e a senha é a do banco (Database password), não a da sua conta.';
  else if (/tenant or user not found/i.test(m)) dica = 'O Supabase não reconheceu o projeto. Copie de novo a string do "Session pooler" no botão Connect do painel.';
  else if (c === 'ECONNREFUSED') dica = 'A conexão foi recusada. Confira host e porta (5432 no Session pooler).';
  const erro = new Error('Não foi possível conectar ao PostgreSQL: ' + m + '\n  ' + dica);
  erro.amigavel = true;
  return erro;
}

async function criarTabelas(bd) {
  const tipos = bd.pg ? TIPO_PG : TIPO_SQLITE;
  const comandos = [];
  if (bd.pg) comandos.push('CREATE SCHEMA IF NOT EXISTS ' + ESQUEMA_PG);
  Object.keys(ESQUEMA).forEach(tabela => {
    const campos = ESQUEMA[tabela];
    const cols = ['id TEXT PRIMARY KEY'];
    if (tabela !== 'empresas' && !campos.empresaId) cols.push('empresa_id TEXT NOT NULL');
    Object.keys(campos).forEach(c => cols.push(coluna(c) + ' ' + tipos[campos[c]]));
    if (tabela === 'usuarios') cols.push('senha_hash TEXT');
    cols.push('extra ' + tipos.j);
    comandos.push('CREATE TABLE IF NOT EXISTS ' + tabela + ' (' + cols.join(', ') + ')');
    if (tabela !== 'empresas') comandos.push('CREATE INDEX IF NOT EXISTS idx_' + tabela + '_empresa ON ' + tabela + ' (empresa_id)');
    if (campos.userId) comandos.push('CREATE INDEX IF NOT EXISTS idx_' + tabela + '_user ON ' + tabela + ' (user_id)');
  });
  comandos.push('CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email)');
  Object.keys(APOIO).forEach(t => comandos.push('CREATE TABLE IF NOT EXISTS ' + t + ' (' + APOIO[t].replace(/DATAHORA/g, tipos.d) + ')'));
  comandos.push('CREATE INDEX IF NOT EXISTS idx_conversas_user ON conversas (usuario_id, criado_em)');
  if (bd.pg) {
    // No Supabase, tabelas sem RLS podem ser lidas pela API pública. O esquema "skillway" não é exposto por essa API;
    // ligar o RLS (sem políticas) é uma segunda trava: só o servidor, que entra como dono das tabelas, acessa os dados.
    TABELAS.forEach(t => comandos.push('ALTER TABLE IF EXISTS ' + t + ' ENABLE ROW LEVEL SECURITY'));
    await bd.exec(comandos.join(';\n'));     // tudo em uma única ida ao banco
    return;
  }
  for (const c of comandos) await bd.exec(c);
}

/** SQL de referência do esquema no Postgres (documentação; o servidor cria as tabelas sozinho). */
function sqlPostgres() {
  const linhas = [];
  const falso = { pg: true, exec: async c => { linhas.push(paraPostgres(c) + ';'); } };
  return criarTabelas(falso).then(() => linhas.join('\n'));
}

/* ====================================================================== */
/* Conversão objeto <-> linha                                              */
/* ====================================================================== */
function paraLinha(bd, tabela, obj, empresaId) {
  const campos = ESQUEMA[tabela], linha = { id: String(obj.id) }, extra = {};
  if (tabela !== 'empresas' && !campos.empresaId) linha.empresa_id = empresaId;
  Object.keys(campos).forEach(c => {
    const tipo = campos[c];
    let v = obj[c];
    if (v === undefined || v === null) v = null;
    else if (tipo === 'b') v = bd.bool(v);
    else if (tipo === 'j') v = bd.pg ? v : JSON.stringify(v);
    else if (tipo === 'i') { v = parseInt(v, 10); if (isNaN(v)) v = null; }
    else if (tipo === 'r') { v = Number(v); if (isNaN(v)) v = null; }
    else if (tipo === 'd') { v = String(v); if (!v || isNaN(Date.parse(v))) v = null; }
    else v = String(v).replace(/\u0000/g, '');
    if (tipo === 'b' && v === null) v = bd.bool(false);
    linha[coluna(c)] = v;
  });
  if (campos.empresaId) linha.empresa_id = empresaId;
  Object.keys(obj).forEach(k => {
    if (k === 'id' || k === 'empresaId' || k === 'senha' || campos[k]) return;
    extra[k] = obj[k];
  });
  linha.extra = Object.keys(extra).length ? (bd.pg ? extra : JSON.stringify(extra)) : null;
  return linha;
}

function json(v) {
  if (v == null) return null;
  if (typeof v !== 'string') return v;          // Postgres já devolve o JSON convertido
  try { return JSON.parse(v); } catch (e) { return null; }
}
function paraObjeto(tabela, linha) {
  const campos = ESQUEMA[tabela], obj = { id: linha.id };
  if (tabela !== 'empresas') obj.empresaId = linha.empresa_id;
  Object.keys(campos).forEach(c => {
    if (c === 'empresaId') return;
    const v = linha[coluna(c)], tipo = campos[c];
    if (tipo === 'b') obj[c] = !!v;
    else if (tipo === 'j') obj[c] = json(v);
    else obj[c] = v == null ? null : v;
  });
  const extra = json(linha.extra);
  if (extra && typeof extra === 'object') Object.assign(obj, extra);
  return obj;
}

async function gravar(bd, tabela, obj, empresaId) {
  const linha = paraLinha(bd, tabela, obj, empresaId), cols = Object.keys(linha);
  const atualiza = cols.filter(c => c !== 'id').map(c => c + ' = excluded.' + c).join(', ');
  await bd.run('INSERT INTO ' + tabela + ' (' + cols.join(', ') + ') VALUES (' + cols.map(() => '?').join(', ') + ') ON CONFLICT(id) DO UPDATE SET ' + atualiza,
    cols.map(c => linha[c]));
}
/** Grava vários registros da mesma tabela em poucos comandos (um INSERT com várias linhas). */
async function gravarVarios(bd, tabela, objs, empresaId) {
  if (!objs.length) return;
  if (objs.length === 1) return gravar(bd, tabela, objs[0], empresaId);
  const unicos = new Map();                    // o mesmo id duas vezes no lote: vale o último
  objs.forEach(o => unicos.set(String(o.id), o));
  const linhas = Array.from(unicos.values()).map(o => paraLinha(bd, tabela, o, empresaId));
  const cols = Object.keys(linhas[0]);
  const atualiza = cols.filter(c => c !== 'id').map(c => c + ' = excluded.' + c).join(', ');
  const umaLinha = '(' + cols.map(() => '?').join(', ') + ')';
  const porVez = Math.max(1, Math.floor(900 / cols.length));   // o SQLite antigo aceita até 999 parâmetros por comando
  for (let i = 0; i < linhas.length; i += porVez) {
    const parte = linhas.slice(i, i + porVez), valores = [];
    parte.forEach(l => cols.forEach(c => valores.push(l[c])));
    await bd.run('INSERT INTO ' + tabela + ' (' + cols.join(', ') + ') VALUES ' + parte.map(() => umaLinha).join(', ') +
      ' ON CONFLICT(id) DO UPDATE SET ' + atualiza, valores, true);
  }
}
/** Busca vários registros pelo id de uma vez. Devolve um Map id -> objeto. */
async function buscarVarios(bd, tabela, ids) {
  const achados = new Map(), lista = Array.from(new Set(ids.map(String)));
  for (let i = 0; i < lista.length; i += 400) {
    const parte = lista.slice(i, i + 400);
    const linhas = await bd.all('SELECT * FROM ' + tabela + ' WHERE id IN (' + parte.map(() => '?').join(', ') + ')', parte, parte.length > 1);
    linhas.forEach(l => achados.set(l.id, paraObjeto(tabela, l)));
  }
  return achados;
}
async function apagarVarios(bd, tabela, ids) {
  const lista = Array.from(new Set(ids.map(String)));
  for (let i = 0; i < lista.length; i += 400) {
    const parte = lista.slice(i, i + 400);
    await bd.run('DELETE FROM ' + tabela + ' WHERE id IN (' + parte.map(() => '?').join(', ') + ')', parte, parte.length > 1);
  }
}
async function buscar(bd, tabela, id) {
  const l = await bd.get('SELECT * FROM ' + tabela + ' WHERE id = ?', [id]);
  return l ? paraObjeto(tabela, l) : null;
}
async function listar(bd, tabela, empresaId) {
  const sql = tabela === 'empresas' ? 'SELECT * FROM empresas WHERE id = ?' : 'SELECT * FROM ' + tabela + ' WHERE empresa_id = ?';
  return (await bd.all(sql, [empresaId])).map(l => paraObjeto(tabela, l));
}
async function apagar(bd, tabela, id) { await bd.run('DELETE FROM ' + tabela + ' WHERE id = ?', [id]); }

module.exports = { ESQUEMA, ESQUEMA_PG, abrir, gravar, gravarVarios, buscar, buscarVarios, listar, apagar, apagarVarios, objeto: paraObjeto, coluna, sqlPostgres, COLECOES: Object.keys(ESQUEMA) };
