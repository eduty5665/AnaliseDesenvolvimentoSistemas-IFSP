/* ==========================================================================
   SkillWay — Dados de demonstração
   Empresa fictícia "Grupo Atlântico Varejo" (a mesma dos mockups), com
   organograma, diagnósticos e progresso gerados pelo próprio motor.
   Nomes e números são ilustrativos — não representam pessoas reais.
   ========================================================================== */
(function () {
  'use strict';

  var SENHA_DEMO = 'skillway123';

  function semear() {
    var D = Store.diasAtras;
    var emp = {
      id: 'emp_demo', nome: 'Grupo Atlântico Varejo', segmento: 'Varejo', cidade: 'São Paulo, SP',
      porte: 340, criadoEm: D(90), demo: true,
      meta: {
        titulo: 'Atendimento sem ruído no 4º trimestre',
        descricao: 'Todas as lojas com o módulo de Comunicação assertiva concluído e validado por quiz antes do pico de fim de ano.',
        comp: 'comunicacao', prazo: D(-21).slice(0, 10)
      }
    };
    Store.db.empresas.push(emp);

    function pessoa(chave, nome, cargo, area, unidade, gestor, extra) {
      var partes = Store.semAcento(nome).split(' ');
      var u = Store.novaPessoa(Object.assign({
        empresaId: emp.id, nome: nome, cargo: cargo, area: area, unidade: unidade,
        email: partes[0] + '.' + partes[partes.length - 1] + '@grupoatlantico.com.br',
        senha: SENHA_DEMO, gestorId: gestor ? P[gestor].id : null, criadoEm: D(88)
      }, extra || {}));
      P[chave] = u;
      return u;
    }
    var P = {};
    pessoa('roberto', 'Roberto Nunes', 'Diretor Regional', 'gestao', 'Regional Sul', null, { admissao: '2017-03-06' });
    pessoa('helena', 'Helena Prado', 'Analista de RH', 'rh', 'Matriz', 'roberto', { rh: true, admissao: '2020-08-17',
      curriculo: 'Graduação em Psicologia. Experiência com recrutamento, treinamento e indicadores de RH. Excel intermediário.' });
    pessoa('paulo', 'Paulo Mendes', 'Gerente de Loja', 'gestao', 'Loja 04', 'roberto', { admissao: '2019-02-11',
      curriculo: 'Tecnólogo em Gestão Comercial. Oito anos no varejo, três como gerente. Liderança de equipe de loja.' });
    pessoa('beatriz', 'Beatriz Rocha', 'Gerente de Loja', 'gestao', 'Loja 07', 'roberto', { admissao: '2021-05-03' });
    pessoa('fernanda', 'Fernanda Dias', 'Coordenadora de TI', 'ti', 'Matriz', 'roberto', { admissao: '2018-10-01',
      curriculo: 'Bacharel em Sistemas de Informação. Java, SQL, Git. Coordenação de projetos com Scrum.' });
    pessoa('marina', 'Marina Souza', 'Analista de Atendimento', 'atendimento', 'Loja 04', 'paulo', { admissao: D(190).slice(0, 10),
      curriculo: 'Ensino médio completo. Dois anos de experiência em atendimento ao cliente e SAC. Curso de comunicação e oratória.' });
    pessoa('joao', 'João Pedro Lima', 'Estoquista', 'logistica', 'Loja 04', 'paulo', { admissao: D(400).slice(0, 10),
      curriculo: 'Ensino médio completo. Experiência com conferência de mercadorias e inventário.' });
    pessoa('carla', 'Carla Ferreira', 'Operadora de Caixa', 'atendimento', 'Loja 04', 'paulo', { admissao: D(620).slice(0, 10) });
    pessoa('rafael', 'Rafael Torres', 'Auxiliar de Logística', 'logistica', 'Loja 04', 'paulo', { admissao: D(45).slice(0, 10), criadoEm: D(40) });
    pessoa('ana', 'Ana Lima', 'Vendedora', 'vendas', 'Loja 04', 'paulo', { admissao: D(820).slice(0, 10),
      curriculo: 'Técnico em Administração. Cinco anos em vendas no varejo. Batimento de metas de venda por três trimestres seguidos.' });
    pessoa('diego', 'Diego Martins', 'Vendedor', 'vendas', 'Loja 07', 'beatriz', { admissao: D(150).slice(0, 10) });
    pessoa('sofia', 'Sofia Araújo', 'Assistente Administrativo', 'administrativo', 'Loja 07', 'beatriz', { admissao: D(300).slice(0, 10),
      curriculo: 'Cursando Administração. Pacote Office, rotinas de contas a pagar e organização de documentos.' });
    pessoa('lucas', 'Lucas Amorim', 'Dev Front-end Jr.', 'ti', 'Matriz', 'fernanda', { admissao: D(420).slice(0, 10),
      curriculo: 'Cursando Gestão de Tecnologia da Informação. HTML, CSS e JavaScript em projetos da faculdade. Lógica de programação com Python. Inglês básico.' });
    pessoa('camila', 'Camila Teixeira', 'Analista de Dados', 'dados', 'Matriz', 'fernanda', { admissao: D(700).slice(0, 10),
      curriculo: 'Graduação em Estatística. Power BI, SQL e Excel avançado. Inglês intermediário.' });
    pessoa('thiago', 'Thiago Barros', 'Assistente Financeiro', 'financeiro', 'Matriz', 'roberto', { admissao: D(110).slice(0, 10) });

    function diag(chave, dias, notas, tempo, orcamento, extra) {
      var u = P[chave];
      return Engine.salvarDiagnostico(u.id, Object.assign({
        areaAtual: u.area, cargo: u.cargo, objetivo: 'upskilling', notas: notas,
        tempo: tempo, orcamento: orcamento, curriculo: u.curriculo
      }, extra || {}), D(dias));
    }
    /** Conclui `n` conteúdos de um módulo e, se houver nota, registra o quiz de validação. */
    function avanco(chave, comp, dias, quizPct) {
      var u = P[chave], trilha = Store.trilha(u.id);
      var modulo = trilha.modulos.filter(function (m) { return m.comp === comp; })[0];
      if (!modulo) return;
      dias.forEach(function (d, i) {
        var passo = modulo.passos[i];
        if (!passo || passo.tipo !== 'conteudo') return;
        var ct = Catalog.conteudo(passo.conteudoId);
        Engine.iniciarPasso(u.id, passo.id, D(d + 3));
        Engine.concluirPasso(u.id, passo.id, {
          horas: ct.horas,
          evidencia: ct.tipo === 'pratica' ? 'Aplicado na rotina do setor e revisado com o gestor.' : ''
        }, D(d, 16));
      });
      if (quizPct != null) {
        var perguntas = Engine.perguntasDe(comp, 5);
        var certas = Math.round(quizPct / 100 * perguntas.length);
        var respostas = perguntas.map(function (p, i) { return i < certas ? p.correta : (p.correta + 1) % p.opcoes.length; });
        Engine.registrarQuiz(u.id, { comp: comp, perguntas: perguntas, respostas: respostas }, D(Math.max(0, dias[dias.length - 1] - 1), 18));
      }
    }
    function iniciar(chave, comp, indice, dias) {
      var u = P[chave], trilha = Store.trilha(u.id);
      var modulo = trilha.modulos.filter(function (m) { return m.comp === comp; })[0];
      if (modulo && modulo.passos[indice]) Engine.iniciarPasso(u.id, modulo.passos[indice].id, D(dias));
    }

    // --- Loja 04 (equipe do Paulo) ---
    diag('marina', 40, { atendimento: 4, comunicacao: 3, conflitos: 2, excel: 1, digitais: 3, tempo: 2 }, '3-5h', 'ate100');
    avanco('marina', 'excel', [30, 16]);
    avanco('marina', 'comunicacao', [9], null);
    avanco('marina', 'conflitos', [22, 5], 80);
    iniciar('marina', 'excel', 2, 2);

    diag('joao', 30, { processos: 3, excel: 2, dados: 1, tempo: 3, comunicacao: 3, digitais: 2 }, '2h', 'gratuito');
    avanco('joao', 'dados', [16]);

    diag('carla', 50, { atendimento: 4, comunicacao: 4, conflitos: 2, excel: 3, digitais: 2, tempo: 3 }, '3-5h', 'ate100');
    avanco('carla', 'conflitos', [38, 20], 100);
    avanco('carla', 'digitais', [12, 4]);

    diag('ana', 45, { negociacao: 3, comunicacao: 4, atendimento: 4, excel: 2, dados: 2, ingles: 1 }, '5h+', 'acima100');
    avanco('ana', 'ingles', [33, 28], 80);
    avanco('ana', 'negociacao', [24, 10], 100);
    avanco('ana', 'excel', [15, 6]);
    avanco('ana', 'dados', [3]);

    // Rafael entrou há pouco e ainda não fez o diagnóstico.

    // --- Loja 07 (equipe da Beatriz) ---
    diag('diego', 12, { negociacao: 2, comunicacao: 3, atendimento: 3, excel: 2, dados: 1, ingles: 2 }, '2h', 'gratuito');
    iniciar('diego', 'negociacao', 0, 6);
    diag('sofia', 25, { excel: 3, financas: 2, comunicacao: 3, tempo: 3, digitais: 4, projetos: 1 }, '3-5h', 'ate100');
    avanco('sofia', 'projetos', [14, 7]);
    avanco('sofia', 'excel', [3]);

    // --- Matriz (equipe da Fernanda) ---
    diag('lucas', 20, { logica: 4, web: 3, bd: 2, git: 3, ingles: 2, seguranca: 1, comunicacao: 3 }, '3-5h', 'gratuito');
    avanco('lucas', 'seguranca', [12]);
    avanco('lucas', 'web', [4]);
    diag('camila', 35, { dados: 4, excel: 5, bd: 3, logica: 3, comunicacao: 2, ingles: 3 }, '3-5h', 'acima100');
    avanco('camila', 'bd', [21, 9], 100);
    avanco('camila', 'comunicacao', [6]);
    diag('thiago', 8, { financas: 3, excel: 3, dados: 2, tempo: 2, comunicacao: 3, digitais: 3 }, '2h', 'ate100');

    // --- Gestores também têm o próprio desenvolvimento ---
    diag('paulo', 30, { lideranca: 3, conflitos: 3, comunicacao: 4, projetos: 2, dados: 2, tempo: 3 }, '2h', 'ate100');
    avanco('paulo', 'projetos', [18]);
    avanco('paulo', 'lideranca', [8], null);
    diag('beatriz', 28, { lideranca: 4, conflitos: 3, comunicacao: 4, projetos: 3, dados: 2, tempo: 4 }, '2h', 'gratuito');
    avanco('beatriz', 'dados', [15]);
    diag('fernanda', 33, { logica: 5, web: 3, bd: 4, git: 4, ingles: 4, seguranca: 3, comunicacao: 3, lideranca: 2 }, '2h', 'acima100');
    avanco('fernanda', 'lideranca', [19, 11], 80);
    diag('helena', 36, { comunicacao: 4, conflitos: 4, lideranca: 3, dados: 2, seguranca: 1, excel: 3 }, '3-5h', 'ate100');
    avanco('helena', 'seguranca', [20, 13]);

    // --- Quiz enviado pelo gestor da Loja 04 ---
    var perguntasQuiz = Engine.perguntasDe('atendimento', 5);
    var quiz = {
      id: 'quiz_demo', empresaId: emp.id, autorId: P.paulo.id, titulo: 'Checagem rápida: atendimento ao cliente',
      comp: 'atendimento', perguntas: perguntasQuiz, prazo: D(-5).slice(0, 10), criadoEm: D(6),
      destinatarios: [P.marina.id, P.joao.id, P.carla.id, P.rafael.id, P.ana.id]
    };
    Store.db.quizzes.push(quiz);
    quiz.destinatarios.forEach(function (id) {
      Store.enviarMensagem({ empresaId: emp.id, de: P.paulo.id, para: id, tipo: 'quiz', quizId: quiz.id, criadoEm: D(6),
        titulo: 'Novo quiz: ' + quiz.titulo, corpo: 'Leva uns cinco minutos. O prazo vai até o fim da próxima semana.' });
    });
    function responder(chave, certas, dias) {
      var respostas = perguntasQuiz.map(function (p, i) { return i < certas ? p.correta : (p.correta + 1) % p.opcoes.length; });
      Engine.registrarQuiz(P[chave].id, { quizId: quiz.id, comp: 'atendimento', perguntas: perguntasQuiz, respostas: respostas }, D(dias, 15));
    }
    responder('marina', 4, 4);
    responder('carla', 5, 5);

    // --- Mensagens do gestor ---
    Store.enviarMensagem({ empresaId: emp.id, de: P.paulo.id, para: P.marina.id, tipo: 'sugestao', conteudoId: 'excel-3', criadoEm: D(3),
      titulo: 'Sugestão do seu gestor: tabelas dinâmicas',
      corpo: 'Marina, este vídeo é curto e resolve boa parte do relatório semanal da loja. Vale encaixar na trilha.' });
    var grupo = 'perg_demo';
    [['marina', ''], ['joao', ''], ['carla', 'Treinar junto com alguém que já domina Excel. Aprendo mais vendo na prática.'], ['ana', 'Ter um horário fixo na semana reservado para estudar, sem atendimento.'], ['rafael', '']].forEach(function (par) {
      var m = Store.enviarMensagem({ empresaId: emp.id, de: P.paulo.id, para: P[par[0]].id, tipo: 'pergunta', grupo: grupo, criadoEm: D(8),
        titulo: 'O que mais ajudaria você a evoluir neste trimestre?',
        corpo: 'Quero ajustar o plano da loja a partir das respostas de vocês. Pode ser direto.' });
      if (par[1]) { m.resposta = par[1]; m.respondidoEm = D(7); m.lidoEm = D(7); }
    });
    Store.enviarMensagem({ empresaId: emp.id, de: P.paulo.id, para: P.rafael.id, tipo: 'lembrete', criadoEm: D(5),
      titulo: 'Lembrete: faça o seu diagnóstico',
      corpo: 'Rafael, o diagnóstico leva cerca de cinco minutos e libera a sua trilha de desenvolvimento.' });
    Store.enviarMensagem({ empresaId: emp.id, de: P.fernanda.id, para: P.lucas.id, tipo: 'sugestao', conteudoId: 'git-2', criadoEm: D(2),
      titulo: 'Sugestão da sua gestora: Git em equipe',
      corpo: 'Lucas, vamos começar a revisar código por pull request no mês que vem. Este curso cobre o fluxo que vamos usar.' });

    Store.db.demo = { senha: SENHA_DEMO, empresaId: emp.id,
      acessos: { colaborador: P.marina.email, gestor: P.paulo.email, rh: P.helena.email, persona: P.lucas.email } };
    Store.salvar();
  }

  window.Seed = {
    SENHA_DEMO: SENHA_DEMO,
    iniciar: function () {
      var novo = Store.carregar();
      if (novo) semear();
    },
    /** Gera a demonstração em memória e devolve o banco (usado pelo servidor). */
    gerar: function () { Store.usar(Store.novoBanco()); semear(); return Store.db; },
    restaurar: function () {
      Store.zerar();
      semear();
    }
  };
})();
