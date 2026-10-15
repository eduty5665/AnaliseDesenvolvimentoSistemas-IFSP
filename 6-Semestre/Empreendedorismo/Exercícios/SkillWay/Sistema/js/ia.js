/* ==========================================================================
   SkillWay — Telas de IA (navegador)
   O navegador não fala com a Anthropic: ele pede ao servidor do SkillWay, que
   monta o prompt com os dados do banco e chama a API do Claude. Aqui ficam só
   os pedidos ao servidor e a apresentação das respostas.
   ========================================================================== */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic, fmt = UI.fmt;

  function meta(a) {
    return '<span class="ia-meta">Gerada pelo Claude ' + esc(fmt.quando(a.criadoEm)) + (a.modelo ? ' · ' + esc(a.modelo) : '') + '</span>';
  }
  function listaHtml(titulo, itens, classe) {
    if (!itens || !itens.length) return '';
    return '<h3 class="sub-titulo">' + titulo + '</h3><ul class="ia-lista ' + (classe || '') + '">' + itens.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  }

  var IA = {
    ativa: function () { return !!(Store.servidor && Store.ia && Store.ia.ativa); },

    /** Aviso exibido no lugar dos recursos de IA quando eles não estão disponíveis. */
    aviso: function (user) {
      if (!Store.servidor) {
        return '<p class="aviso">' + ic('info', 16) + '<span>A IA do Claude funciona quando o sistema é aberto pelo servidor. Feche esta aba, dê dois cliques em <b>iniciar.bat</b> na pasta do sistema e use o endereço que ele abrir.</span></p>';
      }
      return '<p class="aviso">' + ic('info', 16) + '<span>A IA do Claude ainda não tem uma chave de API configurada. ' +
        (user && user.rh ? '<a class="link" href="#/empresa">Configurar em Empresa</a>' : 'Peça ao RH para configurar em Empresa > Inteligência artificial.') + '</span></p>';
    },

    pedir: function (rota, corpo) { return Store.api('POST', 'ia/' + rota, corpo || {}); },

    /** Coloca o botão em estado de espera enquanto a IA responde. */
    comEspera: function (botao, promessa) {
      var original = botao.innerHTML;
      botao.disabled = true;
      botao.innerHTML = '<span class="ia-girando" aria-hidden="true"></span> ' + (botao.getAttribute('data-espera') || 'Gerando…');
      return promessa.then(function (r) { botao.disabled = false; botao.innerHTML = original; return r; },
        function (e) { botao.disabled = false; botao.innerHTML = original; UI.toast(e.message || 'A IA não respondeu.', 'erro'); throw e; });
    },

    /* ---------- Leitura do perfil ---------- */
    cartaoPerfil: function (userId, opt) {
      opt = opt || {};
      var p = Engine.perfil(userId);
      if (!p.diag) return '';
      var a = Store.analise('an_perfil_' + userId), viewer = Store.atual();
      var titulo = '<h2 class="cartao-titulo">' + ic('faisca') + ' Leitura do perfil pela IA</h2>';
      if (!this.ativa() && !a) return '<section class="cartao ia-cartao">' + titulo + this.aviso(viewer) + '</section>';
      var botao = this.ativa() ? '<button type="button" class="btn ' + (a ? 'btn-fantasma' : 'btn-primario') + ' btn-p" data-ia="perfil" data-user="' + userId + '" data-espera="Lendo o perfil…">' +
        ic('faisca', 15) + (a ? ' Gerar de novo' : ' Gerar leitura') + '</button>' : '';
      if (!a) {
        return '<section class="cartao ia-cartao"><div class="cartao-topo">' + titulo + botao + '</div>' +
          '<p class="texto-suave">O Claude lê o diagnóstico, a trilha e o currículo ' + (opt.admin ? 'desta pessoa' : 'e escreve para você') +
          ' um resumo do perfil, as prioridades e um plano de estudo que cabe no tempo disponível.</p></section>';
      }
      var r = a.resultado || {};
      var prioridades = (r.prioridades || []).map(function (x) {
        var comp = Catalog.comp(x.comp);
        return '<li><b>' + esc(comp ? comp.nome : x.comp) + '</b><span>' + esc(x.motivo) + '</span>' + (x.primeiroPasso ? '<span class="ia-passo">Primeiro passo: ' + esc(x.primeiroPasso) + '</span>' : '') + '</li>';
      }).join('');
      var plano = (r.plano || []).map(function (x, i) {
        return '<li class="atual"><span class="estrada-marco">' + (i + 1) + '</span><div><b>' + esc(x.periodo) + (x.foco ? ' · ' + esc(x.foco) : '') + '</b>' +
          (x.atividades || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></li>';
      }).join('');
      return '<section class="cartao ia-cartao"><div class="cartao-topo">' + titulo + botao + '</div>' +
        (a.chave !== p.diag.id ? '<p class="aviso">' + ic('info', 16) + '<span>Esta leitura foi feita sobre o diagnóstico anterior. Gere de novo para considerar o atual.</span></p>' : '') +
        '<p class="ia-resumo">' + esc(r.resumo) + '</p>' +
        '<div class="grade g-2 sem-margem">' +
          '<div>' + listaHtml('Pontos fortes', r.pontosFortes, 'bom') + (prioridades ? '<h3 class="sub-titulo">Prioridades</h3><ul class="ia-prioridades">' + prioridades + '</ul>' : '') + '</div>' +
          '<div>' + (plano ? '<h3 class="sub-titulo">Plano de estudo</h3><ol class="estrada compacta">' + plano + '</ol>' : '') +
            (r.conversa ? '<h3 class="sub-titulo">Para levar ao gestor</h3><p class="texto-suave">' + esc(r.conversa) + '</p>' : '') + '</div>' +
        '</div><p class="nota-rodape">' + meta(a) + '. Texto gerado por IA a partir dos dados do perfil: pode conter erros.</p></section>';
    },

    /* ---------- Leitura da equipe ---------- */
    cartaoEquipe: function (user) {
      var a = Store.analise('an_equipe_' + user.id);
      var titulo = '<h2 class="cartao-titulo">' + ic('faisca') + ' Leitura da equipe pela IA</h2>';
      if (!this.ativa() && !a) return '<section class="cartao ia ia-cartao">' + titulo + this.aviso(user) + '</section>';
      var botao = this.ativa() ? '<button type="button" class="btn ' + (a ? 'btn-fantasma' : 'btn-primario') + ' btn-p" data-ia="equipe" data-espera="Lendo a equipe…">' + ic('faisca', 15) + (a ? ' Atualizar' : ' Gerar leitura') + '</button>' : '';
      if (!a) {
        return '<section class="cartao ia ia-cartao"><div class="cartao-topo">' + titulo + botao + '</div>' +
          '<p class="texto-suave">O Claude analisa progresso, lacunas e dias sem atividade da equipe e sugere onde agir nesta semana. Os nomes não são enviados à IA: cada pessoa vai com um código.</p></section>';
      }
      var r = a.resultado || {}, rotulos = { lembrete: 'Enviar lembrete', quiz: 'Criar quiz', conteudo: 'Sugerir conteúdo' };
      var acoes = (r.acoes || []).map(function (x, i) {
        var comp = x.comp ? Catalog.comp(x.comp) : null;
        var pode = rotulos[x.tipo] && (x.ids || []).length && (x.tipo === 'lembrete' || comp);
        return '<li><b>' + esc(x.titulo) + '</b><p>' + esc(x.motivo) + '</p>' +
          (pode ? '<button type="button" class="btn btn-fantasma btn-p" data-acao="iaAcao" data-i="' + i + '">' + rotulos[x.tipo] + (comp ? ': ' + esc(comp.curto) : '') + '</button>' : '') + '</li>';
      }).join('');
      return '<section class="cartao ia ia-cartao"><div class="cartao-topo">' + titulo + botao + '</div>' +
        '<p class="ia-resumo">' + esc(r.panorama) + '</p>' + listaHtml('Destaques', r.destaques, 'bom') + listaHtml('Pontos de atenção', r.riscos, 'risco') +
        (acoes ? '<h3 class="sub-titulo">Ações sugeridas</h3><ul class="sugs">' + acoes + '</ul>' : '') +
        '<p class="nota-rodape">' + meta(a) + '. Confira os números na tabela antes de agir.</p></section>';
    },

    /* ---------- Resumo das respostas a uma pergunta ---------- */
    resumoRespostas: function (grupo, quantas) {
      var a = Store.analise('an_resp_' + grupo);
      if (!a) {
        return (this.ativa() && quantas >= 2) ? '<p class="ia-linha"><button type="button" class="btn btn-fantasma btn-p" data-ia="respostas" data-grupo="' + esc(grupo) + '" data-espera="Resumindo…">' + ic('faisca', 15) + ' Resumir respostas com IA</button></p>' : '';
      }
      var r = a.resultado || {};
      return '<div class="ia-resumo-caixa"><div class="cartao-topo"><h3 class="sub-titulo">' + ic('faisca', 15) + ' Resumo da IA</h3>' +
        (this.ativa() && quantas > (r.respostas || 0) ? '<button type="button" class="link" data-ia="respostas" data-grupo="' + esc(grupo) + '" data-espera="Resumindo…">Atualizar com as novas respostas</button>' : '') + '</div>' +
        '<p>' + esc(r.resumo) + '</p>' +
        ((r.temas || []).length ? '<ul class="ia-temas">' + r.temas.map(function (t) { return '<li><b>' + esc(t.tema) + '</b><span class="chip">' + t.quantas + (t.quantas === 1 ? ' resposta' : ' respostas') + '</span>' + (t.exemplo ? '<q>' + esc(t.exemplo) + '</q>' : '') + '</li>'; }).join('') + '</ul>' : '') +
        (r.proximoPasso ? '<p><b>Próximo passo sugerido:</b> ' + esc(r.proximoPasso) + '</p>' : '') +
        '<p class="nota-rodape">' + meta(a) + ' sobre ' + (r.respostas || 0) + ' respostas.</p></div>';
    },

    /** Liga os botões [data-ia] de uma tela: chama o servidor, guarda a análise e redesenha. */
    ligar: function (el) {
      var self = this;
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-ia]');
        if (!b || !el.contains(b) || b.disabled) return;
        var tipo = b.getAttribute('data-ia');
        var corpo = tipo === 'perfil' ? { userId: b.getAttribute('data-user') } : (tipo === 'respostas' ? { grupo: b.getAttribute('data-grupo') } : {});
        self.comEspera(b, self.pedir(tipo, corpo)).then(function (r) {
          Store.guardarAnalise(r.analise);
          UI.toast('Leitura gerada pela IA.', 'sucesso');
          App.atualizar();
        }, function () {});
      });
    }
  };

  window.IA = IA;
})();
