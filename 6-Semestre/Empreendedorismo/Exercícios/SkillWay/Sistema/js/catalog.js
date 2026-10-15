/* ==========================================================================
   SkillWay — Base curada (Seção 13 da documentação)
   Regras: área -> competências-chave (com nível esperado) -> conteúdos e quizzes.
   Este arquivo é a "planilha de regras" do MVP transformada em código.
   ========================================================================== */
(function () {
  'use strict';

  // Links: levam ao portal ou à busca da plataforma parceira (Alura, Coursera,
  // Udemy, SEBRAE, Fundação Bradesco etc. — Parcerias do Business Model Canvas).
  var L = {
    sebrae: 'https://sebrae.com.br/sites/PortalSebrae/cursosonline',
    bradesco: 'https://www.ev.org.br/cursos',
    cev: 'https://www.cursoemvideo.com/',
    dio: 'https://www.dio.me/',
    kultivi: 'https://kultivi.com/cursos/idiomas',
    evg: 'https://www.escolavirtual.gov.br/',
    coursera: function (q) { return 'https://www.coursera.org/search?query=' + encodeURIComponent(q); },
    alura: function (q) { return 'https://www.alura.com.br/busca?query=' + encodeURIComponent(q); },
    udemy: function (q) { return 'https://www.udemy.com/courses/search/?q=' + encodeURIComponent(q); },
    youtube: function (q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); },
    livro: function (q) { return 'https://www.google.com/search?tbm=bks&q=' + encodeURIComponent(q); }
  };

  // custo: 0 = gratuito · 1 = até R$100 · 2 = acima de R$100
  // tipo: curso | livro | video | pratica
  // nivel: 1 = base · 2 = aprofundamento
  function c(id, tipo, titulo, fonte, horas, custo, nivel, url) {
    return { id: id, tipo: tipo, titulo: titulo, fonte: fonte, horas: horas, custo: custo, nivel: nivel, url: url || '' };
  }
  function q(p, opcoes, correta, porque) {
    return { p: p, opcoes: opcoes, correta: correta, porque: porque };
  }

  var COMPETENCIAS = {
    excel: {
      nome: 'Excel e planilhas', curto: 'Excel', tipo: 'hard',
      palavras: ['excel', 'planilha', 'procv', 'tabela dinâmica', 'tabela dinamica', 'google sheets'],
      conteudos: [
        c('excel-1', 'curso', 'Excel do básico ao intermediário', 'Fundação Bradesco (Escola Virtual)', 15, 0, 1, L.bradesco),
        c('excel-2', 'curso', 'PROCV, tabelas dinâmicas e gráficos na prática', 'Udemy', 12, 1, 2, L.udemy('excel intermediário tabela dinâmica')),
        c('excel-3', 'video', 'Tabelas dinâmicas: do zero ao relatório', 'YouTube (aulas gratuitas)', 2, 0, 2, L.youtube('tabela dinâmica excel passo a passo')),
        c('excel-4', 'pratica', 'Monte um controle do seu setor com tabela dinâmica e um gráfico', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('Qual função procura um valor na primeira coluna de uma tabela e devolve um dado da mesma linha?', ['PROCV', 'SOMASE', 'CONT.SE', 'CONCATENAR'], 0, 'PROCV (ou PROCX) faz a busca vertical por um valor e retorna o dado correspondente.'),
        q('Para somar apenas as vendas de um vendedor específico, a função mais adequada é:', ['MÉDIA', 'SOMASE', 'MÁXIMO', 'ARRED'], 1, 'SOMASE soma somente as células que atendem a um critério.'),
        q('O que o símbolo $ faz em uma referência como $B$2?', ['Formata a célula como moeda', 'Protege a célula com senha', 'Mantém a referência fixa ao copiar a fórmula', 'Converte o valor em texto'], 2, 'O $ cria uma referência absoluta: ela não muda quando a fórmula é copiada.'),
        q('Qual recurso resume grandes volumes de dados, agrupando e totalizando sem escrever fórmulas?', ['Formatação condicional', 'Validação de dados', 'Congelar painéis', 'Tabela dinâmica'], 3, 'A tabela dinâmica agrupa, soma e cruza dados de forma interativa.'),
        q('A fórmula =SE(A1>=7;"Aprovado";"Reprovado") retorna o quê quando A1 vale 7?', ['Aprovado', 'Reprovado', '7', 'Um erro'], 0, 'Como 7 é maior ou igual a 7, o teste é verdadeiro e retorna "Aprovado".')
      ]
    },
    dados: {
      nome: 'Análise de dados e indicadores', curto: 'Dados', tipo: 'hard',
      palavras: ['power bi', 'indicadores', 'kpi', 'análise de dados', 'analise de dados', 'dashboard', 'estatística', 'bi'],
      conteudos: [
        c('dados-1', 'curso', 'Indicadores e KPIs: como medir o que importa', 'SEBRAE (cursos online)', 4, 0, 1, L.sebrae),
        c('dados-2', 'curso', 'Power BI: dashboards do zero', 'Alura', 10, 2, 2, L.alura('power bi')),
        c('dados-3', 'livro', 'Storytelling com Dados — Cole Nussbaumer Knaflic', 'Livro', 6, 1, 2, L.livro('Storytelling com Dados Cole Nussbaumer Knaflic')),
        c('dados-4', 'pratica', 'Escolha três indicadores do seu setor e monte um painel de uma página', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('Em um conjunto com valores muito extremos, qual medida representa melhor o valor "típico"?', ['Média', 'Mediana', 'Soma', 'Valor máximo'], 1, 'A mediana não é puxada por valores extremos, ao contrário da média.'),
        q('Um KPI é:', ['Um tipo de gráfico de pizza', 'Uma planilha de custos', 'Um indicador-chave que mede o avanço em direção a um objetivo', 'Um relatório mensal obrigatório'], 2, 'KPI (Key Performance Indicator) acompanha o que é essencial para a meta.'),
        q('Um gráfico de linhas é mais indicado para:', ['Mostrar a evolução de um valor ao longo do tempo', 'Mostrar partes de um todo', 'Listar nomes de clientes', 'Comparar apenas duas categorias'], 0, 'Linhas evidenciam tendência e variação ao longo do tempo.'),
        q('Dizer que duas variáveis têm correlação significa que:', ['Uma causa a outra, com certeza', 'Elas nunca mudam', 'Os dados estão errados', 'Elas variam juntas, o que não prova causa e efeito'], 3, 'Correlação não implica causalidade.'),
        q('As vendas passaram de 200 para 250 unidades. O crescimento foi de:', ['20%', '25%', '50%', '125%'], 1, '(250 − 200) ÷ 200 = 0,25, ou seja, 25%.')
      ]
    },
    digitais: {
      nome: 'Ferramentas digitais e produtividade', curto: 'Ferramentas digitais', tipo: 'hard',
      palavras: ['pacote office', 'google workspace', 'microsoft 365', 'teams', 'word', 'powerpoint', 'informática', 'informatica', 'drive'],
      conteudos: [
        c('digitais-1', 'curso', 'E-mail, agenda e documentos na nuvem', 'Fundação Bradesco (Escola Virtual)', 6, 0, 1, L.bradesco),
        c('digitais-2', 'curso', 'Produtividade com Google Workspace e Microsoft 365', 'Udemy', 8, 1, 2, L.udemy('produtividade google workspace microsoft 365')),
        c('digitais-3', 'video', 'Automatize tarefas repetitivas: modelos, filtros e atalhos', 'YouTube (aulas gratuitas)', 2, 0, 2, L.youtube('automatizar tarefas repetitivas modelos atalhos produtividade')),
        c('digitais-4', 'pratica', 'Padronize um documento-modelo e uma pasta compartilhada da sua equipe', 'Desafio prático', 2, 0, 2)
      ],
      perguntas: [
        q('Qual é a principal vantagem de editar um documento na nuvem?', ['Várias pessoas editam ao mesmo tempo, com histórico de versões', 'O arquivo fica sempre menor', 'Não é preciso ter conta', 'O documento não pode ser compartilhado'], 0, 'Colaboração simultânea e histórico de versões são o ganho central.'),
        q('Ao enviar um e-mail para muitas pessoas que não se conhecem, qual campo protege os endereços?', ['Para', 'Cc', 'Cco (cópia oculta)', 'Assunto'], 2, 'No Cco, um destinatário não vê o endereço dos outros.'),
        q('Qual prática deixa suas contas mais seguras?', ['Usar a mesma senha em todos os serviços', 'Anotar a senha no monitor', 'Compartilhar a senha com o time', 'Usar senha longa e única, com verificação em duas etapas'], 3, 'Senha única e segunda etapa reduzem muito o risco de invasão.'),
        q('Para marcar uma reunião considerando a disponibilidade de todos, o recurso mais adequado é:', ['Mensagem de voz', 'Convite pela agenda compartilhada', 'Planilha impressa', 'Bloco de notas'], 1, 'A agenda mostra horários livres e registra o convite para todos.'),
        q('No Windows, qual atalho desfaz a última ação na maioria dos programas?', ['Ctrl + Z', 'Ctrl + P', 'Alt + F4', 'Ctrl + N'], 0, 'Ctrl + Z desfaz; Ctrl + Y refaz.')
      ]
    },
    comunicacao: {
      nome: 'Comunicação assertiva', curto: 'Comunicação', tipo: 'soft',
      palavras: ['comunicação', 'comunicacao', 'oratória', 'oratoria', 'apresentações', 'apresentacoes', 'redação', 'redacao'],
      conteudos: [
        c('comunicacao-1', 'curso', 'Comunicação e expressão no trabalho', 'SEBRAE (cursos online)', 5, 0, 1, L.sebrae),
        c('comunicacao-2', 'curso', 'Comunicação assertiva e escuta ativa', 'Udemy', 8, 1, 2, L.udemy('comunicação assertiva escuta ativa')),
        c('comunicacao-3', 'livro', 'Comunicação Não-Violenta — Marshall B. Rosenberg', 'Livro', 7, 1, 2, L.livro('Comunicação Não-Violenta Marshall Rosenberg')),
        c('comunicacao-4', 'pratica', 'Conduza uma conversa difícil usando observação, sentimento, necessidade e pedido', 'Desafio prático', 1, 0, 2)
      ],
      perguntas: [
        q('Comunicar-se de forma assertiva é:', ['Falar mais alto para ser ouvido', 'Evitar dar opinião para não gerar atrito', 'Dizer o que pensa com clareza e respeito, sem agredir nem se omitir', 'Concordar com tudo'], 2, 'Assertividade equilibra clareza e respeito.'),
        q('Escuta ativa envolve:', ['Prestar atenção, confirmar o que entendeu e perguntar antes de responder', 'Pensar na resposta enquanto a pessoa fala', 'Interromper para ganhar tempo', 'Responder só por mensagem'], 0, 'Confirmar o entendimento evita ruídos e mostra respeito.'),
        q('Um feedback útil começa por:', ['Rotular a pessoa', 'Descrever o comportamento observado e o impacto dele', 'Comparar com um colega', 'Esperar a avaliação anual'], 1, 'Fatos e impacto são mais fáceis de ouvir e de mudar do que rótulos.'),
        q('Em um e-mail profissional, a informação mais importante deve aparecer:', ['No último parágrafo', 'Só no anexo', 'Em letras maiúsculas', 'Logo no início, com assunto claro e pedido objetivo'], 3, 'Quem lê decide em segundos; comece pelo essencial.'),
        q('Na Comunicação Não-Violenta, os quatro componentes são:', ['Elogio, crítica, elogio e prazo', 'Observação, sentimento, necessidade e pedido', 'Fato, culpa, punição e acordo', 'Problema, causa, culpado e solução'], 1, 'O método de Rosenberg separa observação, sentimento, necessidade e pedido.')
      ]
    },
    atendimento: {
      nome: 'Atendimento e experiência do cliente', curto: 'Atendimento', tipo: 'soft',
      palavras: ['atendimento', 'cliente', 'sac', 'suporte', 'customer', 'pós-venda', 'pos-venda'],
      conteudos: [
        c('atendimento-1', 'curso', 'Atendimento ao cliente', 'SEBRAE (cursos online)', 3, 0, 1, L.sebrae),
        c('atendimento-2', 'curso', 'Experiência do cliente: da jornada à fidelização', 'Udemy', 6, 1, 2, L.udemy('experiência do cliente customer experience')),
        c('atendimento-3', 'livro', 'O Jeito Disney de Encantar os Clientes — Disney Institute', 'Livro', 6, 1, 2, L.livro('O Jeito Disney de Encantar os Clientes')),
        c('atendimento-4', 'pratica', 'Mapeie a jornada de um cliente real e proponha uma melhoria', 'Desafio prático', 2, 0, 2)
      ],
      perguntas: [
        q('Diante de um cliente irritado, o primeiro passo é:', ['Explicar a política da empresa', 'Ouvir sem interromper e mostrar que entendeu o problema', 'Transferir para outro setor', 'Oferecer desconto imediatamente'], 1, 'Ser ouvido reduz a tensão e revela o problema real.'),
        q('O NPS (Net Promoter Score) mede:', ['O tempo médio de atendimento', 'O faturamento por cliente', 'A disposição do cliente em recomendar a empresa', 'A quantidade de reclamações'], 2, 'O NPS parte da pergunta "de 0 a 10, você nos recomendaria?".'),
        q('A "jornada do cliente" é:', ['O conjunto de contatos do cliente com a empresa antes, durante e depois da compra', 'O caminho do produto dentro do estoque', 'A agenda do vendedor', 'O contrato de compra'], 0, 'Enxergar a jornada inteira mostra onde a experiência falha.'),
        q('Quando você não sabe responder a uma dúvida na hora, o melhor é:', ['Inventar uma resposta provável', 'Pedir para o cliente ligar depois', 'Mudar de assunto', 'Dizer que vai verificar, informar um prazo e retornar'], 3, 'Compromisso com prazo preserva a confiança.'),
        q('O pós-venda serve para:', ['Encerrar o relacionamento', 'Confirmar a satisfação, resolver pendências e favorecer a recompra', 'Cobrar taxas extras', 'Substituir o atendimento'], 1, 'É no pós-venda que a fidelização acontece.')
      ]
    },
    negociacao: {
      nome: 'Vendas consultivas e negociação', curto: 'Vendas e negociação', tipo: 'soft',
      palavras: ['vendas', 'negociação', 'negociacao', 'comercial', 'prospecção', 'prospeccao', 'metas de venda'],
      conteudos: [
        c('negociacao-1', 'curso', 'Técnicas de vendas', 'SEBRAE (cursos online)', 4, 0, 1, L.sebrae),
        c('negociacao-2', 'curso', 'Negociação: técnicas e estratégias', 'Coursera', 10, 1, 2, L.coursera('negociação')),
        c('negociacao-3', 'livro', 'SPIN Selling — Neil Rackham', 'Livro', 8, 1, 2, L.livro('SPIN Selling Neil Rackham')),
        c('negociacao-4', 'pratica', 'Prepare um roteiro de perguntas de diagnóstico e aplique em três atendimentos', 'Desafio prático', 2, 0, 2)
      ],
      perguntas: [
        q('Na venda consultiva, o vendedor:', ['Apresenta o produto mais caro primeiro', 'Entende a necessidade com perguntas antes de propor a solução', 'Fala a maior parte do tempo', 'Oferece desconto logo no início'], 1, 'Diagnóstico antes da oferta é a base da venda consultiva.'),
        q('No método SPIN, as letras significam:', ['Situação, Problema, Implicação e Necessidade de solução', 'Serviço, Preço, Investimento e Negócio', 'Saudação, Proposta, Insistência e Nota', 'Solução, Produto, Interesse e Negociação'], 0, 'As perguntas avançam da situação até a necessidade de solução.'),
        q('Ao ouvir "está caro", a melhor reação é:', ['Baixar o preço imediatamente', 'Encerrar a conversa', 'Entender com o que o cliente compara e reforçar o valor antes de falar em desconto', 'Dizer que o concorrente é pior'], 2, 'Objeção de preço costuma ser dúvida sobre valor.'),
        q('Em negociação, a "melhor alternativa sem acordo" (BATNA) é:', ['O menor preço possível', 'O desconto máximo autorizado', 'A primeira proposta feita', 'O que você fará se a negociação não fechar'], 3, 'Conhecer a própria alternativa define até onde vale ceder.'),
        q('Uma negociação ganha-ganha:', ['Faz um lado ceder em tudo', 'Busca um acordo que atenda aos interesses principais dos dois lados', 'Evita falar de interesses', 'Sempre divide a diferença ao meio'], 1, 'Acordos sustentáveis atendem aos interesses centrais de ambos.')
      ]
    },
    tempo: {
      nome: 'Gestão do tempo e organização', curto: 'Gestão do tempo', tipo: 'soft',
      palavras: ['gestão do tempo', 'gestao do tempo', 'organização', 'organizacao', 'produtividade', 'planejamento'],
      conteudos: [
        c('tempo-1', 'curso', 'Gestão do tempo', 'Fundação Bradesco (Escola Virtual)', 4, 0, 1, L.bradesco),
        c('tempo-2', 'curso', 'Produtividade pessoal: priorize e planeje sua semana', 'Udemy', 5, 1, 2, L.udemy('gestão do tempo produtividade pessoal')),
        c('tempo-3', 'livro', 'A Arte de Fazer Acontecer (GTD) — David Allen', 'Livro', 8, 1, 2, L.livro('A Arte de Fazer Acontecer David Allen')),
        c('tempo-4', 'pratica', 'Planeje uma semana com a Matriz de Eisenhower e revise o resultado', 'Desafio prático', 1, 0, 2)
      ],
      perguntas: [
        q('A Matriz de Eisenhower classifica tarefas por:', ['Custo e prazo', 'Urgência e importância', 'Tamanho e dificuldade', 'Setor e responsável'], 1, 'Os quatro quadrantes cruzam urgência e importância.'),
        q('Uma tarefa importante, mas não urgente, deve ser:', ['Ignorada', 'Feita só quando virar urgente', 'Planejada e agendada', 'Delegada sempre'], 2, 'É no quadrante "importante e não urgente" que se evita o incêndio de amanhã.'),
        q('A técnica Pomodoro consiste em:', ['Blocos de foco (por exemplo, 25 minutos) intercalados com pausas curtas', 'Trabalhar sem pausas até terminar', 'Fazer várias tarefas ao mesmo tempo', 'Responder mensagens a cada 5 minutos'], 0, 'Foco em blocos curtos com pausas mantém a concentração.'),
        q('O princípio de Pareto diz que, em geral:', ['Todas as tarefas têm o mesmo peso', '50% do esforço gera 50% do resultado', 'O resultado depende só do tempo gasto', 'Cerca de 20% das causas geram 80% dos resultados'], 3, 'Identificar os 20% de maior impacto orienta a prioridade.'),
        q('Alternar entre várias tarefas que exigem concentração tende a:', ['Reduzir erros', 'Aumentar os erros e o tempo total', 'Dobrar a produtividade', 'Não fazer diferença'], 1, 'Cada troca de contexto custa atenção e tempo.')
      ]
    },
    projetos: {
      nome: 'Gestão de projetos', curto: 'Projetos', tipo: 'hard',
      palavras: ['projetos', 'scrum', 'kanban', 'ágil', 'agil', 'pmbok', 'cronograma'],
      conteudos: [
        c('projetos-1', 'curso', 'Fundamentos de gestão de projetos', 'Fundação Bradesco (Escola Virtual)', 12, 0, 1, L.bradesco),
        c('projetos-2', 'curso', 'Fundamentos do gerenciamento de projetos', 'Coursera', 18, 2, 2, L.coursera('fundamentos do gerenciamento de projetos')),
        c('projetos-3', 'livro', 'Scrum: a arte de fazer o dobro do trabalho na metade do tempo — Jeff Sutherland', 'Livro', 7, 1, 2, L.livro('Scrum Jeff Sutherland')),
        c('projetos-4', 'pratica', 'Planeje uma entrega real com escopo, prazo, responsáveis e quadro Kanban', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('A chamada "restrição tripla" de um projeto é formada por:', ['Escopo, prazo e custo', 'Cliente, equipe e chefe', 'Início, meio e fim', 'Reunião, ata e relatório'], 0, 'Mudar um dos três lados afeta os outros dois.'),
        q('O quadro Kanban serve principalmente para:', ['Calcular o orçamento', 'Registrar o ponto da equipe', 'Visualizar o fluxo de trabalho e limitar o que está em andamento', 'Substituir as reuniões'], 2, 'Visualizar e limitar o trabalho em andamento expõe gargalos.'),
        q('No Scrum, uma sprint é:', ['Uma reunião diária', 'Um ciclo curto, de duração fixa, que termina com uma entrega', 'O documento de requisitos', 'O cargo do líder do time'], 1, 'Sprints têm duração fixa e produzem um incremento utilizável.'),
        q('Um risco de projeto é:', ['Um problema que já aconteceu', 'Uma tarefa atrasada', 'O custo total do projeto', 'Um evento incerto que, se ocorrer, afeta os objetivos'], 3, 'Risco é incerteza; problema é risco que se concretizou.'),
        q('Stakeholders são:', ['Apenas os clientes pagantes', 'As pessoas ou grupos afetados pelo projeto ou que o influenciam', 'Os fornecedores de software', 'Os documentos do projeto'], 1, 'Partes interessadas incluem equipe, clientes, patrocinadores e usuários.')
      ]
    },
    ingles: {
      nome: 'Inglês profissional', curto: 'Inglês', tipo: 'hard',
      palavras: ['inglês', 'ingles', 'english', 'toefl', 'toeic', 'intercâmbio', 'intercambio'],
      conteudos: [
        c('ingles-1', 'curso', 'Inglês do zero ao intermediário', 'Kultivi (gratuito)', 20, 0, 1, L.kultivi),
        c('ingles-2', 'curso', 'English for Career Development', 'Coursera', 20, 0, 2, L.coursera('English for Career Development')),
        c('ingles-3', 'curso', 'Conversação e vocabulário de negócios', 'Udemy', 10, 1, 2, L.udemy('inglês para negócios conversação')),
        c('ingles-4', 'pratica', 'Escreva um e-mail e grave uma apresentação de um minuto em inglês sobre o seu trabalho', 'Desafio prático', 1, 0, 2)
      ],
      perguntas: [
        q('Complete: "She ___ in the sales department."', ['work', 'working', 'works', 'are work'], 2, 'Com he/she/it no presente simples, o verbo ganha "s": works.'),
        q('"Could you send me the report by Friday?" pede o relatório:', ['Até sexta-feira', 'Só depois de sexta-feira', 'Por meio de sexta-feira', 'Toda sexta-feira'], 0, '"By Friday" indica prazo limite: até sexta-feira.'),
        q('Qual fechamento é adequado para um e-mail formal?', ['See ya,', 'Best regards,', 'Bye bye,', 'Cheers mate,'], 1, '"Best regards" é neutro e profissional.'),
        q('Complete: "We ___ the meeting yesterday."', ['have', 'has', 'having', 'had'], 3, '"Yesterday" pede passado simples: had.'),
        q('No trabalho, "deadline" significa:', ['Linha telefônica', 'Prazo final', 'Reunião de equipe', 'Hora extra'], 1, 'Deadline é a data-limite de uma entrega.')
      ]
    },
    lideranca: {
      nome: 'Liderança e feedback', curto: 'Liderança', tipo: 'soft',
      palavras: ['liderança', 'lideranca', 'gestão de pessoas', 'gestao de pessoas', 'coordenação', 'coordenacao', 'supervisão', 'supervisao', 'gerente'],
      conteudos: [
        c('lideranca-1', 'curso', 'Liderança: como desenvolver equipes', 'SEBRAE (cursos online)', 4, 0, 1, L.sebrae),
        c('lideranca-2', 'curso', 'Liderança e gestão de pessoas', 'Alura', 10, 2, 2, L.alura('liderança')),
        c('lideranca-3', 'livro', 'Os 5 Desafios das Equipes — Patrick Lencioni', 'Livro', 6, 1, 2, L.livro('Os 5 Desafios das Equipes Patrick Lencioni')),
        c('lideranca-4', 'pratica', 'Faça uma conversa individual com cada pessoa do time e registre um combinado de desenvolvimento', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('Na liderança situacional, o líder:', ['Usa sempre o mesmo estilo', 'Adapta o estilo ao preparo de cada pessoa para a tarefa', 'Decide tudo sozinho', 'Evita acompanhar o time'], 1, 'Quem está aprendendo pede direção; quem domina pede autonomia.'),
        q('Delegar bem significa:', ['Passar a tarefa e não acompanhar', 'Dizer exatamente cada passo', 'Combinar resultado esperado, prazo e autonomia, e acompanhar sem microgerenciar', 'Delegar só o que ninguém quer fazer'], 2, 'Clareza do resultado e acompanhamento leve geram autonomia.'),
        q('A conversa individual periódica (1:1) serve principalmente para:', ['Acompanhar o desenvolvimento, remover obstáculos e trocar feedback', 'Cobrar horário', 'Substituir a avaliação anual por e-mail', 'Repassar avisos gerais'], 0, 'O 1:1 é o espaço da pessoa, não o da tarefa.'),
        q('No modelo SBI de feedback, as letras significam:', ['Sucesso, Bônus e Incentivo', 'Solução, Benefício e Ideia', 'Sugestão, Bronca e Insistência', 'Situação, Comportamento e Impacto'], 3, 'Descreve-se a situação, o comportamento observado e o impacto gerado.'),
        q('Um time com segurança psicológica é aquele em que as pessoas:', ['Nunca discordam', 'Sentem-se seguras para opinar, errar e pedir ajuda', 'Não recebem feedback', 'Trabalham isoladas'], 1, 'Sem medo de punição, o time aprende e melhora mais rápido.')
      ]
    },
    conflitos: {
      nome: 'Gestão de conflitos', curto: 'Conflitos', tipo: 'soft',
      palavras: ['conflitos', 'mediação', 'mediacao', 'inteligência emocional', 'inteligencia emocional'],
      conteudos: [
        c('conflitos-1', 'curso', 'Gestão de conflitos no trabalho', 'SEBRAE (cursos online)', 3, 0, 1, L.sebrae),
        c('conflitos-2', 'curso', 'Inteligência emocional e resolução de conflitos', 'Udemy', 6, 1, 2, L.udemy('inteligência emocional resolução de conflitos')),
        c('conflitos-3', 'livro', 'Conversas Difíceis — Douglas Stone, Bruce Patton e Sheila Heen', 'Livro', 8, 1, 2, L.livro('Conversas Difíceis Douglas Stone')),
        c('conflitos-4', 'pratica', 'Medie um desacordo real separando fatos, interesses e opções', 'Desafio prático', 2, 0, 2)
      ],
      perguntas: [
        q('Ao mediar um conflito, o primeiro passo é:', ['Decidir quem está certo', 'Entender o que cada lado realmente precisa', 'Aplicar uma advertência', 'Pedir que esqueçam o assunto'], 1, 'Sem entender interesses, qualquer solução é imposta.'),
        q('A diferença entre posição e interesse é que:', ['Posição é o que a pessoa diz querer; interesse é o motivo por trás', 'São a mesma coisa', 'Interesse é sempre financeiro', 'Posição é o cargo da pessoa'], 0, 'Negociar interesses abre mais opções do que disputar posições.'),
        q('O estilo colaborativo de resolver conflitos busca:', ['Evitar o assunto', 'Fazer um lado ceder', 'Uma solução que atenda aos dois lados', 'Encerrar rápido, de qualquer jeito'], 2, 'Colaborar exige mais tempo, mas preserva a relação e o resultado.'),
        q('Um conflito ignorado tende a:', ['Desaparecer sozinho', 'Melhorar o clima', 'Não ter efeito algum', 'Crescer e afetar o clima e a produtividade'], 3, 'Conflito não tratado costuma voltar maior.'),
        q('Usar inteligência emocional em um conflito significa:', ['Esconder o que sente', 'Reconhecer a própria emoção e regular a reação antes de responder', 'Reagir na hora, sem pensar', 'Evitar todo contato'], 1, 'Perceber e regular a emoção evita a escalada.')
      ]
    },
    logica: {
      nome: 'Lógica de programação', curto: 'Lógica', tipo: 'hard',
      palavras: ['lógica', 'logica', 'algoritmo', 'python', 'java', 'programação', 'programacao', 'c#', 'portugol'],
      conteudos: [
        c('logica-1', 'curso', 'Algoritmos e lógica de programação', 'Curso em Vídeo (gratuito)', 20, 0, 1, L.cev),
        c('logica-2', 'curso', 'Lógica de programação com JavaScript', 'Alura', 10, 2, 2, L.alura('lógica de programação')),
        c('logica-3', 'livro', 'Entendendo Algoritmos — Aditya Y. Bhargava', 'Livro', 10, 1, 2, L.livro('Entendendo Algoritmos Aditya Bhargava')),
        c('logica-4', 'pratica', 'Resolva dez exercícios de lógica e publique as soluções em um repositório', 'Desafio prático', 5, 0, 2)
      ],
      perguntas: [
        q('Qual estrutura repete um bloco enquanto uma condição for verdadeira?', ['Laço de repetição (enquanto/while)', 'Variável', 'Comentário', 'Constante'], 0, 'O laço while executa o bloco enquanto a condição for verdadeira.'),
        q('Se x = 5, quanto vale x após "x = x + 2 * 3"?', ['21', '16', '11', '13'], 2, 'A multiplicação vem antes: 2 × 3 = 6; 5 + 6 = 11.'),
        q('O operador lógico E (AND) resulta em verdadeiro quando:', ['Pelo menos uma condição é verdadeira', 'As duas condições são verdadeiras', 'As duas são falsas', 'Nenhuma condição é avaliada'], 1, 'O E exige que todas as condições sejam verdadeiras.'),
        q('Um vetor (array) é:', ['Um tipo de laço', 'Um erro de execução', 'Um comentário no código', 'Uma estrutura que guarda vários valores acessados por índice'], 3, 'Arrays agrupam valores acessados pela posição.'),
        q('Uma função é:', ['Um bloco de código reutilizável, que pode receber parâmetros e devolver um valor', 'Um arquivo de imagem', 'Um tipo de banco de dados', 'Uma variável global'], 0, 'Funções evitam repetição e organizam o código.')
      ]
    },
    web: {
      nome: 'Desenvolvimento web (HTML, CSS e JavaScript)', curto: 'Desenvolvimento web', tipo: 'hard',
      palavras: ['html', 'css', 'javascript', 'react', 'front-end', 'frontend', 'front end', 'web', 'typescript', 'angular', 'vue'],
      conteudos: [
        c('web-1', 'curso', 'HTML5 e CSS3', 'Curso em Vídeo (gratuito)', 40, 0, 1, L.cev),
        c('web-2', 'curso', 'JavaScript e front-end na prática', 'DIO (gratuito)', 30, 0, 2, L.dio),
        c('web-3', 'curso', 'React: componentes, estado e rotas', 'Alura', 16, 2, 2, L.alura('react')),
        c('web-4', 'pratica', 'Publique uma página responsiva com formulário validado em JavaScript', 'Desafio prático', 6, 0, 2)
      ],
      perguntas: [
        q('Qual tag HTML cria um link para outra página?', ['<link>', '<a>', '<href>', '<nav>'], 1, 'A tag <a>, com o atributo href, cria o link.'),
        q('Qual recurso do CSS distribui itens em uma linha ou coluna de forma flexível?', ['Flexbox', 'Float', 'Position', 'Z-index'], 0, 'Flexbox alinha e distribui itens em um eixo.'),
        q('Em JavaScript, a diferença entre == e === é que:', ['Não há diferença', '== é mais rápido', '=== compara valor e tipo, sem conversão', '=== serve só para números'], 2, '=== é a comparação estrita: valor e tipo precisam ser iguais.'),
        q('Um layout responsivo usa principalmente:', ['Tabelas com largura fixa', 'Imagens em alta resolução', 'Apenas JavaScript', 'Media queries para adaptar o layout ao tamanho da tela'], 3, 'Media queries aplicam estilos conforme a largura da tela.'),
        q('O que document.querySelector("#menu") seleciona?', ['Todos os elementos da classe menu', 'O elemento com id "menu"', 'A tag <menu>', 'O primeiro link da página'], 1, 'O # indica seleção por id.')
      ]
    },
    bd: {
      nome: 'Banco de dados e SQL', curto: 'Banco de dados', tipo: 'hard',
      palavras: ['sql', 'mysql', 'postgres', 'banco de dados', 'oracle', 'sql server', 'modelagem'],
      conteudos: [
        c('bd-1', 'curso', 'Banco de dados MySQL', 'Curso em Vídeo (gratuito)', 40, 0, 1, L.cev),
        c('bd-2', 'curso', 'SQL para análise de dados', 'Udemy', 10, 1, 2, L.udemy('sql para análise de dados')),
        c('bd-3', 'curso', 'Modelagem de banco de dados relacional', 'Alura', 8, 2, 2, L.alura('modelagem de banco de dados')),
        c('bd-4', 'pratica', 'Modele três tabelas relacionadas e escreva cinco consultas com JOIN e GROUP BY', 'Desafio prático', 4, 0, 2)
      ],
      perguntas: [
        q('Qual comando SQL consulta dados de uma tabela?', ['INSERT', 'UPDATE', 'SELECT', 'DROP'], 2, 'SELECT lê dados; INSERT, UPDATE e DELETE alteram.'),
        q('A chave primária de uma tabela:', ['Identifica cada registro de forma única', 'Guarda a senha do banco', 'É sempre um texto', 'Pode se repetir entre registros'], 0, 'Ela não se repete e não fica vazia.'),
        q('Um JOIN serve para:', ['Apagar tabelas', 'Combinar linhas de tabelas a partir de uma coluna relacionada', 'Criar um backup', 'Ordenar o resultado'], 1, 'O JOIN relaciona tabelas por colunas em comum.'),
        q('A cláusula WHERE é usada para:', ['Ordenar o resultado', 'Renomear colunas', 'Criar índices', 'Filtrar as linhas que atendem a uma condição'], 3, 'WHERE restringe as linhas retornadas.'),
        q('GROUP BY, junto com funções como SUM e COUNT, serve para:', ['Excluir duplicados da tabela', 'Agrupar linhas e calcular totais por grupo', 'Unir bancos diferentes', 'Criar usuários'], 1, 'Agrupa as linhas e aplica a agregação em cada grupo.')
      ]
    },
    git: {
      nome: 'Versionamento e trabalho em equipe (Git)', curto: 'Git', tipo: 'hard',
      palavras: ['git', 'github', 'gitlab', 'versionamento', 'pull request', 'bitbucket'],
      conteudos: [
        c('git-1', 'curso', 'Git e GitHub', 'Curso em Vídeo (gratuito)', 10, 0, 1, L.cev),
        c('git-2', 'curso', 'Versionamento de código com Git e GitHub', 'DIO (gratuito)', 4, 0, 2, L.dio),
        c('git-3', 'curso', 'Git e GitHub: estratégias de branches e revisão de código', 'Alura', 8, 2, 2, L.alura('git github')),
        c('git-4', 'pratica', 'Contribua com um pull request revisado por um colega', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('O comando git commit:', ['Envia o código para o servidor', 'Registra um conjunto de alterações no histórico local', 'Apaga o repositório', 'Cria um novo repositório remoto'], 1, 'O commit grava as alterações no histórico local; o push envia ao remoto.'),
        q('Uma branch é:', ['Uma linha independente de desenvolvimento', 'Uma cópia de segurança em ZIP', 'Um usuário do repositório', 'Um erro de versão'], 0, 'Branches permitem trabalhar em paralelo sem afetar a principal.'),
        q('O comando git pull:', ['Apaga as alterações locais', 'Cria uma branch', 'Baixa e integra as alterações do repositório remoto', 'Lista os commits'], 2, 'Pull = buscar (fetch) e integrar (merge) o que está no remoto.'),
        q('Um pull request é:', ['Um pedido de acesso ao servidor', 'Um backup automático', 'Um relatório de erros', 'Uma proposta de mudança para revisão antes de integrar ao código principal'], 3, 'É no pull request que o time revisa e discute a mudança.'),
        q('Um conflito de merge acontece quando:', ['O repositório está vazio', 'Duas alterações mexem no mesmo trecho e o Git não consegue combiná-las sozinho', 'A internet cai', 'O commit não tem mensagem'], 1, 'O Git pede que alguém escolha qual versão do trecho deve ficar.')
      ]
    },
    processos: {
      nome: 'Processos, estoque e logística', curto: 'Processos e logística', tipo: 'hard',
      palavras: ['estoque', 'logística', 'logistica', 'almoxarifado', 'inventário', 'inventario', 'expedição', 'expedicao', 'wms', 'lean'],
      conteudos: [
        c('processos-1', 'curso', 'Gestão de estoques e logística', 'SEBRAE (cursos online)', 4, 0, 1, L.sebrae),
        c('processos-2', 'curso', 'Lean e melhoria contínua de processos', 'Udemy', 8, 1, 2, L.udemy('lean melhoria contínua de processos')),
        c('processos-3', 'livro', 'A Meta — Eliyahu M. Goldratt', 'Livro', 10, 1, 2, L.livro('A Meta Eliyahu Goldratt')),
        c('processos-4', 'pratica', 'Mapeie um processo do seu setor, encontre o gargalo e proponha uma melhoria', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('No método PEPS (FIFO) de controle de estoque:', ['O primeiro item que entra é o primeiro que sai', 'O último que entra é o primeiro que sai', 'Os itens saem por ordem de preço', 'Os itens não têm ordem de saída'], 0, 'PEPS: Primeiro que Entra, Primeiro que Sai — essencial para perecíveis.'),
        q('A curva ABC classifica os itens de estoque por:', ['Ordem alfabética', 'Cor da embalagem', 'Importância ou valor: poucos itens concentram a maior parte do valor', 'Data de fabricação'], 2, 'Itens A são poucos e valiosos; itens C são muitos e de baixo valor.'),
        q('O gargalo de um processo é:', ['A etapa mais barata', 'A etapa que limita a capacidade de todo o processo', 'O início do processo', 'O setor com mais pessoas'], 1, 'A produção total nunca supera a capacidade do gargalo.'),
        q('O inventário rotativo consiste em:', ['Contar tudo uma vez por ano', 'Não contar o estoque', 'Contar só os itens vendidos', 'Contar periodicamente parte dos itens para manter o saldo confiável'], 3, 'Contagens parciais frequentes evitam paradas e divergências.'),
        q('Lead time é:', ['O prazo de validade do produto', 'O tempo total entre o pedido e a entrega', 'O custo do frete', 'O estoque mínimo'], 1, 'Reduzir o lead time melhora o nível de serviço.')
      ]
    },
    financas: {
      nome: 'Finanças e rotinas administrativas', curto: 'Finanças', tipo: 'hard',
      palavras: ['financeiro', 'contas a pagar', 'contas a receber', 'fluxo de caixa', 'contabilidade', 'faturamento', 'fiscal', 'administrativo'],
      conteudos: [
        c('financas-1', 'curso', 'Gestão financeira', 'SEBRAE (cursos online)', 5, 0, 1, L.sebrae),
        c('financas-2', 'curso', 'Matemática financeira aplicada com Excel', 'Udemy', 8, 1, 2, L.udemy('matemática financeira excel')),
        c('financas-3', 'video', 'Fluxo de caixa e DRE na prática', 'YouTube (aulas gratuitas)', 2, 0, 2, L.youtube('fluxo de caixa e DRE na prática')),
        c('financas-4', 'pratica', 'Monte o fluxo de caixa de um mês e explique as três maiores variações', 'Desafio prático', 3, 0, 2)
      ],
      perguntas: [
        q('O fluxo de caixa registra:', ['Apenas as vendas a prazo', 'As entradas e saídas de dinheiro em um período', 'O valor dos imóveis da empresa', 'A folha de ponto'], 1, 'Ele mostra quanto dinheiro entrou e saiu, e quando.'),
        q('De forma simplificada, o lucro é:', ['A receita menos os custos e as despesas', 'O total vendido', 'O saldo no banco', 'O valor dos impostos'], 0, 'Receita − custos − despesas = lucro.'),
        q('Capital de giro é:', ['O valor dos equipamentos', 'O lucro do ano', 'O recurso que mantém a operação entre pagar fornecedores e receber dos clientes', 'O empréstimo do banco'], 2, 'Sem capital de giro, a empresa pode vender bem e ainda assim ficar sem caixa.'),
        q('Qual é um exemplo de custo fixo?', ['Comissão de vendas', 'Matéria-prima', 'Frete por entrega', 'Aluguel do imóvel'], 3, 'O aluguel não varia com o volume vendido no curto prazo.'),
        q('Um produto custa R$ 80 e é vendido por R$ 100. A margem sobre o preço de venda é:', ['25%', '20%', '80%', '125%'], 1, 'Lucro de R$ 20 ÷ preço de R$ 100 = 20%. (25% seria o markup sobre o custo.)')
      ]
    },
    seguranca: {
      nome: 'Segurança da informação e LGPD', curto: 'Segurança e LGPD', tipo: 'hard',
      palavras: ['lgpd', 'segurança da informação', 'seguranca da informacao', 'cibersegurança', 'ciberseguranca', 'iso 27001', 'privacidade'],
      conteudos: [
        c('seguranca-1', 'curso', 'Segurança em tecnologia da informação', 'Fundação Bradesco (Escola Virtual)', 12, 0, 1, L.bradesco),
        c('seguranca-2', 'curso', 'Introdução à Lei Geral de Proteção de Dados (LGPD)', 'Escola Virtual de Governo (gratuito)', 10, 0, 2, L.evg),
        c('seguranca-3', 'curso', 'Segurança da informação: boas práticas no dia a dia', 'Alura', 8, 2, 2, L.alura('segurança da informação')),
        c('seguranca-4', 'pratica', 'Revise onde sua equipe guarda dados pessoais e proponha três ajustes', 'Desafio prático', 2, 0, 2)
      ],
      perguntas: [
        q('Phishing é:', ['Uma mensagem falsa que tenta enganar a pessoa para roubar dados', 'Um tipo de backup', 'Um antivírus', 'Uma senha forte'], 0, 'Golpes de phishing imitam remetentes confiáveis para obter dados.'),
        q('Para a LGPD, dado pessoal é:', ['Qualquer dado de uma empresa', 'Apenas CPF e RG', 'Informação relacionada a uma pessoa identificada ou identificável', 'Somente dados bancários'], 2, 'Se a informação permite identificar alguém, é dado pessoal.'),
        q('A autenticação em dois fatores:', ['Dispensa o uso de senha', 'Exige uma segunda prova de identidade além da senha', 'Só funciona em celulares', 'Armazena as senhas em texto'], 1, 'Mesmo com a senha vazada, o segundo fator barra o acesso.'),
        q('Qual destes é um dado pessoal sensível segundo a LGPD?', ['CNPJ', 'Nome fantasia da empresa', 'Endereço comercial da loja', 'Dado de saúde'], 3, 'Saúde, biometria, religião e origem racial, entre outros, são dados sensíveis.'),
        q('A principal função de um backup é:', ['Deixar o computador mais rápido', 'Recuperar informações após perda, falha ou ataque', 'Bloquear sites', 'Atualizar o sistema'], 1, 'Sem backup, uma falha ou ataque pode significar perda definitiva.')
      ]
    }
  };

  // Áreas de atuação: competências-chave e nível esperado (1 a 5) para o cargo.
  var AREAS = {
    atendimento: { nome: 'Atendimento e caixa', cargos: ['Atendente', 'Analista de Atendimento', 'Operador(a) de Caixa', 'Assistente de SAC'],
      comp: { atendimento: 4, comunicacao: 4, conflitos: 3, excel: 3, digitais: 3, tempo: 3 } },
    vendas: { nome: 'Vendas e comercial', cargos: ['Vendedor(a)', 'Consultor(a) de Vendas', 'Representante Comercial'],
      comp: { negociacao: 4, comunicacao: 4, atendimento: 4, excel: 3, dados: 3, ingles: 2 } },
    administrativo: { nome: 'Administrativo', cargos: ['Assistente Administrativo', 'Auxiliar Administrativo', 'Analista Administrativo'],
      comp: { excel: 4, financas: 3, comunicacao: 3, tempo: 4, digitais: 4, projetos: 3 } },
    logistica: { nome: 'Estoque e logística', cargos: ['Estoquista', 'Auxiliar de Logística', 'Conferente', 'Analista de Logística'],
      comp: { processos: 4, excel: 3, dados: 3, tempo: 3, comunicacao: 3, digitais: 3 } },
    ti: { nome: 'Tecnologia da informação', cargos: ['Dev Front-end Jr.', 'Desenvolvedor(a)', 'Analista de Suporte', 'Analista de Sistemas'],
      comp: { logica: 4, web: 4, bd: 3, git: 4, ingles: 3, seguranca: 3, comunicacao: 3 } },
    dados: { nome: 'Dados e BI', cargos: ['Analista de Dados', 'Analista de BI', 'Assistente de Planejamento'],
      comp: { dados: 4, excel: 4, bd: 4, logica: 3, comunicacao: 3, ingles: 3 } },
    financeiro: { nome: 'Financeiro', cargos: ['Assistente Financeiro', 'Analista Financeiro', 'Analista Fiscal'],
      comp: { financas: 4, excel: 4, dados: 3, tempo: 3, comunicacao: 3, digitais: 3 } },
    rh: { nome: 'Recursos humanos', cargos: ['Analista de RH', 'Assistente de RH', 'Business Partner'],
      comp: { comunicacao: 4, conflitos: 4, lideranca: 3, dados: 3, seguranca: 3, excel: 3 } },
    gestao: { nome: 'Gestão e liderança', cargos: ['Gerente de Loja', 'Coordenador(a)', 'Supervisor(a)', 'Diretor(a) Regional'],
      comp: { lideranca: 4, conflitos: 4, comunicacao: 4, projetos: 4, dados: 3, tempo: 4 } }
  };

  var OBJETIVOS = {
    upskilling: { nome: 'Evoluir na área atual', curto: 'Evoluir na área atual', desc: 'Aprofundar competências no que você já faz' },
    reskilling: { nome: 'Migrar para outra área', curto: 'Migrar de área', desc: 'Construir competências para uma nova área' },
    indeciso: { nome: 'Ainda não sei', curto: 'Ainda decidindo', desc: 'Quero ver onde meu perfil se encaixa melhor' }
  };
  var TEMPOS = {
    '2h': { nome: 'Até 2 horas por semana', horas: 2 },
    '3-5h': { nome: '3 a 5 horas por semana', horas: 4 },
    '5h+': { nome: 'Mais de 5 horas por semana', horas: 6 }
  };
  var ORCAMENTOS = {
    gratuito: { nome: 'Somente conteúdo gratuito', teto: 0 },
    ate100: { nome: 'Até R$ 100 por mês', teto: 1 },
    acima100: { nome: 'Acima de R$ 100 por mês', teto: 2 }
  };
  var CUSTOS = ['Gratuito', 'Até R$ 100', 'Acima de R$ 100'];
  var TIPOS = { curso: 'Curso', livro: 'Livro', video: 'Vídeo', pratica: 'Prática' };

  // Planos comerciais (Plano de Vendas — Seção 19).
  var PLANOS = [
    { id: 'starter', nome: 'Starter', preco: 29, min: 100, max: 300, faixa: '100 a 300 colaboradores',
      itens: ['Diagnóstico e curadoria', 'Trilha individual', 'Onboarding self-service'] },
    { id: 'growth', nome: 'Growth', preco: 24, min: 301, max: 800, faixa: '301 a 800 colaboradores',
      itens: ['Tudo do Starter', 'Painel do administrador', 'Customer success dedicado'] },
    { id: 'enterprise', nome: 'Enterprise', preco: 19, min: 801, max: 2000, faixa: '801 a 2.000 colaboradores',
      itens: ['Tudo do Growth', 'Onboarding assistido', 'Relatórios executivos', 'Taxa de implantação à parte'] }
  ];

  var indiceConteudo = {};
  Object.keys(COMPETENCIAS).forEach(function (id) {
    COMPETENCIAS[id].id = id;
    COMPETENCIAS[id].conteudos.forEach(function (ct) { ct.comp = id; indiceConteudo[ct.id] = ct; });
  });
  Object.keys(AREAS).forEach(function (id) { AREAS[id].id = id; });

  window.Catalog = {
    COMPETENCIAS: COMPETENCIAS, AREAS: AREAS, OBJETIVOS: OBJETIVOS, TEMPOS: TEMPOS,
    ORCAMENTOS: ORCAMENTOS, CUSTOS: CUSTOS, TIPOS: TIPOS, PLANOS: PLANOS,
    comp: function (id) { return COMPETENCIAS[id]; },
    area: function (id) { return AREAS[id]; },
    conteudo: function (id) { return indiceConteudo[id]; },
    areas: function () { return Object.keys(AREAS).map(function (k) { return AREAS[k]; }); },
    competencias: function () { return Object.keys(COMPETENCIAS).map(function (k) { return COMPETENCIAS[k]; }); },
    planoPara: function (n) {
      if (n > 800) return PLANOS[2];
      if (n > 300) return PLANOS[1];
      return PLANOS[0];
    }
  };
})();
