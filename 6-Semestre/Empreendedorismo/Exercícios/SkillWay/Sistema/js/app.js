/* ==========================================================================
   SkillWay — Roteador e estrutura da aplicação (app.html)
   Rotas por hash (#/rota?param=valor): funciona pelo servidor (banco + IA) e
   também abrindo o arquivo direto (modo local).
   ========================================================================== */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic;

  var MENU_PESSOAL = [
    ['inicio', 'Início', 'inicio'],
    ['diagnostico', 'Diagnóstico', 'diagnostico'],
    ['trilha', 'Minha trilha', 'trilha'],
    ['mentor', 'Mentor IA', 'faisca'],
    ['perfil', 'Meu perfil', 'perfil'],
    ['quizzes', 'Quizzes', 'quiz'],
    ['certificados', 'Certificados', 'certificado'],
    ['mensagens', 'Mensagens', 'mensagens']
  ];
  var MENU_GESTAO = [
    ['gestao', 'Visão geral', 'painel'],
    ['equipe', 'Minha equipe', 'equipe'],
    ['relatorios', 'Relatórios', 'relatorios'],
    ['engajamento', 'Sugestões e quizzes', 'faisca'],
    ['benchmarks', 'Benchmarks', 'benchmark']
  ];
  // Rotas "filhas" marcam o item pai no menu.
  var PAI = { quiz: 'quizzes', certificado: 'certificados', pessoa: 'equipe' };

  var App = {
    rota: null, params: {},

    lerHash: function () {
      var h = (location.hash || '').replace(/^#\/?/, '');
      var partes = h.split('?');
      var params = {};
      (partes[1] || '').split('&').forEach(function (par) {
        if (!par) return;
        var kv = par.split('=');
        params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
      return { nome: partes[0] || '', params: params };
    },
    ir: function (destino) {
      var alvo = '#/' + destino.replace(/^#?\/?/, '');
      if (location.hash === alvo) this.render();
      else location.hash = alvo;
    },
    atualizar: function () { this.render(true); },

    /** Liga cliques em [data-acao="nome"] às funções do mapa. */
    acoes: function (el, mapa) {
      el.addEventListener('click', function (e) {
        var alvo = e.target.closest('[data-acao]');
        if (!alvo || !el.contains(alvo)) return;
        var fn = mapa[alvo.getAttribute('data-acao')];
        if (fn) { if (alvo.tagName !== 'A' || alvo.getAttribute('href') === '#') e.preventDefault(); fn(alvo, e); }
      });
    },

    render: function (manterRolagem) {
      var r = this.lerHash(), user = Store.atual();
      var raiz = document.getElementById('app');
      var publicas = { entrar: 1, cadastro: 1 };

      if (!user && !publicas[r.nome]) { location.replace('#/entrar'); return; }
      if (user && (publicas[r.nome] || r.nome === '')) { location.replace(user.trocarSenha ? '#/nova-senha' : '#/' + this.inicial(user)); return; }
      if (user && user.trocarSenha && r.nome !== 'nova-senha') { location.replace('#/nova-senha'); return; }

      var view = Views[r.nome];
      if (!view) { location.replace(user ? '#/' + this.inicial(user) : '#/entrar'); return; }
      if (user && view.admin && !Store.ehAdmin(user)) { location.replace('#/inicio'); return; }
      if (user && view.rh && !user.rh) { location.replace('#/' + this.inicial(user)); return; }
      this.desenhar(raiz, r.nome, r.params, user, manterRolagem);
    },

    inicial: function (user) { return 'inicio'; },

    desenhar: function (raiz, nome, params, user, manterRolagem) {
      var view = Views[nome];
      var ctx = { user: user, empresa: user ? Store.empresa(user.empresaId) : null, params: params, nome: nome };
      this.rota = nome; this.params = params;
      var corpo = view.render(ctx);
      var rolagem = window.scrollY;
      if (!user || view.layout === 'limpo') raiz.innerHTML = corpo;
      else if (view.layout === 'foco') raiz.innerHTML = this.cascaFoco(ctx, corpo, view);
      else raiz.innerHTML = this.casca(ctx, corpo);
      document.title = (typeof view.titulo === 'function' ? view.titulo(ctx) : view.titulo) + ' · SkillWay';
      var area = raiz.querySelector('[data-view]') || raiz;
      if (view.montar) view.montar(area, ctx);
      this.ligarCasca(raiz);
      window.scrollTo(0, manterRolagem ? rolagem : 0);
    },

    casca: function (ctx, corpo) {
      var user = ctx.user, ativo = PAI[ctx.nome] || ctx.nome;
      var naoLidas = Store.naoLidas(user.id), pend = Store.quizzesPendentes(user.id).length;
      function item(def) {
        var selo = def[0] === 'mensagens' && naoLidas ? naoLidas : (def[0] === 'quizzes' && pend ? pend : 0);
        return '<a class="nav-item' + (ativo === def[0] ? ' ativo' : '') + '" href="#/' + def[0] + '"' + (ativo === def[0] ? ' aria-current="page"' : '') + '>' +
          ic(def[2]) + '<span>' + def[1] + '</span>' + (selo ? '<span class="selo" aria-label="' + selo + ' pendentes">' + selo + '</span>' : '') + '</a>';
      }
      var admin = Store.ehAdmin(user);
      var gestao = MENU_GESTAO.slice();
      if (user.rh) gestao.push(['empresa', 'Empresa', 'empresa']);
      return '<a class="pular" href="#conteudo">Ir para o conteúdo</a>' +
        '<div class="casca">' +
        '<header class="barra-movel"><button type="button" class="btn-icone" id="abrirMenu" aria-label="Abrir menu">' + ic('menu', 22) + '</button>' + UI.marca(26) + '</header>' +
        '<aside class="lateral" id="lateral">' +
          '<a class="lateral-marca" href="#/inicio">' + UI.marca(30) + '</a>' +
          '<nav class="lateral-nav" aria-label="Principal">' +
            (admin ? '<p class="nav-titulo">Meu desenvolvimento</p>' : '') +
            MENU_PESSOAL.map(item).join('') +
            (admin ? '<p class="nav-titulo">Gestão da equipe</p>' + gestao.map(item).join('') : '') +
          '</nav>' +
          '<div class="lateral-fim">' + item(['configuracoes', 'Configurações', 'config']) +
            '<p class="estado-sistema ' + (Store.servidor ? 'ligado' : '') + '"><i></i>' + (Store.servidor
              ? (/supabase/i.test(Store.motor) ? 'Supabase conectado · ' : 'Banco de dados conectado · ') + (Store.ia && Store.ia.ativa ? 'IA do Claude ativa' : 'IA sem chave')
              : 'Modo local: dados só neste navegador, sem IA') + '</p>' +
            '<div class="lateral-user">' + UI.avatar(user) +
              '<span class="lateral-user-txt"><b>' + esc(user.nome) + '</b><small>' + esc(user.cargo) + '</small></span>' +
              '<button type="button" class="btn-icone" id="btnSair" aria-label="Sair da conta" title="Sair">' + ic('sair') + '</button>' +
            '</div>' +
          '</div>' +
        '</aside>' +
        '<div class="lateral-veu" id="lateralVeu"></div>' +
        '<main class="principal" id="conteudo" tabindex="-1"><div class="pagina" data-view>' + corpo + '</div></main>' +
        '</div>';
    },

    cascaFoco: function (ctx, corpo, view) {
      return '<div class="foco"><header class="foco-topo">' + UI.marca(26) +
        '<div class="foco-topo-dir"><span class="foco-ola">Olá, <b>' + esc(UI.fmt.primeiro(ctx.user.nome)) + '</b></span>' +
        '<a class="btn btn-fantasma btn-p" href="#/' + (view.voltarPara || 'inicio') + '" id="focoSair">' + esc(view.rotuloSair || 'Sair') + '</a></div></header>' +
        '<main class="foco-corpo" id="conteudo" data-view>' + corpo + '</main></div>';
    },

    ligarCasca: function (raiz) {
      var lateral = raiz.querySelector('#lateral');
      if (!lateral) return;
      var veu = raiz.querySelector('#lateralVeu');
      function alternar(abrir) { lateral.classList.toggle('aberta', abrir); veu.classList.toggle('visivel', abrir); }
      raiz.querySelector('#abrirMenu').addEventListener('click', function () { alternar(true); });
      veu.addEventListener('click', function () { alternar(false); });
      lateral.addEventListener('click', function (e) { if (e.target.closest('a')) alternar(false); });
      raiz.querySelector('#btnSair').addEventListener('click', function () {
        Store.sair().then(function () { location.hash = '#/entrar'; });
      });
    }
  };

  window.App = App;
  window.Views = window.Views || {};

  /** No modo servidor, busca dados novos ao trocar de tela se a última carga já tem alguns segundos. */
  App.navegar = function () {
    if (Store.servidor && Store.atual() && Store.velho(12000)) {
      Store.recarregar().then(function () { App.render(); }, function () { App.render(); });
    } else App.render();
  };

  // Chamado pelo Store quando o servidor recusa uma gravação ou a sessão termina.
  Store.aoFalhar = function (mensagem, sessaoEncerrada) {
    UI.toast(mensagem, 'erro');
    if (sessaoEncerrada) location.hash = '#/entrar';
    else App.atualizar();
  };

  document.addEventListener('DOMContentLoaded', function () {
    Store.iniciar().then(function () {
      window.addEventListener('hashchange', function () { App.navegar(); });
      App.render();
    });
  });
})();
