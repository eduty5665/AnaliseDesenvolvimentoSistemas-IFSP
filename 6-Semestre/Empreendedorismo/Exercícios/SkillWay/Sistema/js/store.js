/* ==========================================================================
   SkillWay — Camada de dados
   Banco local (localStorage) com empresas, pessoas, hierarquia, diagnósticos,
   trilhas, quizzes, mensagens e certificados. Tudo fica neste navegador.
   ========================================================================== */
(function () {
  'use strict';

  var CHAVE = 'skillway.db.v2';
  var CHAVE_SESSAO = 'skillway.sessao.v2';
  var VERSAO = 2;
  var memoria = {}; // usado se o navegador bloquear o localStorage

  var ls = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return memoria[k] || null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { memoria[k] = v; } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { delete memoria[k]; } }
  };

  /* ---------- SHA-256 (senhas não ficam em texto puro) ---------- */
  function sha256(texto) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var s = unescape(encodeURIComponent(texto));
    var pot = Math.pow, max = pot(2, 32), i, j, res = '';
    var palavras = [], bits = s.length * 8;
    var hash = sha256.h = sha256.h || [], k = sha256.k = sha256.k || [];
    var primos = k.length, comp = {};
    for (var cand = 2; primos < 64; cand++) {
      if (!comp[cand]) {
        for (i = 0; i < 313; i += cand) comp[i] = cand;
        hash[primos] = (pot(cand, 0.5) * max) | 0;
        k[primos++] = (pot(cand, 1 / 3) * max) | 0;
      }
    }
    hash = hash.slice(0, 8);
    s += '\x80';
    while (s.length % 64 - 56) s += '\x00';
    for (i = 0; i < s.length; i++) {
      j = s.charCodeAt(i);
      palavras[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    palavras[palavras.length] = (bits / max) | 0;
    palavras[palavras.length] = bits;
    for (j = 0; j < palavras.length;) {
      var w = palavras.slice(j, j += 16), antigo = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ (~e & hash[6])) + k[i] +
          (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + antigo[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        res += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return res;
  }
  function hashSenha(senha) { return sha256('skillway::' + senha); }

  /* ---------- Utilidades ---------- */
  var contador = 0;
  function uid(prefixo) {
    contador++;
    return (prefixo || 'id') + '_' + Date.now().toString(36) + contador.toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function agora() { return new Date().toISOString(); }
  function diasAtras(n, hora) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hora == null ? 10 : hora, 0, 0, 0);
    return d.toISOString();
  }
  function diasDesde(iso) {
    if (!iso) return null;
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  }
  function semAcento(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function vazio() {
    return {
      versao: VERSAO, criadoEm: agora(),
      empresas: [], usuarios: [], diagnosticos: [], trilhas: [], eventos: [],
      quizzes: [], tentativas: [], mensagens: [], certificados: []
    };
  }

  var db = null;

  /* ---------- Modo servidor: conversa com a API e sincronização ---------- */
  var modo = 'local', sessaoId = null, infoIA = { ativa: false }, motor = '', demoServidor = null;
  var sincronizado = {}, fila = Promise.resolve(), timerEnvio = null, pendentesSenha = [], ultimaCarga = 0;
  var SINCRONIZAVEIS = ['empresas', 'usuarios', 'diagnosticos', 'trilhas', 'eventos', 'quizzes', 'tentativas', 'mensagens', 'certificados'];

  function pedir(metodo, rota, corpo, manterVivo) {
    var opcoes = { method: metodo, credentials: 'same-origin', headers: {} };
    if (corpo !== undefined) { opcoes.headers['Content-Type'] = 'application/json'; opcoes.body = JSON.stringify(corpo); }
    if (manterVivo) opcoes.keepalive = true;
    return fetch('api/' + rota, opcoes).then(function (resp) {
      return resp.json().catch(function () { return {}; }).then(function (dados) {
        if (!resp.ok) {
          var erro = new Error(dados.erro || 'O servidor não respondeu como esperado (' + resp.status + ').');
          erro.status = resp.status; erro.detalhe = dados.detalhe;
          throw erro;
        }
        return dados;
      });
    }, function () {
      var erro = new Error('Não foi possível falar com o servidor. Confira se a janela do servidor continua aberta.');
      erro.status = 0;
      throw erro;
    });
  }
  function fotografar() {
    sincronizado = {};
    SINCRONIZAVEIS.forEach(function (c) {
      var mapa = sincronizado[c] = {};
      (db[c] || []).forEach(function (o) { mapa[o.id] = JSON.stringify(o); });
    });
  }
  function aplicar(usuarioId, estado) {
    db = estado;
    SINCRONIZAVEIS.concat(['analises']).forEach(function (c) { if (!Array.isArray(db[c])) db[c] = []; });
    db.demo = demoServidor;
    sessaoId = usuarioId;
    ultimaCarga = Date.now();
    fotografar();
  }
  function encerrarSessaoLocal() {
    sessaoId = null; clearTimeout(timerEnvio); timerEnvio = null; pendentesSenha = [];
    db = vazio(); db.demo = demoServidor; sincronizado = {};
  }
  /** Compara o estado atual com o último enviado e manda só o que mudou. */
  function enviar(manterVivo) {
    timerEnvio = null;
    if (!sessaoId) return;
    var gravar = {}, apagar = {}, mudou = false;
    SINCRONIZAVEIS.forEach(function (c) {
      var antes = sincronizado[c] || {}, depois = {};
      (db[c] || []).forEach(function (o) {
        var j = JSON.stringify(o);
        depois[o.id] = j;
        if (antes[o.id] !== j) { (gravar[c] = gravar[c] || []).push(JSON.parse(j)); mudou = true; }
      });
      Object.keys(antes).forEach(function (id) {
        if (!(id in depois)) { (apagar[c] = apagar[c] || []).push(id); mudou = true; }
      });
      sincronizado[c] = depois;
    });
    var senhas = pendentesSenha.splice(0);
    if (!mudou && !senhas.length) return;
    fila = fila.then(function () {
      return mudou ? pedir('POST', 'sincronizar', { gravar: gravar, apagar: apagar }, manterVivo) : null;
    }).then(function () {
      return senhas.reduce(function (p, s) { return p.then(function () { return pedir('POST', 'senha', s); }); }, Promise.resolve());
    }).catch(function (e) {
      // O servidor recusou ou caiu: avisa e volta ao que está gravado no banco.
      if (e.status === 401) { encerrarSessaoLocal(); if (Store.aoFalhar) Store.aoFalhar('Sua sessão terminou. Entre de novo.', true); return; }
      return pedir('GET', 'estado').then(function (r) { aplicar(r.usuario, r.estado); }, function () {}).then(function () {
        if (Store.aoFalhar) Store.aoFalhar(e.message || 'Não foi possível salvar no servidor.', false);
      });
    });
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pagehide', function () { if (modo === 'servidor' && timerEnvio) { clearTimeout(timerEnvio); enviar(true); } });
  }

  var Store = {
    sha256: sha256, uid: uid, agora: agora, diasAtras: diasAtras, diasDesde: diasDesde, semAcento: semAcento,
    hashSenha: hashSenha,

    get db() { return db; },
    /** Troca o banco em memória (usado pelo servidor e pelo modo servidor do navegador). */
    usar: function (novo) { db = novo; },
    novoBanco: vazio,

    /* ---------- Modo de funcionamento ---------- */
    /** true quando o sistema foi aberto pelo servidor (banco de dados + IA). */
    get servidor() { return modo === 'servidor'; },
    get ia() { return infoIA; },
    get motor() { return motor; },

    /** Descobre o modo e carrega os dados. Devolve uma Promise. */
    iniciar: function () {
      var self = this;
      if (typeof location === 'undefined' || location.protocol.indexOf('http') !== 0 || typeof fetch !== 'function') {
        window.Seed.iniciar();
        return Promise.resolve();
      }
      return pedir('GET', 'sessao').then(function (r) {
        if (!r || !r.servidor) throw new Error('sem servidor');
        modo = 'servidor'; infoIA = r.ia || { ativa: false }; motor = r.motor || ''; demoServidor = r.demo;
        if (r.estado) aplicar(r.usuario, r.estado);
        else { db = vazio(); db.demo = demoServidor; sessaoId = null; }
      }).catch(function () {
        modo = 'local';
        window.Seed.iniciar();
      });
    },

    carregar: function () {
      var bruto = ls.get(CHAVE);
      if (bruto) {
        try {
          var lido = JSON.parse(bruto);
          if (lido && lido.versao === VERSAO) { db = lido; return false; }
        } catch (e) { /* banco corrompido: recria */ }
      }
      db = vazio();
      return true; // sinaliza que o banco é novo (o seed roda em seguida)
    },

    /** Grava as alterações: no navegador (modo local) ou no banco do servidor. */
    salvar: function () {
      if (modo !== 'servidor') { ls.set(CHAVE, JSON.stringify(db)); return; }
      if (!sessaoId) return;
      clearTimeout(timerEnvio);
      timerEnvio = setTimeout(enviar, 350);
    },
    /** Promise que termina quando tudo o que estava pendente chegou ao servidor. */
    ocioso: function () {
      if (modo === 'servidor' && timerEnvio) { clearTimeout(timerEnvio); enviar(); }
      return fila;
    },
    /** Busca no servidor a versão mais recente dos dados (outras pessoas podem ter alterado). */
    recarregar: function () {
      if (modo !== 'servidor' || !sessaoId) return Promise.resolve();
      return this.ocioso().then(function () { return pedir('GET', 'estado'); }).then(function (r) {
        infoIA = r.ia || infoIA;
        aplicar(r.usuario, r.estado);
      }).catch(function (e) { if (e.status === 401) encerrarSessaoLocal(); });
    },
    velho: function (ms) { return Date.now() - ultimaCarga > ms; },
    /** Chamada direta à API do servidor (usada pelas telas de IA). */
    api: function (metodo, rota, corpo) {
      if (modo !== 'servidor') return Promise.reject(new Error('Disponível apenas com o servidor ligado.'));
      return this.ocioso().then(function () { return pedir(metodo, rota, corpo); });
    },
    definirIA: function (info) { infoIA = info; },
    /** Guarda no estado local uma análise devolvida pela IA (o servidor já salvou no banco). */
    guardarAnalise: function (a) {
      db.analises = (db.analises || []).filter(function (x) { return x.id !== a.id; });
      db.analises.push(a);
    },
    analise: function (id) { return (db.analises || []).filter(function (a) { return a.id === id; })[0] || null; },

    zerar: function () { db = vazio(); ls.del(CHAVE_SESSAO); },
    exportar: function () {
      var copia = JSON.parse(JSON.stringify(db));
      delete copia.publico; delete copia.demo;
      return JSON.stringify(copia, null, 2);
    },
    importar: function (texto) {
      var lido = JSON.parse(texto);
      if (!lido || lido.versao !== VERSAO || !Array.isArray(lido.usuarios) || !Array.isArray(lido.empresas)) {
        throw new Error('Este arquivo não é um backup do SkillWay.');
      }
      db = lido;
      this.salvar();
      ls.del(CHAVE_SESSAO);
    },

    /* ---------- Sessão ---------- */
    atual: function () {
      var id = modo === 'servidor' ? sessaoId : ls.get(CHAVE_SESSAO);
      var u = id ? this.usuario(id) : null;
      return (u && u.ativo) ? u : null;
    },
    /** Devolve uma Promise com { ok, usuario } ou { ok: false, erro }. */
    entrar: function (email, senha) {
      var self = this;
      if (modo === 'servidor') {
        return pedir('POST', 'entrar', { email: email, senha: senha }).then(function (r) {
          infoIA = r.ia || infoIA;
          aplicar(r.usuario, r.estado);
          return { ok: true, usuario: self.atual() };
        }).catch(function (e) { return { ok: false, erro: e.message }; });
      }
      var u = this.porEmail(email);
      if (!u || u.senha !== hashSenha(senha)) return Promise.resolve({ ok: false, erro: 'E-mail ou senha incorretos.' });
      if (!u.ativo) return Promise.resolve({ ok: false, erro: 'Este acesso foi desativado. Fale com o RH da sua empresa.' });
      ls.set(CHAVE_SESSAO, u.id);
      u.ultimoAcesso = agora();
      this.salvar();
      return Promise.resolve({ ok: true, usuario: u });
    },
    sair: function () {
      if (modo !== 'servidor') { ls.del(CHAVE_SESSAO); return Promise.resolve(); }
      return this.ocioso().then(function () { return pedir('POST', 'sair'); }).catch(function () {}).then(encerrarSessaoLocal);
    },
    /** Troca a própria senha. No primeiro acesso (senha provisória) a senha atual não é exigida. */
    trocarMinhaSenha: function (atual, nova) {
      var u = this.atual();
      if (!u) return Promise.resolve({ ok: false, erro: 'Entre de novo.' });
      if (String(nova || '').length < 6) return Promise.resolve({ ok: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' });
      if (modo === 'servidor') {
        return this.ocioso().then(function () { return pedir('POST', 'senha', { atual: atual || '', nova: nova }); }).then(function () {
          u.trocarSenha = false;
          (sincronizado.usuarios || {})[u.id] = JSON.stringify(u);
          return { ok: true };
        }).catch(function (e) { return { ok: false, erro: e.message }; });
      }
      if (!u.trocarSenha && hashSenha(atual || '') !== u.senha) return Promise.resolve({ ok: false, erro: 'A senha atual não confere.' });
      u.senha = hashSenha(nova); u.trocarSenha = false;
      this.salvar();
      return Promise.resolve({ ok: true });
    },

    /* ---------- Consultas ---------- */
    empresa: function (id) { return db.empresas.filter(function (e) { return e.id === id; })[0] || null; },
    usuario: function (id) { return db.usuarios.filter(function (u) { return u.id === id; })[0] || null; },
    porEmail: function (email) {
      var alvo = String(email || '').trim().toLowerCase();
      return db.usuarios.filter(function (u) { return u.email === alvo; })[0] || null;
    },
    pessoas: function (empresaId, incluirInativos) {
      return db.usuarios.filter(function (u) { return u.empresaId === empresaId && (incluirInativos || u.ativo); });
    },
    diretos: function (userId) {
      return db.usuarios.filter(function (u) { return u.gestorId === userId && u.ativo; });
    },
    abaixo: function (userId) {
      var saida = [], fila = [userId], vistos = {};
      vistos[userId] = true;
      while (fila.length) {
        var atual = fila.shift();
        this.diretos(atual).forEach(function (u) {
          if (!vistos[u.id]) { vistos[u.id] = true; saida.push(u); fila.push(u.id); }
        });
      }
      return saida;
    },
    /** Pessoas que o usuário administra: RH vê a empresa toda; gestor vê quem está abaixo dele. */
    equipe: function (user) {
      if (!user) return [];
      if (user.rh) return this.pessoas(user.empresaId).filter(function (u) { return u.id !== user.id; });
      return this.abaixo(user.id);
    },
    ehAdmin: function (user) { return !!user && (user.rh || this.diretos(user.id).length > 0); },
    podeGerir: function (user, alvoId) {
      if (!user || user.id === alvoId) return false;
      return this.equipe(user).some(function (u) { return u.id === alvoId; });
    },
    cadeiaAcima: function (userId) {
      var saida = [], u = this.usuario(userId), guarda = 0;
      while (u && u.gestorId && guarda++ < 50) {
        u = this.usuario(u.gestorId);
        if (u) saida.push(u);
      }
      return saida;
    },

    /* ---------- Pessoas ---------- */
    novaPessoa: function (dados) {
      var email = String(dados.email || '').trim().toLowerCase();
      if (!dados.nome || !String(dados.nome).trim()) throw new Error('Informe o nome.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido: ' + (dados.email || '(vazio)'));
      if (this.porEmail(email)) throw new Error('Já existe uma pessoa com o e-mail ' + email + '.');
      var u = {
        id: uid('u'), empresaId: dados.empresaId,
        nome: String(dados.nome).trim(), email: email,
        trocarSenha: !!dados.trocarSenha,
        cargo: String(dados.cargo || '').trim() || 'Colaborador(a)',
        area: dados.area || 'administrativo',
        unidade: String(dados.unidade || '').trim(),
        gestorId: dados.gestorId || null,
        rh: !!dados.rh, ativo: true,
        curriculo: dados.curriculo || '',
        admissao: dados.admissao || agora().slice(0, 10),
        criadoEm: dados.criadoEm || agora(), ultimoAcesso: null
      };
      // No modo servidor a senha nunca fica no navegador: segue para o servidor depois do cadastro.
      if (modo === 'servidor') pendentesSenha.push({ userId: u.id, nova: dados.senha || 'skillway123', trocar: !!dados.trocarSenha });
      else u.senha = hashSenha(dados.senha || 'skillway123');
      db.usuarios.push(u);
      return u;
    },
    atualizarPessoa: function (id, mudancas) {
      var u = this.usuario(id);
      if (!u) throw new Error('Pessoa não encontrada.');
      if (mudancas.email != null) {
        var email = String(mudancas.email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido.');
        var outro = this.porEmail(email);
        if (outro && outro.id !== id) throw new Error('Já existe uma pessoa com esse e-mail.');
        mudancas.email = email;
      }
      if (mudancas.gestorId) {
        if (mudancas.gestorId === id) throw new Error('Uma pessoa não pode ser gestora de si mesma.');
        var abaixo = this.abaixo(id).map(function (x) { return x.id; });
        if (abaixo.indexOf(mudancas.gestorId) >= 0) throw new Error('O gestor escolhido está abaixo desta pessoa na hierarquia.');
      }
      Object.keys(mudancas).forEach(function (k) { u[k] = mudancas[k]; });
      return u;
    },
    /** Define a senha de outra pessoa (senha provisória dada pelo gestor ou RH). */
    definirSenha: function (id, senha, trocar) {
      var u = this.usuario(id);
      u.trocarSenha = !!trocar;
      if (modo === 'servidor') pendentesSenha.push({ userId: id, nova: senha, trocar: !!trocar });
      else u.senha = hashSenha(senha);
    },
    senhaProvisoria: function () {
      var letras = 'abcdefghjkmnpqrstuvwxyz', n = '';
      for (var i = 0; i < 4; i++) n += letras.charAt(Math.floor(Math.random() * letras.length));
      return n + Math.floor(1000 + Math.random() * 9000);
    },
    /** Cria a empresa e o primeiro acesso (RH) e já entra. Devolve uma Promise. */
    cadastrarEmpresa: function (d) {
      var self = this;
      if (modo === 'servidor') {
        return pedir('POST', 'cadastro', d).then(function (r) {
          infoIA = r.ia || infoIA;
          aplicar(r.usuario, r.estado);
          return { usuario: self.atual() };
        });
      }
      try {
        if (!d.empresa || !d.empresa.trim()) throw new Error('Informe o nome da empresa.');
        if (!d.nome || !d.nome.trim()) throw new Error('Informe o seu nome.');
        if (!d.senha || d.senha.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        if (this.porEmail(d.email)) throw new Error('Já existe uma conta com esse e-mail. Entre com ela ou use outro e-mail.');
        var emp = {
          id: uid('e'), nome: d.empresa.trim(), segmento: d.segmento || 'Serviços', cidade: (d.cidade || '').trim(),
          porte: parseInt(d.porte, 10) || 0, criadoEm: agora(), meta: null
        };
        var u = this.novaPessoa({
          empresaId: emp.id, nome: d.nome, email: d.email, senha: d.senha, cargo: d.cargo || 'Responsável de RH',
          area: 'rh', rh: true, unidade: 'Matriz'
        });
        db.empresas.push(emp);
        ls.set(CHAVE_SESSAO, u.id);
        this.salvar();
        return Promise.resolve({ empresa: emp, usuario: u });
      } catch (e) { return Promise.reject(e); }
    },

    /* ---------- Registros por pessoa ---------- */
    diagnosticos: function (userId) {
      return db.diagnosticos.filter(function (d) { return d.userId === userId; })
        .sort(function (a, b) { return a.data < b.data ? -1 : 1; });
    },
    diagnostico: function (userId) { var l = this.diagnosticos(userId); return l[l.length - 1] || null; },
    trilha: function (userId) {
      var l = db.trilhas.filter(function (t) { return t.userId === userId; });
      return l[l.length - 1] || null;
    },
    eventos: function (userId) {
      return db.eventos.filter(function (e) { return e.userId === userId; })
        .sort(function (a, b) { return a.data < b.data ? -1 : 1; });
    },
    evento: function (userId, tipo, extra) {
      var ev = { id: uid('ev'), userId: userId, tipo: tipo, data: agora() };
      Object.keys(extra || {}).forEach(function (k) { if (extra[k] !== undefined) ev[k] = extra[k]; });
      db.eventos.push(ev);
      return ev;
    },
    certificados: function (userId) {
      return db.certificados.filter(function (c) { return c.userId === userId; })
        .sort(function (a, b) { return a.emitidoEm < b.emitidoEm ? 1 : -1; });
    },
    tentativas: function (userId) {
      return db.tentativas.filter(function (t) { return t.userId === userId; })
        .sort(function (a, b) { return a.data < b.data ? -1 : 1; });
    },

    /* ---------- Mensagens ---------- */
    enviarMensagem: function (m) {
      var msg = {
        id: uid('m'), empresaId: m.empresaId, de: m.de || null, para: m.para, tipo: m.tipo,
        titulo: m.titulo, corpo: m.corpo || '', conteudoId: m.conteudoId || null, link: m.link || '',
        quizId: m.quizId || null, grupo: m.grupo || null, criadoEm: m.criadoEm || agora(),
        lidoEm: null, resposta: '', respondidoEm: null
      };
      db.mensagens.push(msg);
      return msg;
    },
    caixa: function (userId) {
      return db.mensagens.filter(function (m) { return m.para === userId; })
        .sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; });
    },
    enviadas: function (userId) {
      return db.mensagens.filter(function (m) { return m.de === userId; })
        .sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; });
    },
    naoLidas: function (userId) {
      return db.mensagens.filter(function (m) { return m.para === userId && !m.lidoEm; }).length;
    },

    /* ---------- Quizzes criados por administradores ---------- */
    quiz: function (id) { return db.quizzes.filter(function (q) { return q.id === id; })[0] || null; },
    quizzesPara: function (userId) {
      return db.quizzes.filter(function (q) { return q.destinatarios.indexOf(userId) >= 0; })
        .sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; });
    },
    quizzesDe: function (userId) {
      return db.quizzes.filter(function (q) { return q.autorId === userId; })
        .sort(function (a, b) { return a.criadoEm < b.criadoEm ? 1 : -1; });
    },
    tentativaDoQuiz: function (quizId, userId) {
      var l = db.tentativas.filter(function (t) { return t.quizId === quizId && t.userId === userId; });
      return l[l.length - 1] || null;
    },
    quizzesPendentes: function (userId) {
      var self = this;
      return this.quizzesPara(userId).filter(function (q) { return !self.tentativaDoQuiz(q.id, userId); });
    }
  };

  window.Store = Store;
})();
