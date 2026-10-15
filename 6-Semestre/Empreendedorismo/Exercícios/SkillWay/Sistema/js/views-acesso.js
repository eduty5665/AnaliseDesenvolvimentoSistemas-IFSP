/* ==========================================================================
   SkillWay — Telas de acesso: entrar, cadastrar empresa, definir nova senha
   ========================================================================== */
(function () {
  'use strict';
  var esc = UI.esc, ic = UI.ic;

  // O caminho que o produto entrega (Mapa de Empatia, Seção 10 da documentação).
  var CAMINHO = [
    ['Perfil', 'Currículo e setor formam o seu ponto de partida.'],
    ['Objetivo', 'Você diz aonde quer chegar antes de receber qualquer conteúdo.'],
    ['Gap', 'O que falta entre o seu nível e o que o cargo pede.'],
    ['Ação', 'Poucos conteúdos, na ordem certa, dentro do seu tempo e orçamento.'],
    ['Evidência', 'Prática aplicada e quiz validam o que você aprendeu.'],
    ['Evolução', 'Você e seu gestor veem o avanço acontecer.']
  ];

  function painelMarca() {
    return '<section class="acesso-lado" aria-label="Como o SkillWay funciona">' +
      '<a href="index.html" class="acesso-marca">' + UI.marca(34) + '</a>' +
      '<h1 class="acesso-titulo">Habilidades que abrem caminhos.</h1>' +
      '<p class="acesso-sub">Do seu perfil até a evolução no cargo, um passo de cada vez.</p>' +
      '<ol class="estrada">' + CAMINHO.map(function (c, i) {
        return '<li><span class="estrada-marco">' + (i + 1) + '</span><div><b>' + c[0] + '</b><span>' + c[1] + '</span></div></li>';
      }).join('') + '</ol></section>';
  }

  /* ---------------------------- Entrar ---------------------------- */
  Views.entrar = {
    titulo: 'Entrar', layout: 'limpo',
    render: function () {
      var demo = Store.db.demo;
      var acessos = demo ? [
        ['colaborador', 'Colaboradora', 'Marina · atendimento'],
        ['gestor', 'Gestor', 'Paulo · gerente de loja'],
        ['rh', 'RH', 'Helena · vê a empresa toda'],
        ['persona', 'Dev júnior', 'Lucas · TI']
      ] : [];
      return '<div class="acesso">' + painelMarca() +
        '<section class="acesso-form"><div class="acesso-caixa">' +
          '<h2>Entrar na sua conta</h2>' +
          '<p class="texto-suave">Use o e-mail corporativo cadastrado pela sua empresa.</p>' +
          '<form id="formEntrar" novalidate>' +
            '<label class="campo"><span>E-mail corporativo</span><input class="entrada" type="email" name="email" autocomplete="username" placeholder="voce@empresa.com.br" required></label>' +
            '<label class="campo"><span>Senha</span><span class="entrada-grupo"><input class="entrada" type="password" name="senha" autocomplete="current-password" required>' +
              '<button type="button" class="btn-icone" id="verSenha" aria-label="Mostrar senha">' + ic('olho') + '</button></span></label>' +
            '<p class="erro-form" id="erroEntrar" role="alert" hidden></p>' +
            '<button type="submit" class="btn btn-primario btn-bloco">Entrar</button>' +
          '</form>' +
          '<div class="acesso-links"><a href="#" id="esqueci">Esqueci minha senha</a><a href="#/cadastro">Cadastrar minha empresa</a></div>' +
          (acessos.length ? '<div class="demo-acessos"><p>Acessos de demonstração <span>Grupo Atlântico Varejo, empresa fictícia</span></p><div class="demo-grade">' +
            acessos.map(function (a) {
              return '<button type="button" class="demo-botao" data-demo="' + a[0] + '"><b>' + a[1] + '</b><small>' + a[2] + '</small></button>';
            }).join('') + '</div></div>' : '') +
        '</div></section></div>';
    },
    montar: function (el) {
      var form = el.querySelector('#formEntrar'), erro = el.querySelector('#erroEntrar');
      function entrar(email, senha) {
        Store.entrar(email, senha).then(function (r) {
          if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
          App.ir(r.usuario.trocarSenha ? 'nova-senha' : 'inicio');
        });
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = UI.dadosForm(form);
        if (!d.email.trim() || !d.senha) { erro.textContent = 'Preencha o e-mail e a senha.'; erro.hidden = false; return; }
        entrar(d.email, d.senha);
      });
      el.querySelector('#verSenha').addEventListener('click', function () {
        var campo = form.elements.senha;
        campo.type = campo.type === 'password' ? 'text' : 'password';
        this.setAttribute('aria-label', campo.type === 'password' ? 'Mostrar senha' : 'Ocultar senha');
      });
      el.querySelector('#esqueci').addEventListener('click', function (e) {
        e.preventDefault();
        UI.modal({ titulo: 'Esqueci minha senha', classe: 'estreito',
          corpo: '<p class="modal-texto">Quem redefine a senha é o seu gestor direto ou o RH da empresa. Peça a um deles para abrir <b>Minha equipe</b>, escolher o seu nome e usar <b>Redefinir senha</b>. Você recebe uma senha provisória e cria uma nova no primeiro acesso.</p>' +
            '<div class="modal-acoes"><button type="button" class="btn btn-primario" data-fechar>Entendi</button></div>' });
      });
      el.querySelectorAll('[data-demo]').forEach(function (b) {
        b.addEventListener('click', function () {
          var demo = Store.db.demo;
          entrar(demo.acessos[b.getAttribute('data-demo')], demo.senha);
        });
      });
    }
  };

  /* ---------------------------- Cadastro da empresa ---------------------------- */
  Views.cadastro = {
    titulo: 'Cadastrar empresa', layout: 'limpo',
    render: function () {
      var segmentos = ['Varejo', 'Indústria', 'Serviços', 'Tecnologia', 'Outro'].map(function (s) { return [s, s]; });
      return '<div class="acesso">' + painelMarca() +
        '<section class="acesso-form"><div class="acesso-caixa">' +
          '<h2>Cadastrar minha empresa</h2>' +
          '<p class="texto-suave">Você entra como responsável de RH e, em seguida, importa o organograma por planilha.</p>' +
          '<form id="formCadastro" novalidate>' +
            '<label class="campo"><span>Nome da empresa</span><input class="entrada" name="empresa" required></label>' +
            '<div class="campo-linha">' +
              '<label class="campo"><span>Segmento</span><select class="entrada" name="segmento">' + UI.opcoes(segmentos, 'Varejo') + '</select></label>' +
              '<label class="campo"><span>Nº de colaboradores</span><input class="entrada" name="porte" type="number" min="1" max="100000" placeholder="300"></label>' +
            '</div>' +
            '<label class="campo"><span>Cidade</span><input class="entrada" name="cidade" placeholder="São Paulo, SP"></label>' +
            '<div class="campo-linha">' +
              '<label class="campo"><span>Seu nome</span><input class="entrada" name="nome" autocomplete="name" required></label>' +
              '<label class="campo"><span>Seu cargo</span><input class="entrada" name="cargo" placeholder="Analista de RH"></label>' +
            '</div>' +
            '<label class="campo"><span>E-mail corporativo</span><input class="entrada" type="email" name="email" autocomplete="username" required></label>' +
            '<label class="campo"><span>Crie uma senha</span><input class="entrada" type="password" name="senha" autocomplete="new-password" minlength="6" required><small>Pelo menos 6 caracteres.</small></label>' +
            '<p class="erro-form" id="erroCadastro" role="alert" hidden></p>' +
            '<button type="submit" class="btn btn-primario btn-bloco">Cadastrar empresa</button>' +
          '</form>' +
          '<div class="acesso-links"><a href="#/entrar">Já tenho conta</a></div>' +
        '</div></section></div>';
    },
    montar: function (el) {
      var form = el.querySelector('#formCadastro'), erro = el.querySelector('#erroCadastro');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = UI.dadosForm(form);
        Store.cadastrarEmpresa(d).then(function () { App.ir('empresa?novo=1'); },
          function (ex) { erro.textContent = ex.message; erro.hidden = false; });
      });
    }
  };

  /* ---------------------------- Nova senha (primeiro acesso) ---------------------------- */
  Views['nova-senha'] = {
    titulo: 'Criar nova senha', layout: 'limpo',
    render: function (ctx) {
      return '<div class="acesso so-form"><section class="acesso-form"><div class="acesso-caixa">' +
        '<div class="acesso-marca">' + UI.marca(30) + '</div>' +
        '<h2>Crie a sua senha</h2>' +
        '<p class="texto-suave">' + esc(UI.fmt.primeiro(ctx.user.nome)) + ', você entrou com uma senha provisória. Defina uma senha só sua para continuar.</p>' +
        '<form id="formSenha" novalidate>' +
          '<label class="campo"><span>Nova senha</span><input class="entrada" type="password" name="nova" autocomplete="new-password" required><small>Pelo menos 6 caracteres.</small></label>' +
          '<label class="campo"><span>Repita a nova senha</span><input class="entrada" type="password" name="repete" autocomplete="new-password" required></label>' +
          '<p class="erro-form" id="erroSenha" role="alert" hidden></p>' +
          '<button type="submit" class="btn btn-primario btn-bloco">Salvar senha e entrar</button>' +
        '</form></div></section></div>';
    },
    montar: function (el, ctx) {
      var form = el.querySelector('#formSenha'), erro = el.querySelector('#erroSenha');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = UI.dadosForm(form);
        var msg = d.nova.length < 6 ? 'A senha precisa ter pelo menos 6 caracteres.' : (d.nova !== d.repete ? 'As duas senhas não são iguais.' : '');
        if (msg) { erro.textContent = msg; erro.hidden = false; return; }
        Store.trocarMinhaSenha('', d.nova).then(function (r) {
          if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
          UI.toast('Senha salva.', 'sucesso');
          App.ir('inicio');
        });
      });
    }
  };
})();
