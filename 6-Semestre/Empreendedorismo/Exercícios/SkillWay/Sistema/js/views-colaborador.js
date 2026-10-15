/* ==========================================================================
   SkillWay — Área do colaborador
   Início, diagnóstico, trilha, perfil, quizzes, certificados, mensagens e
   configurações.
   ========================================================================== */
(function () {
  'use strict';
  const { esc, ic, fmt } = UI;
  const C = Catalog;

  /* ---------- Blocos reutilizados (também pela área de gestão) ---------- */
  const Blocos = window.Blocos = {
    cab(titulo, sub, acoes) {
      return `<header class="pag-cab"><div><h1>${esc(titulo)}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${acoes ? `<div class="pag-acoes">${acoes}</div>` : ''}</header>`;
    },
    indicador(rotulo, valor, nota, cor) {
      return `<div class="cartao indicador"><span class="ind-rotulo">${esc(rotulo)}</span><span class="ind-valor">${valor}</span>${nota ? `<span class="ind-nota ${cor || ''}">${nota}</span>` : ''}</div>`;
    },
    vazio(icone, titulo, texto, acao) {
      return `<div class="vazio">${ic(icone, 30)}<h3>${esc(titulo)}</h3><p>${texto}</p>${acao || ''}</div>`;
    },
    metaConteudo(ct) {
      const fonte = (ct.tipo === 'curso' || ct.tipo === 'video') ? ` · ${esc(ct.fonte)}` : '';
      return `${C.TIPOS[ct.tipo]}${fonte} · ${fmt.horas(ct.horas)} · ${C.CUSTOS[ct.custo]}`;
    },
    iconeTipo(tipo) { return ic({ curso: 'curso', livro: 'livro', video: 'video', pratica: 'pratica' }[tipo] || 'curso'); },

    /** Linha de competência com barra de nível e marcador do esperado. */
    linhaComp(i) {
      return `<div class="comp-linha">
        <div class="comp-topo"><b>${esc(i.nome)}</b><span>Nível ${fmt.nivel(i.nivel)} · esperado ${i.alvo}</span></div>
        ${UI.barraNivel(i.nivel, i.alvo, i.status)}
      </div>`;
    },

    /** Relatório do Perfil da Pessoa — usado em "Meu perfil" e no relatório individual do gestor. */
    relatorio(userId, opt) {
      opt = opt || {};
      const p = Engine.perfil(userId), u = p.user;
      if (!p.diag) {
        return Blocos.vazio('diagnostico', opt.admin ? `${fmt.primeiro(u.nome)} ainda não fez o diagnóstico` : 'Seu perfil nasce do diagnóstico',
          opt.admin ? 'Sem o diagnóstico não há perfil nem trilha. Envie um lembrete para liberar o relatório.' : 'São cinco etapas e cerca de cinco minutos. Com ele o SkillWay monta o seu gap de competências e a sua trilha.',
          opt.admin ? '' : `<a class="btn btn-primario" href="#/diagnostico">Fazer diagnóstico</a>`);
      }
      const area = C.area(p.diag.areaAlvo), evo = Engine.evolucao(userId), afin = Engine.afinidades(userId);
      const inicio = evo.length ? evo[0].valor : p.aderencia;
      const linhas = p.itens.map(i => `<li class="status-item">
          <div><b>${esc(i.nome)}</b>
            <small>Esperado para o cargo: nível ${i.alvo}. Hoje: nível ${fmt.nivel(i.nivel)}${i.nivel !== i.auto ? ` (autoavaliação ${i.auto})` : ''}.</small>
            <span class="marcas">${i.evidencia ? `<span class="marca-mini">${ic('check', 13)} citado no currículo</span>` : ''}${i.quiz != null ? `<span class="marca-mini">${ic('quiz', 13)} quiz ${i.quiz}%</span>` : ''}</span>
          </div>${UI.statusComp(i.status)}</li>`).join('');
      const modulos = p.trilha ? p.trilha.modulos.map(m => {
        const feitos = m.passos.filter(x => x.status === 'concluido').length;
        const evid = m.passos.filter(x => x.evidencia).map(x => `<blockquote class="evidencia"><span>${esc(C.conteudo(x.conteudoId).titulo)}</span>${esc(x.evidencia)}</blockquote>`).join('');
        return `<li class="mod-resumo"><div class="mod-resumo-topo"><b>${esc(C.comp(m.comp).nome)}</b><span>${feitos} de ${m.passos.length} passos${m.certificadoId ? ' · certificado emitido' : ''}</span></div>${UI.barra(feitos / m.passos.length * 100)}${opt.admin ? evid : ''}</li>`;
      }).join('') : '';
      return `
      ${IA.cartaoPerfil(userId, opt)}
      <div class="grade g-2">
        <section class="cartao"><h2 class="cartao-titulo">Mapa de competências</h2>${UI.radar(p.itens)}</section>
        <section class="cartao"><h2 class="cartao-titulo">Status das competências</h2><ul class="status-lista">${linhas}</ul></section>
      </div>
      <div class="grade g-2">
        <section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">Evolução da aderência ao cargo</h2><span class="texto-suave">${inicio}% → ${p.aderencia}%</span></div>${UI.linha(evo)}
          <p class="nota-rodape">Aderência é quanto do nível esperado para o cargo já está coberto. Sobe com conteúdos concluídos e quizzes validados.</p></section>
        <section class="cartao"><h2 class="cartao-titulo">Diagnóstico</h2>
          <dl class="ficha">
            <div><dt>Objetivo</dt><dd>${esc(C.OBJETIVOS[p.diag.objetivo].curto)}</dd></div>
            <div><dt>Área de referência</dt><dd>${esc(area.nome)}</dd></div>
            <div><dt>Tempo disponível</dt><dd>${esc(C.TEMPOS[p.diag.tempo].nome)}</dd></div>
            <div><dt>Orçamento</dt><dd>${esc(C.ORCAMENTOS[p.diag.orcamento].nome)}</dd></div>
            <div><dt>Feito em</dt><dd>${fmt.data(p.diag.data)}${p.quantosDiagnosticos > 1 ? ` (${p.quantosDiagnosticos}º diagnóstico)` : ''}</dd></div>
            <div><dt>Horas de estudo</dt><dd>${fmt.horas(p.horas)}</dd></div>
          </dl>
          ${afin.length ? `<h3 class="sub-titulo">Outras áreas em que este perfil já se encaixa</h3><ul class="afinidades">${afin.map(a => `<li><span>${esc(a.area.nome)}</span>${UI.barra(a.pct)}<b>${a.pct}%</b></li>`).join('')}</ul><p class="nota-rodape">Calculado só com as competências já avaliadas (${afin.map(a => a.comuns + ' de ' + a.total).join(', ')}).</p>` : ''}
        </section>
      </div>
      <div class="grade g-2">
        <section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">Trilha de desenvolvimento</h2><span class="texto-suave">${p.progresso}% concluída</span></div>
          <ul class="mod-lista">${modulos}</ul></section>
        <section class="cartao"><h2 class="cartao-titulo">Certificados</h2>
          ${p.certificados.length ? `<ul class="lista-simples">${p.certificados.map(c => `<li><span>${ic('certificado')}<span><b>${esc(c.titulo)}</b><small>${fmt.data(c.emitidoEm)} · quiz ${c.nota}% · ${fmt.horas(c.horas)}</small></span></span><a class="link" href="#/certificado?id=${c.id}">Abrir</a></li>`).join('')}</ul>`
            : `<p class="vazio-mini">Nenhum certificado ainda. Ele é emitido quando todos os passos de uma competência são concluídos e o quiz é validado com ${Engine.NOTA_MINIMA}% ou mais.</p>`}
        </section>
      </div>`;
    }
  };

  /* ====================================================================== */
  /* Início                                                                  */
  /* ====================================================================== */
  Views.inicio = {
    titulo: 'Início',
    render(ctx) {
      const u = ctx.user, p = Engine.perfil(u.id);
      const pendQuiz = Store.quizzesPendentes(u.id);
      const caixa = Store.caixa(u.id);
      const perguntas = caixa.filter(m => m.tipo === 'pergunta' && !m.respondidoEm);
      const sugestoes = caixa.filter(m => m.tipo === 'sugestao' && !m.lidoEm);
      const pend = [
        ...pendQuiz.map(q => `<li><a href="#/quiz?id=${q.id}">${ic('quiz')}<span><b>${esc(q.titulo)}</b><small>Quiz enviado por ${esc(fmt.primeiro((Store.usuario(q.autorId) || {}).nome))}${q.prazo ? ' · até ' + fmt.dataCurta(q.prazo) : ''}</small></span>${ic('seta', 16)}</a></li>`),
        ...perguntas.map(m => `<li><a href="#/mensagens">${ic('mensagens')}<span><b>${esc(m.titulo)}</b><small>Pergunta de ${esc(fmt.primeiro((Store.usuario(m.de) || {}).nome))} aguardando a sua resposta</small></span>${ic('seta', 16)}</a></li>`),
        ...sugestoes.map(m => `<li><a href="#/mensagens">${ic('faisca')}<span><b>${esc(m.titulo)}</b><small>Conteúdo sugerido para a sua trilha</small></span>${ic('seta', 16)}</a></li>`)
      ];
      const blocoPend = pend.length ? `<section class="cartao"><h2 class="cartao-titulo">Aguardando você</h2><ul class="lista-links">${pend.join('')}</ul></section>` : '';
      const meta = ctx.empresa.meta;
      let blocoMeta = '';
      if (meta && meta.titulo) {
        const dias = meta.prazo ? -Store.diasDesde(meta.prazo + 'T23:59:00') : null;
        const item = p.itens.find(i => i.comp === meta.comp);
        blocoMeta = `<section class="cartao meta"><span class="meta-rotulo">${ic('alvo', 15)} Meta coletiva da empresa</span><h2>${esc(meta.titulo)}</h2><p>${esc(meta.descricao)}</p>
          <div class="meta-pe">${dias != null ? `<span class="chip">${ic('relogio', 14)} ${dias > 0 ? 'Faltam ' + dias + ' dias' : (dias === 0 ? 'Termina hoje' : 'Prazo encerrado')}</span>` : ''}
          ${item ? `<span class="chip">Seu nível em ${esc(item.curto)}: ${fmt.nivel(item.nivel)} (esperado ${item.alvo})</span>` : ''}</div></section>`;
      }

      if (!p.diag) {
        return Blocos.cab(`Olá, ${fmt.primeiro(u.nome)}!`, 'Seu caminho de desenvolvimento começa aqui.') +
          `<section class="cartao partida">
            <div><h2>Comece pelo diagnóstico</h2>
            <p>Em cerca de cinco minutos você conta em que área atua, aonde quer chegar e como avalia as suas competências. O SkillWay cruza isso com o que o cargo pede e monta uma trilha curta, na ordem certa.</p>
            <a class="btn btn-primario" href="#/diagnostico">Fazer diagnóstico</a></div>
            <ol class="estrada compacta">${['Área e currículo', 'Objetivo', 'Autoavaliação', 'Tempo e orçamento', 'Sua trilha'].map((t, i) => `<li><span class="estrada-marco">${i + 1}</span><div><b>${t}</b></div></li>`).join('')}</ol>
          </section>
          <div class="grade g-2">${blocoPend}${blocoMeta}</div>`;
      }

      const prox = Engine.proximoPasso(u.id);
      let blocoProx;
      if (prox) {
        const comp = C.comp(prox.modulo.comp);
        if (prox.passo.tipo === 'quiz') {
          blocoProx = `<span class="prox-rotulo">Seu próximo passo</span><h2>Quiz de validação: ${esc(comp.nome)}</h2><p>Cinco perguntas. Com ${Engine.NOTA_MINIMA}% ou mais você valida a competência e recebe o certificado.</p><a class="btn btn-primario" href="#/quiz?comp=${comp.id}">Fazer quiz</a>`;
        } else {
          const ct = C.conteudo(prox.passo.conteudoId);
          blocoProx = `<span class="prox-rotulo">Seu próximo passo${prox.passo.status === 'andamento' ? ' (em andamento)' : ''}</span><h2>${esc(ct.titulo)}</h2><p>${Blocos.metaConteudo(ct)} · desenvolve ${esc(comp.nome)}</p><a class="btn btn-primario" href="#/trilha">${prox.passo.status === 'andamento' ? 'Continuar' : 'Ir para a trilha'}</a>`;
        }
      } else {
        blocoProx = `<span class="prox-rotulo">Trilha concluída</span><h2>Você fechou todos os passos desta trilha</h2><p>Refaça o diagnóstico para registrar o novo nível e receber os próximos desafios.</p><a class="btn btn-primario" href="#/diagnostico">Refazer diagnóstico</a>`;
      }
      const modAtual = prox ? prox.modulo : (p.trilha ? p.trilha.modulos[0] : null);
      const passos = modAtual ? modAtual.passos.map((ps, i) => {
        const livre = Engine.liberado(modAtual, i);
        const estado = ps.status === 'concluido' ? 'feito' : (livre ? 'atual' : 'travado');
        const titulo = ps.tipo === 'quiz' ? 'Quiz de validação' : C.conteudo(ps.conteudoId).titulo;
        const sub = ps.status === 'concluido' ? (ps.tipo === 'quiz' ? `Validado com ${ps.nota}%` : `Concluído em ${fmt.dataCurta(ps.concluidoEm)}`)
          : (ps.status === 'andamento' ? 'Em andamento' : (livre ? 'Disponível agora' : 'Abre depois do passo anterior'));
        return `<li class="${estado}"><span class="estrada-marco">${estado === 'feito' ? ic('check', 14) : (estado === 'travado' ? ic('cadeado', 13) : i + 1)}</span><div><b>${esc(titulo)}</b><span>${sub}</span></div></li>`;
      }).join('') : '';
      const foco = p.itens.slice().sort((a, b) => (b.gap - a.gap) || (a.nivel - b.nivel)).slice(0, 4);

      return Blocos.cab(`Olá, ${fmt.primeiro(u.nome)}!`, 'Este é o panorama da sua evolução profissional hoje.',
          `<a class="btn btn-fantasma" href="#/diagnostico">${ic('faisca')} Refazer diagnóstico</a>`) +
        `<div class="grade g-4">
          ${Blocos.indicador('Tempo de estudo', fmt.horas(p.horas), p.horasSemana ? '+' + fmt.horas(p.horasSemana) + ' nesta semana' : 'nada registrado nesta semana', p.horasSemana ? 'verde' : '')}
          ${Blocos.indicador('Trilha concluída', p.progresso + '%', `${p.passosFeitos} de ${p.passosTotal} passos`)}
          ${Blocos.indicador('Aderência ao cargo', p.aderencia + '%', p.semanasRestantes ? `cerca de ${p.semanasRestantes} semanas para fechar a trilha` : 'trilha em dia')}
          ${Blocos.indicador('Certificados', p.certificados.length, p.certificados.length ? 'último ' + fmt.quando(p.certificados[0].emitidoEm) : 'o primeiro vem com a trilha')}
        </div>
        <div class="grade g-principal">
          <div class="coluna">
            <section class="cartao proximo">${blocoProx}</section>
            ${modAtual ? `<section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">${esc(C.comp(modAtual.comp).nome)}</h2><a class="link" href="#/trilha">Ver trilha completa</a></div><ol class="estrada compacta">${passos}</ol></section>` : ''}
            ${blocoPend}
          </div>
          <div class="coluna">
            <section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">Foco em desenvolvimento</h2><a class="link" href="#/perfil">Ver perfil</a></div>
              ${foco.map(Blocos.linhaComp).join('')}
              <p class="nota-rodape">O traço vertical marca o nível esperado para ${esc(u.cargo)}.</p></section>
            ${blocoMeta}
          </div>
        </div>`;
    }
  };

  /* ====================================================================== */
  /* Diagnóstico (formulário em cinco etapas — Seção 13)                     */
  /* ====================================================================== */
  const ETAPAS = ['Área e currículo', 'Objetivo', 'Autoavaliação', 'Disponibilidade', 'Conferência'];

  Views.diagnostico = {
    titulo: 'Diagnóstico', layout: 'foco', rotuloSair: 'Salvar e sair', voltarPara: 'inicio',
    render() { return '<div class="diag" id="diag"></div>'; },
    montar(raiz, ctx) {
      const el = raiz.querySelector('#diag') || raiz, u = ctx.user, ultimo = Store.diagnostico(u.id);
      let r = u.rascunho || {
        etapa: 1, max: 1, areaAtual: u.area, cargo: u.cargo, curriculo: u.curriculo || '',
        objetivo: null, areaAlvo: '', notas: {}, tempo: ultimo ? ultimo.tempo : null, orcamento: ultimo ? ultimo.orcamento : null
      };
      const guardar = () => { u.rascunho = r; Store.salvar(); };
      const areaRef = () => (r.objetivo === 'reskilling' && r.areaAlvo) ? r.areaAlvo : r.areaAtual;
      const alvos = () => Engine.alvos(u, areaRef());

      function erroDa(etapa) {
        if (etapa === 1) return (!r.areaAtual ? 'Escolha a sua área de atuação.' : (!r.cargo.trim() ? 'Informe o seu cargo atual.' : ''));
        if (etapa === 2) return !r.objetivo ? 'Escolha um objetivo.' : (r.objetivo === 'reskilling' && (!r.areaAlvo || r.areaAlvo === r.areaAtual) ? 'Escolha a área para a qual você quer migrar.' : '');
        if (etapa === 3) return alvos().some(a => !r.notas[a.comp]) ? 'Dê uma nota para cada competência.' : '';
        if (etapa === 4) return (!r.tempo || !r.orcamento) ? 'Escolha o tempo e o orçamento.' : '';
        return '';
      }
      const escolha = (grupo, valor, titulo, sub) => `<button type="button" class="escolha${r[grupo] === valor ? ' marcada' : ''}" data-grupo="${grupo}" data-valor="${valor}" aria-pressed="${r[grupo] === valor}"><span class="escolha-radio"></span><span><b>${esc(titulo)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></button>`;

      function corpoEtapa() {
        if (r.etapa === 1) {
          const cargos = (C.area(r.areaAtual) || { cargos: [] }).cargos;
          return `<h1>Qual é a sua área de atuação hoje?</h1>
            <p class="diag-sub">O SkillWay compara o seu perfil com o que o mercado espera do seu cargo.</p>
            <div class="campo-linha">
              <label class="campo"><span>Área</span><select class="entrada" data-campo="areaAtual">${UI.opcoes(C.areas().map(a => [a.id, a.nome]), r.areaAtual)}</select></label>
              <label class="campo"><span>Cargo atual</span><input class="entrada" data-campo="cargo" value="${esc(r.cargo)}" list="listaCargos" placeholder="Ex.: Analista de Atendimento"><datalist id="listaCargos">${cargos.map(c => `<option value="${esc(c)}">`).join('')}</datalist></label>
            </div>
            <label class="campo"><span>Currículo resumido <em>opcional</em></span>
              <textarea class="entrada" data-campo="curriculo" rows="4" placeholder="Formação, experiências e cursos que você já fez. Ex.: Técnico em Administração, dois anos em atendimento, Excel básico.">${esc(r.curriculo)}</textarea>
              <small>As competências citadas aqui aparecem como evidência no seu perfil.</small></label>`;
        }
        if (r.etapa === 2) {
          return `<h1>Você quer evoluir na sua área ou migrar para outra?</h1>
            <p class="diag-sub">A trilha parte do seu objetivo, não de uma lista de cursos.</p>
            <div class="escolhas">${Object.keys(C.OBJETIVOS).map(k => escolha('objetivo', k, C.OBJETIVOS[k].nome, C.OBJETIVOS[k].desc)).join('')}</div>
            ${r.objetivo === 'reskilling' ? `<label class="campo"><span>Para qual área você quer migrar?</span><select class="entrada" data-campo="areaAlvo">${UI.opcoes(C.areas().filter(a => a.id !== r.areaAtual).map(a => [a.id, a.nome]), r.areaAlvo, 'Escolha a área')}</select></label>` : ''}
            ${r.objetivo === 'indeciso' ? `<p class="aviso">${ic('info', 16)} Tudo bem. A trilha vai partir da sua área atual e o seu perfil vai mostrar em quais outras áreas você já se encaixa.</p>` : ''}`;
        }
        if (r.etapa === 3) {
          const evid = Engine.evidenciasCurriculo(r.curriculo), sug = r.sugestoes || {};
          const podeIA = IA.ativa() && r.curriculo.trim().length >= 30;
          return `<h1>Como você avalia o seu nível em cada competência?</h1>
            <p class="diag-sub">1 é iniciante e 5 é avançado. Estas são as competências-chave de <b>${esc(C.area(areaRef()).nome)}</b>. Responda com sinceridade: é isso que define a ordem da trilha.</p>
            ${podeIA ? `<p class="ia-linha"><button type="button" class="btn btn-fantasma btn-p" data-sugerir data-espera="Lendo o seu currículo…">${ic('faisca', 15)} ${r.sugestoes ? 'Pedir nova sugestão à IA' : 'Sugerir níveis a partir do meu currículo'}</button><span class="texto-suave">A IA sugere com base no que você escreveu no currículo. Quem decide a nota é você.</span></p>` : ''}
            ${r.resumoIA ? `<p class="aviso">${ic('faisca', 16)}<span><b>Leitura da IA:</b> ${esc(r.resumoIA)}</span></p>` : ''}
            ${alvos().map(a => { const comp = C.comp(a.comp); return `<div class="nota-grupo" role="group" aria-label="${esc(comp.nome)}">
                <div class="nota-topo"><b>${esc(comp.nome)}</b>${evid[a.comp] ? `<span class="marca-mini">${ic('check', 13)} citado no currículo</span>` : ''}</div>
                <div class="nota-linha"><span class="nota-ponta">Iniciante</span><div class="nota-opcoes">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="nota${r.notas[a.comp] === n ? ' marcada' : ''}" data-nota="${n}" data-comp="${a.comp}" aria-pressed="${r.notas[a.comp] === n}" aria-label="${esc(comp.nome)}: nota ${n}">${n}</button>`).join('')}</div><span class="nota-ponta fim">Avançado</span></div>
                ${sug[a.comp] ? `<p class="ia-sugestao">${ic('faisca', 13)} Sugestão da IA: nível ${sug[a.comp].nivel}. ${esc(sug[a.comp].evidencia)}</p>` : ''}
              </div>`; }).join('')}`;
        }
        if (r.etapa === 4) {
          return `<h1>Quanto tempo por semana você consegue estudar?</h1>
            <div class="escolhas">${Object.keys(C.TEMPOS).map(k => escolha('tempo', k, C.TEMPOS[k].nome)).join('')}</div>
            <h2 class="diag-h2">Qual é o seu orçamento mensal para capacitação?</h2>
            <div class="escolhas">${Object.keys(C.ORCAMENTOS).map(k => escolha('orcamento', k, C.ORCAMENTOS[k].nome)).join('')}</div>`;
        }
        const linhas = [
          ['Área atual', C.area(r.areaAtual).nome + ' · ' + r.cargo],
          ['Objetivo', C.OBJETIVOS[r.objetivo].nome + (r.objetivo === 'reskilling' ? ' → ' + C.area(r.areaAlvo).nome : '')],
          ...alvos().map(a => [C.comp(a.comp).nome, 'Nível ' + r.notas[a.comp] + ' de 5']),
          ['Disponibilidade', C.TEMPOS[r.tempo].nome], ['Orçamento', C.ORCAMENTOS[r.orcamento].nome]
        ];
        return `<h1>Confira as suas respostas</h1>
          <p class="diag-sub">${ultimo ? 'Ao concluir, uma nova trilha substitui a atual. Os conteúdos que você já concluiu continuam valendo.' : 'Ao concluir, o SkillWay monta o seu perfil e a sua trilha.'}</p>
          <dl class="resumo">${linhas.map(l => `<div><dt>${esc(l[0])}</dt><dd>${esc(l[1])}</dd></div>`).join('')}</dl>`;
      }

      function pintar() {
        const pct = Math.round((r.etapa - 1) / 5 * 100);
        el.innerHTML = `<div class="diag-progresso"><span>Diagnóstico de capacitação · etapa ${r.etapa} de 5</span><b>${pct}% concluído</b></div>
          <div class="barra grossa"><span style="width:${pct}%"></span></div>
          <ol class="diag-abas">${ETAPAS.map((t, i) => { const n = i + 1; return `<li><button type="button" data-etapa="${n}" class="${n === r.etapa ? 'atual' : (n < r.etapa ? 'feita' : '')}" ${n > r.max ? 'disabled' : ''} ${n === r.etapa ? 'aria-current="step"' : ''}>${n}. ${t}</button></li>`; }).join('')}</ol>
          <section class="cartao diag-cartao">${corpoEtapa()}
            <p class="erro-form" id="erroDiag" role="alert" hidden></p>
            <div class="diag-acoes"><button type="button" class="btn btn-fantasma" data-voltar ${r.etapa === 1 ? 'hidden' : ''}>${ic('voltar', 16)} Voltar</button>
            <button type="button" class="btn btn-primario" data-avancar>${r.etapa === 5 ? 'Concluir diagnóstico' : 'Continuar'}</button></div>
          </section>`;
      }

      function resultado() {
        const p = Engine.perfil(u.id);
        const gaps = p.itens.filter(i => i.gap > 0).sort((a, b) => b.gap - a.gap);
        el.innerHTML = `<section class="cartao diag-cartao diag-fim">
          <span class="diag-ok">${ic('check', 30)}</span>
          <h1>Diagnóstico concluído</h1>
          <p class="diag-sub">Seu perfil cobre <b>${p.aderencia}%</b> do que o cargo pede hoje. ${gaps.length ? `A trilha prioriza ${p.trilha.modulos.length} ${p.trilha.modulos.length === 1 ? 'competência' : 'competências'} e cabe em cerca de <b>${p.semanasRestantes} semanas</b> no seu ritmo.` : 'Você já atinge o nível esperado em tudo. A trilha propõe aprofundamento.'}</p>
          <ol class="estrada compacta">${p.trilha.modulos.map((m, i) => { const it = p.itens.find(x => x.comp === m.comp); return `<li class="atual"><span class="estrada-marco">${i + 1}</span><div><b>${esc(C.comp(m.comp).nome)}</b><span>${it ? `Nível ${fmt.nivel(it.nivel)} hoje, esperado ${it.alvo}` : ''} · ${m.passos.length} passos</span></div></li>`; }).join('')}</ol>
          <div class="diag-acoes centro"><a class="btn btn-fantasma" href="#/perfil${IA.ativa() ? '?ia=1' : ''}">${IA.ativa() ? ic('faisca', 16) + ' Ver a leitura da IA' : 'Ver meu perfil'}</a><a class="btn btn-primario" href="#/trilha">Ver minha trilha</a></div>
        </section>`;
        window.scrollTo(0, 0);
      }

      el.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        if (b.hasAttribute('data-sugerir')) {
          IA.comEspera(b, IA.pedir('curriculo', { curriculo: r.curriculo, areaAtual: r.areaAtual, objetivo: r.objetivo, areaAlvo: r.areaAlvo, cargo: r.cargo })).then(res => {
            r.sugestoes = {}; r.resumoIA = res.sugestao.resumo;
            res.sugestao.itens.forEach(i => { r.sugestoes[i.comp] = { nivel: i.nivel, evidencia: i.evidencia }; if (!r.notas[i.comp]) r.notas[i.comp] = i.nivel; });
            guardar(); pintar();
            UI.toast('Sugestões preenchidas. Revise e ajuste cada nota.', 'sucesso');
          }, () => {});
          return;
        }
        if (b.dataset.grupo) { r[b.dataset.grupo] = b.dataset.valor; if (b.dataset.grupo === 'objetivo') { r.sugestoes = null; r.resumoIA = ''; } guardar(); pintar(); return; }
        if (b.dataset.nota) {
          r.notas[b.dataset.comp] = parseInt(b.dataset.nota, 10); guardar();
          b.parentNode.querySelectorAll('.nota').forEach(n => { const on = n === b; n.classList.toggle('marcada', on); n.setAttribute('aria-pressed', on); });
          return;
        }
        if (b.dataset.etapa) { r.etapa = parseInt(b.dataset.etapa, 10); guardar(); pintar(); return; }
        if (b.hasAttribute('data-voltar')) { r.etapa = Math.max(1, r.etapa - 1); guardar(); pintar(); window.scrollTo(0, 0); return; }
        if (b.hasAttribute('data-avancar')) {
          const erro = erroDa(r.etapa);
          if (erro) { const box = el.querySelector('#erroDiag'); box.textContent = erro; box.hidden = false; return; }
          if (r.etapa < 5) { r.etapa++; r.max = Math.max(r.max, r.etapa); guardar(); pintar(); window.scrollTo(0, 0); return; }
          for (let n = 1; n <= 4; n++) { if (erroDa(n)) { r.etapa = n; pintar(); UI.toast(erroDa(n), 'erro'); return; } }
          const notas = {};
          alvos().forEach(a => { notas[a.comp] = r.notas[a.comp]; });
          Engine.salvarDiagnostico(u.id, { areaAtual: r.areaAtual, cargo: r.cargo.trim(), curriculo: r.curriculo.trim(), objetivo: r.objetivo, areaAlvo: r.areaAlvo, notas, tempo: r.tempo, orcamento: r.orcamento });
          delete u.rascunho; Store.salvar();
          const sair = document.getElementById('focoSair');
          if (sair) sair.textContent = 'Ir para o início';
          resultado();
        }
      });
      const campo = e => {
        const k = e.target.dataset.campo;
        if (!k) return;
        r[k] = e.target.value; guardar();
        if ((k === 'areaAtual' || k === 'areaAlvo') && e.type === 'change') { r.notas = {}; r.sugestoes = null; r.resumoIA = ''; guardar(); pintar(); }
      };
      el.addEventListener('input', campo);
      el.addEventListener('change', campo);
      pintar();
    }
  };

  /* ====================================================================== */
  /* Minha trilha                                                            */
  /* ====================================================================== */
  Views.trilha = {
    titulo: 'Minha trilha',
    render(ctx) {
      const u = ctx.user, p = Engine.perfil(u.id);
      if (!p.trilha) {
        return Blocos.cab('Minha trilha', 'O caminho priorizado entre o seu nível e o que o cargo pede.') +
          Blocos.vazio('trilha', 'A trilha é montada a partir do diagnóstico', 'Responda ao diagnóstico para receber poucos conteúdos, na ordem certa, dentro do seu tempo e orçamento.', '<a class="btn btn-primario" href="#/diagnostico">Fazer diagnóstico</a>');
      }
      const modulos = p.trilha.modulos.map((m, idx) => {
        const comp = C.comp(m.comp), item = p.itens.find(i => i.comp === m.comp);
        const feitos = m.passos.filter(x => x.status === 'concluido').length;
        const refs = item && item.gap > 0 ? Engine.referenciasInternas(u.id, m.comp) : [];
        const passos = m.passos.map((ps, i) => {
          const livre = Engine.liberado(m, i);
          const estado = ps.status === 'concluido' ? 'feito' : (livre ? 'atual' : 'travado');
          const marco = estado === 'feito' ? ic('check', 14) : (estado === 'travado' ? ic('cadeado', 13) : i + 1);
          if (ps.tipo === 'quiz') {
            const info = ps.status === 'concluido' ? `Validado com ${ps.nota}% em ${fmt.dataCurta(ps.concluidoEm)}`
              : (ps.nota != null ? `Melhor nota até agora: ${ps.nota}%. O mínimo é ${Engine.NOTA_MINIMA}%.` : `Cinco perguntas. Mínimo de ${Engine.NOTA_MINIMA}% para validar a competência.`);
            const acao = ps.status === 'concluido' ? `<a class="btn btn-fantasma btn-p" href="#/quiz?comp=${m.comp}">Praticar de novo</a>`
              : (livre ? `<a class="btn btn-primario btn-p" href="#/quiz?comp=${m.comp}">${ps.nota != null ? 'Tentar de novo' : 'Fazer quiz'}</a>` : '<span class="travado-txt">Abre depois dos conteúdos</span>');
            return `<li class="${estado}"><span class="estrada-marco">${marco}</span><div class="passo"><div class="passo-txt"><b>Quiz de validação</b><span>${info}</span></div><div class="passo-acoes">${acao}</div></div></li>`;
          }
          const ct = C.conteudo(ps.conteudoId);
          let info = Blocos.metaConteudo(ct), acao = '';
          if (ps.status === 'concluido') {
            info += ` · concluído em ${fmt.dataCurta(ps.concluidoEm)}${ps.herdado ? ' (trilha anterior)' : ''}`;
            acao = ct.url ? `<a class="btn btn-fantasma btn-p" href="${esc(ct.url)}" target="_blank" rel="noopener">${ic('externo', 15)} Rever</a>` : '';
          } else if (!livre) {
            acao = '<span class="travado-txt">Conclua o passo anterior</span>';
          } else if (ps.status === 'andamento') {
            acao = (ct.url ? `<a class="btn btn-fantasma btn-p" href="${esc(ct.url)}" target="_blank" rel="noopener">${ic('externo', 15)} Abrir</a>` : '') +
              `<button type="button" class="btn btn-primario btn-p" data-acao="concluir" data-passo="${ps.id}">Registrar conclusão</button>`;
          } else {
            acao = ct.url ? `<a class="btn btn-primario btn-p" href="${esc(ct.url)}" target="_blank" rel="noopener" data-acao="abrir" data-passo="${ps.id}">${ic('externo', 15)} Abrir conteúdo</a>`
              : `<button type="button" class="btn btn-primario btn-p" data-acao="comecar" data-passo="${ps.id}">Começar desafio</button>`;
          }
          return `<li class="${estado}"><span class="estrada-marco">${marco}</span><div class="passo"><div class="passo-txt"><b>${esc(ct.titulo)}</b><span>${info}</span>
            ${ps.sugerido ? '<span class="marca-mini">' + ic('faisca', 13) + ' sugerido pelo seu gestor</span>' : ''}${ps.status === 'andamento' ? '<span class="marca-mini andamento">em andamento</span>' : ''}
            ${ps.evidencia ? `<blockquote class="evidencia">${esc(ps.evidencia)}</blockquote>` : ''}</div><div class="passo-acoes">${acao}</div></div></li>`;
        }).join('');
        return `<section class="cartao modulo">
          <header class="modulo-topo"><div><span class="modulo-ordem">${p.trilha.aprofundamento ? 'Aprofundamento' : (m.sugerido ? 'Sugestão do gestor' : 'Prioridade ' + (idx + 1))}</span><h2>${esc(comp.nome)}</h2></div>
            <div class="modulo-nivel">${item ? `<span>Nível ${fmt.nivel(item.nivel)} · esperado ${item.alvo}</span>${UI.barraNivel(item.nivel, item.alvo, item.status)}` : ''}<small>${feitos} de ${m.passos.length} passos</small></div></header>
          <ol class="estrada">${passos}</ol>
          ${m.certificadoId ? `<p class="modulo-pe">${ic('certificado', 16)} Certificado emitido. <a class="link" href="#/certificado?id=${m.certificadoId}">Abrir certificado</a></p>` : ''}
          ${refs.length ? `<p class="modulo-pe">${ic('equipe', 16)} Quem pode ajudar na empresa: ${refs.map(x => `${esc(x.user.nome)} (${esc(x.user.cargo)}, nível ${fmt.nivel(x.nivel)})`).join(' e ')}.</p>` : ''}
        </section>`;
      }).join('');
      const tempo = C.TEMPOS[p.diag.tempo];
      return Blocos.cab('Minha trilha', p.progresso === 100 ? 'Todos os passos concluídos. Refaça o diagnóstico para receber os próximos.' :
          `${p.passosFeitos} de ${p.passosTotal} passos concluídos. Faltam ${fmt.horas(p.horasRestantes)} de conteúdo: cerca de ${p.semanasRestantes} ${p.semanasRestantes === 1 ? 'semana' : 'semanas'} estudando ${esc(tempo.nome.toLowerCase())}.`,
          `<a class="btn btn-fantasma" href="#/diagnostico">${ic('faisca')} Refazer diagnóstico</a>`) +
        `<div class="barra grossa trilha-barra"><span style="width:${p.progresso}%"></span></div>
        <p class="aviso">${ic('info', 16)} Os links abrem o portal ou a busca da plataforma parceira. O SkillWay indica o tema, o nível e a ordem; o conteúdo é da própria plataforma.</p>
        <div class="modulos">${modulos}</div>`;
    },
    montar(el, ctx) {
      const u = ctx.user;
      App.acoes(el, {
        abrir(alvo) { Engine.iniciarPasso(u.id, alvo.dataset.passo); setTimeout(() => App.atualizar(), 50); },
        comecar(alvo) { Engine.iniciarPasso(u.id, alvo.dataset.passo); UI.toast('Desafio iniciado. Registre a conclusão quando terminar.'); App.atualizar(); },
        concluir(alvo) {
          const a = Engine.acharPasso(u.id, alvo.dataset.passo), ct = C.conteudo(a.passo.conteudoId), pratica = ct.tipo === 'pratica';
          UI.modal({
            titulo: 'Registrar conclusão',
            corpo: `<p class="modal-texto"><b>${esc(ct.titulo)}</b></p>
              <form id="formConcluir">
                <label class="campo"><span>Horas dedicadas</span><input class="entrada" name="horas" type="number" min="0" max="500" step="0.5" value="${ct.horas}" required><small>Carga estimada: ${fmt.horas(ct.horas)}. Ajuste para o tempo que você realmente levou.</small></label>
                <label class="campo"><span>${pratica ? 'O que você fez e qual foi o resultado?' : 'O que você já aplicou ou pretende aplicar?'} ${pratica ? '' : '<em>opcional</em>'}</span>
                  <textarea class="entrada" name="evidencia" rows="3" ${pratica ? 'required' : ''} placeholder="${pratica ? 'Descreva a entrega. O seu gestor vê esta evidência.' : 'Uma ou duas frases bastam.'}"></textarea></label>
                <p class="erro-form" role="alert" hidden></p>
                <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="submit" class="btn btn-primario">Registrar conclusão</button></div>
              </form>`,
            aoMontar(m, ctl) {
              m.querySelector('form').addEventListener('submit', e => {
                e.preventDefault();
                const d = UI.dadosForm(e.target);
                if (pratica && d.evidencia.trim().length < 10) { const er = m.querySelector('.erro-form'); er.textContent = 'Descreva o que você fez em pelo menos uma frase.'; er.hidden = false; return; }
                const res = Engine.concluirPasso(u.id, a.passo.id, { horas: d.horas, evidencia: d.evidencia.trim() });
                ctl.fechar();
                UI.toast(res && res.certificado ? 'Conclusão registrada e certificado emitido.' : 'Conclusão registrada.', 'sucesso');
                App.atualizar();
              });
            }
          });
        }
      });
    }
  };

  /* ====================================================================== */
  /* Mentor IA: conversa com o Claude sobre a trilha e o desenvolvimento      */
  /* ====================================================================== */
  Views.mentor = {
    titulo: 'Mentor IA',
    render(ctx) {
      const cab = Blocos.cab('Mentor IA', 'Tire dúvidas sobre a sua trilha, sobre como estudar e sobre como aplicar o que aprende. O mentor conhece o seu perfil.',
        IA.ativa() ? `<button type="button" class="btn btn-fantasma" data-acao="limpar">${ic('lixeira')} Limpar conversa</button>` : '');
      if (!IA.ativa()) return cab + IA.aviso(ctx.user);
      return cab + `<section class="cartao chat">
          <div class="chat-msgs" id="chatMsgs" aria-live="polite"><p class="vazio-mini">Carregando a conversa…</p></div>
          <div class="chat-ideias" id="chatIdeias"></div>
          <form class="chat-form" id="chatForm"><label class="so-leitor" for="chatTexto">Sua pergunta</label>
            <textarea class="entrada" id="chatTexto" rows="2" maxlength="1500" placeholder="Escreva a sua pergunta" required></textarea>
            <button type="submit" class="btn btn-primario" data-espera="Pensando…">${ic('enviar', 16)} Enviar</button></form>
          <p class="nota-rodape">Respostas geradas pelo Claude (Anthropic) com os dados do seu perfil e da sua trilha. Podem conter erros: decisões sobre cargo e carreira são com o seu gestor e o RH.</p>
        </section>`;
    },
    montar(el, ctx) {
      if (!IA.ativa()) return;
      const u = ctx.user, caixa = el.querySelector('#chatMsgs'), form = el.querySelector('#chatForm'), campo = el.querySelector('#chatTexto'), ideias = el.querySelector('#chatIdeias');
      let msgs = [];
      const prox = Engine.proximoPasso(u.id), foco = prox ? C.comp(prox.modulo.comp).nome : null;
      const sugestoes = Store.diagnostico(u.id)
        ? ['Por onde eu começo nesta semana?', foco ? `Por que ${foco} é prioridade para o meu cargo?` : 'O que estudar depois de fechar a trilha?', 'Como aplico no trabalho o que estou estudando?']
        : ['Como funciona o diagnóstico?', 'O que eu ganho fazendo a trilha?'];
      const pintar = (pensando) => {
        caixa.innerHTML = (msgs.length ? msgs.map(m => `<div class="bolha ${m.papel === 'user' ? 'minha' : 'ia'}"><span class="bolha-quem">${m.papel === 'user' ? 'Você' : 'Mentor IA'}</span><p>${esc(m.texto)}</p></div>`).join('')
          : `<p class="vazio-mini">Nenhuma conversa ainda. Escolha uma das perguntas abaixo ou escreva a sua.</p>`) +
          (pensando ? '<div class="bolha ia"><span class="bolha-quem">Mentor IA</span><p><span class="ia-girando" aria-hidden="true"></span> Pensando…</p></div>' : '');
        ideias.innerHTML = msgs.length ? '' : sugestoes.map(t => `<button type="button" class="chip-botao" data-ideia="${esc(t)}">${esc(t)}</button>`).join('');
        caixa.scrollTop = caixa.scrollHeight;
      };
      const enviar = texto => {
        texto = texto.trim();
        if (!texto) return;
        const botao = form.querySelector('button');
        msgs.push({ papel: 'user', texto });
        campo.value = ''; campo.disabled = true; botao.disabled = true;
        pintar(true);
        IA.pedir('mentor', { mensagem: texto }).then(r => { msgs.push({ papel: 'assistant', texto: r.resposta }); },
          e => { msgs.pop(); campo.value = texto; UI.toast(e.message || 'O mentor não respondeu.', 'erro'); })
          .then(() => { campo.disabled = false; botao.disabled = false; pintar(false); campo.focus(); });
      };
      Store.api('GET', 'ia/mentor').then(r => { msgs = r.mensagens || []; pintar(false); }, () => { msgs = []; pintar(false); });
      form.addEventListener('submit', e => { e.preventDefault(); enviar(campo.value); });
      campo.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(campo.value); } });
      ideias.addEventListener('click', e => { const b = e.target.closest('[data-ideia]'); if (b) enviar(b.dataset.ideia); });
      App.acoes(el, {
        limpar() {
          UI.confirmar({ titulo: 'Limpar conversa', texto: 'Apagar todo o histórico da conversa com o mentor? Não dá para desfazer.', rotulo: 'Apagar histórico', perigo: true }).then(ok => {
            if (!ok) return;
            Store.api('DELETE', 'ia/mentor', {}).then(() => { msgs = []; pintar(false); UI.toast('Conversa apagada.', 'sucesso'); }, e => UI.toast(e.message, 'erro'));
          });
        }
      });
    }
  };

  /* ====================================================================== */
  /* Meu perfil                                                              */
  /* ====================================================================== */
  Views.perfil = {
    titulo: 'Meu perfil',
    render(ctx) {
      const u = ctx.user, p = Engine.perfil(u.id);
      return Blocos.cab('Meu perfil', `${esc(u.cargo)}${u.unidade ? ' · ' + esc(u.unidade) : ''}${p.aderencia != null ? ` · ${p.aderencia}% de aderência ao cargo` : ''}`,
        p.diag ? `<button type="button" class="btn btn-fantasma" data-acao="imprimir">${ic('imprimir')} Imprimir ou salvar em PDF</button>` : '') + Blocos.relatorio(u.id);
    },
    montar(el, ctx) {
      App.acoes(el, { imprimir() { window.print(); } });
      IA.ligar(el);
      // Vindo do diagnóstico (?ia=1): gera a leitura automaticamente se ainda não existe para o diagnóstico atual.
      const diag = Store.diagnostico(ctx.user.id), a = Store.analise('an_perfil_' + ctx.user.id);
      const botao = el.querySelector('[data-ia="perfil"]');
      if (ctx.params.ia && botao && diag && (!a || a.chave !== diag.id)) botao.click();
    }
  };

  /* ====================================================================== */
  /* Quizzes                                                                 */
  /* ====================================================================== */
  Views.quizzes = {
    titulo: 'Quizzes',
    render(ctx) {
      const u = ctx.user, p = Engine.perfil(u.id);
      const recebidos = Store.quizzesPara(u.id).map(q => {
        const t = Store.tentativaDoQuiz(q.id, u.id), autor = Store.usuario(q.autorId);
        return `<li><span>${ic('quiz')}<span><b>${esc(q.titulo)}</b><small>${esc(C.comp(q.comp).nome)} · ${q.perguntas.length} perguntas · enviado por ${esc(autor ? autor.nome : 'gestor')}${q.prazo && !t ? ' · até ' + fmt.dataCurta(q.prazo) : ''}</small></span></span>
          ${t ? `<span class="lado">${UI.etiqueta(t.pct + '%', t.pct >= Engine.NOTA_MINIMA ? 'verde' : 'amarelo')}<a class="link" href="#/quiz?id=${q.id}">Ver respostas</a></span>` : `<a class="btn btn-primario btn-p" href="#/quiz?id=${q.id}">Responder</a>`}</li>`;
      }).join('');
      const validacao = p.trilha ? p.trilha.modulos.map(m => {
        const quiz = m.passos[m.passos.length - 1], livre = Engine.liberado(m, m.passos.length - 1);
        const estado = quiz.status === 'concluido' ? UI.etiqueta('Validado com ' + quiz.nota + '%', 'verde') : (livre ? (quiz.nota != null ? UI.etiqueta('Melhor nota ' + quiz.nota + '%', 'amarelo') : UI.etiqueta('Disponível', 'ciano')) : UI.etiqueta('Abre depois dos conteúdos', ''));
        return `<li><span>${ic('alvo')}<span><b>${esc(C.comp(m.comp).nome)}</b><small>Quiz de validação da trilha</small></span></span><span class="lado">${estado}${IA.ativa() ? `<a class="link" href="#/quiz?comp=${m.comp}&ia=1">Treinar com IA</a>` : ''}<a class="link" href="#/quiz?comp=${m.comp}">${quiz.status === 'concluido' || !livre ? 'Praticar' : 'Fazer quiz'}</a></span></li>`;
      }).join('') : '';
      const naTrilha = p.trilha ? p.trilha.modulos.map(m => m.comp) : [];
      const pratica = p.itens.filter(i => naTrilha.indexOf(i.comp) < 0).map(i =>
        `<li><span>${ic('quiz')}<span><b>${esc(i.nome)}</b><small>${i.quiz != null ? 'Melhor nota: ' + i.quiz + '%' : 'Ainda sem tentativas'}</small></span></span><span class="lado">${IA.ativa() ? `<a class="link" href="#/quiz?comp=${i.comp}&ia=1">Treinar com IA</a>` : ''}<a class="link" href="#/quiz?comp=${i.comp}">Praticar</a></span></li>`).join('');
      return Blocos.cab('Quizzes', 'Perguntas curtas para validar o que você aprendeu e mostrar evolução.') +
        `<section class="cartao"><h2 class="cartao-titulo">Enviados pelo seu gestor ou RH</h2>${recebidos ? `<ul class="lista-simples">${recebidos}</ul>` : '<p class="vazio-mini">Nenhum quiz recebido até agora.</p>'}</section>
        <section class="cartao"><h2 class="cartao-titulo">Validação da trilha</h2>${validacao ? `<ul class="lista-simples">${validacao}</ul>` : '<p class="vazio-mini">Os quizzes de validação aparecem depois do diagnóstico. <a class="link" href="#/diagnostico">Fazer diagnóstico</a></p>'}</section>
        ${pratica ? `<section class="cartao"><h2 class="cartao-titulo">Praticar outras competências do cargo</h2><ul class="lista-simples">${pratica}</ul></section>` : ''}`;
    }
  };

  /* ---------- Quiz: uma pergunta por vez ---------- */
  Views.quiz = {
    titulo: 'Quiz', layout: 'foco', rotuloSair: 'Sair do quiz', voltarPara: 'quizzes',
    render() { return '<div class="diag" id="quizArea"></div>'; },
    montar(raiz, ctx) {
      const el = raiz.querySelector('#quizArea') || raiz, u = ctx.user;
      const quiz = ctx.params.id ? Store.quiz(ctx.params.id) : null;
      const compId = quiz ? quiz.comp : ctx.params.comp;
      const comp = C.comp(compId);
      if (!comp || (ctx.params.id && (!quiz || quiz.destinatarios.indexOf(u.id) < 0))) {
        el.innerHTML = Blocos.vazio('quiz', 'Quiz não encontrado', 'Este quiz não existe ou não foi enviado para você.', '<a class="btn btn-primario" href="#/quizzes">Ver meus quizzes</a>');
        return;
      }
      const treinoIA = !quiz && !!ctx.params.ia;
      const titulo = quiz ? quiz.titulo : (treinoIA ? 'Treino com IA: ' + comp.nome : 'Quiz de ' + comp.nome);
      const trilha = Store.trilha(u.id), modulo = trilha ? trilha.modulos.find(m => m.comp === compId) : null;
      const valida = !quiz && !treinoIA && modulo && Engine.liberado(modulo, modulo.passos.length - 1);

      function revisao(t, extra, usadas) {
        const ok = t.pct >= Engine.NOTA_MINIMA;
        const perguntas = usadas || (quiz ? quiz.perguntas : null);
        el.innerHTML = `<section class="cartao diag-cartao">
          <div class="quiz-nota ${ok ? 'ok' : 'baixo'}"><b>${t.pct}%</b><span>${t.acertos} de ${t.total} corretas</span></div>
          <h1>${esc(titulo)}</h1>
          <p class="diag-sub">${extra || (quiz ? 'Suas respostas foram enviadas para quem criou o quiz.' : '')}</p>
          <ol class="quiz-revisao">${t.detalhe.map((d, i) => {
            const origem = (perguntas ? perguntas[i] : null) || comp.perguntas.find(x => x.p === d.p) || {};
            const ops = origem.opcoes || [];
            return `<li class="${d.certo ? 'certo' : 'errado'}"><b>${esc(d.p)}</b>
              <span>${d.certo ? ic('check', 15) : ic('fechar', 15)} Sua resposta: ${esc(ops[d.escolhida] != null ? ops[d.escolhida] : '—')}</span>
              ${d.certo ? '' : `<span class="correta">Correta: ${esc(ops[d.correta] != null ? ops[d.correta] : '—')}</span>`}
              ${origem.porque ? `<small>${esc(origem.porque)}</small>` : ''}</li>`;
          }).join('')}</ol>
          <div class="diag-acoes centro">${quiz ? '<a class="btn btn-primario" href="#/quizzes">Voltar aos quizzes</a>'
            : `<button type="button" class="btn btn-fantasma" data-de-novo>Tentar de novo</button><a class="btn btn-primario" href="#/${modulo ? 'trilha' : 'quizzes'}">${modulo ? 'Voltar para a trilha' : 'Voltar aos quizzes'}</a>`}</div>
        </section>`;
        const de = el.querySelector('[data-de-novo]');
        if (de) de.addEventListener('click', comecar);
        window.scrollTo(0, 0);
      }

      /** No treino com IA, as perguntas vêm do Claude, calibradas pelo nível atual da pessoa. */
      function comecar() {
        if (!treinoIA) { jogar(quiz ? quiz.perguntas : Engine.perguntasDe(compId, 5)); return; }
        if (!IA.ativa()) { el.innerHTML = `<section class="cartao diag-cartao"><h1>${esc(titulo)}</h1>${IA.aviso(u)}<div class="diag-acoes centro"><a class="btn btn-primario" href="#/quiz?comp=${compId}">Usar as perguntas da base</a></div></section>`; return; }
        const item = Engine.perfil(u.id).itens.find(i => i.comp === compId);
        const nivel = !item || item.nivel <= 2 ? 'básico' : (item.nivel <= 3.5 ? 'intermediário' : 'avançado');
        el.innerHTML = `<section class="cartao diag-cartao diag-fim"><span class="ia-girando grande" aria-hidden="true"></span><h1>Preparando o seu treino</h1><p class="diag-sub">O Claude está escrevendo cinco perguntas de nível ${nivel} sobre ${esc(comp.nome)}, pensadas para o cargo de ${esc(u.cargo)}.</p></section>`;
        IA.pedir('quiz', { comp: compId, quantidade: 5, nivel }).then(r => jogar(r.perguntas), e => {
          el.innerHTML = Blocos.vazio('quiz', 'Não foi possível gerar o treino', esc(e.message || 'A IA não respondeu.'), `<a class="btn btn-primario" href="#/quiz?comp=${compId}">Usar as perguntas da base</a>`);
        });
      }

      function jogar(perguntas) {
        const ordens = perguntas.map(p => Engine.embaralhar(p.opcoes.map((_, i) => i)));
        const respostas = [];
        let atual = 0;
        function pintar() {
          const p = perguntas[atual], pct = Math.round(atual / perguntas.length * 100);
          el.innerHTML = `<div class="diag-progresso"><span>${esc(titulo)} · pergunta ${atual + 1} de ${perguntas.length}</span><b>${esc(comp.curto)}</b></div>
            <div class="barra grossa"><span style="width:${pct}%"></span></div>
            <section class="cartao diag-cartao">
              <h1 class="quiz-pergunta">${esc(p.p)}</h1>
              <div class="escolhas" role="radiogroup" aria-label="Alternativas">${ordens[atual].map(i => `<button type="button" class="escolha${respostas[atual] === i ? ' marcada' : ''}" data-op="${i}" role="radio" aria-checked="${respostas[atual] === i}"><span class="escolha-radio"></span><span><b>${esc(p.opcoes[i])}</b></span></button>`).join('')}</div>
              <div class="diag-acoes"><button type="button" class="btn btn-fantasma" data-voltar ${atual === 0 ? 'hidden' : ''}>${ic('voltar', 16)} Voltar</button>
              <button type="button" class="btn btn-primario" data-avancar ${respostas[atual] == null ? 'disabled' : ''}>${atual === perguntas.length - 1 ? 'Enviar respostas' : 'Próxima'}</button></div>
            </section>`;
        }
        el.onclick = e => {
          const b = e.target.closest('button');
          if (!b) return;
          if (b.dataset.op != null) { respostas[atual] = parseInt(b.dataset.op, 10); pintar(); return; }
          if (b.hasAttribute('data-voltar')) { atual--; pintar(); return; }
          if (b.hasAttribute('data-avancar')) {
            if (atual < perguntas.length - 1) { atual++; pintar(); return; }
            el.onclick = null;
            const res = Engine.registrarQuiz(u.id, { quizId: quiz ? quiz.id : null, comp: compId, perguntas, respostas, validar: valida, pratica: treinoIA });
            let extra = '';
            if (treinoIA) extra = 'Treino com perguntas geradas pelo Claude. Não altera o seu nível nem valida a competência: para isso, use o quiz de validação da trilha.';
            else if (!quiz) {
              if (res.certificado) extra = `Competência validada. O certificado de ${esc(comp.nome)} foi emitido. <a class="link" href="#/certificado?id=${res.certificado.id}">Abrir certificado</a>`;
              else if (res.aprovado && valida) extra = 'Competência validada. O certificado sai quando todos os passos do módulo estiverem concluídos.';
              else if (res.aprovado) extra = modulo ? 'Boa nota. Ela conta no seu perfil; a validação da trilha abre depois dos conteúdos.' : 'Boa nota. Ela já conta no seu perfil.';
              else extra = `O mínimo para validar é ${Engine.NOTA_MINIMA}%. Revise as explicações abaixo e tente de novo.`;
            }
            revisao(res.tentativa, extra, perguntas);
          }
        };
        pintar();
      }

      const anterior = quiz ? Store.tentativaDoQuiz(quiz.id, u.id) : null;
      if (anterior) revisao(anterior, `Respondido em ${fmt.data(anterior.data)}.`);
      else comecar();
    }
  };

  /* ====================================================================== */
  /* Certificados                                                            */
  /* ====================================================================== */
  Views.certificados = {
    titulo: 'Certificados',
    render(ctx) {
      const lista = Store.certificados(ctx.user.id);
      return Blocos.cab('Certificados', 'Cada certificado comprova conteúdos concluídos, prática aplicada e quiz validado.') +
        (lista.length ? `<div class="grade g-3">${lista.map(c => `<a class="cartao cert-mini" href="#/certificado?id=${c.id}">
            <span class="cert-selo">${ic('certificado', 26)}</span><h2>${esc(c.titulo)}</h2>
            <p>Emitido em ${fmt.data(c.emitidoEm)}</p><p>Quiz ${c.nota}% · ${fmt.horas(c.horas)} de estudo</p><span class="link">Abrir certificado</span></a>`).join('')}</div>`
          : Blocos.vazio('certificado', 'Nenhum certificado ainda', `O certificado é emitido quando você conclui todos os passos de uma competência e passa no quiz com ${Engine.NOTA_MINIMA}% ou mais.`, '<a class="btn btn-primario" href="#/trilha">Ir para a trilha</a>'));
    }
  };

  Views.certificado = {
    titulo: 'Certificado',
    render(ctx) {
      const c = Store.db.certificados.find(x => x.id === ctx.params.id);
      const dono = c ? Store.usuario(c.userId) : null;
      if (!c || !dono || (dono.id !== ctx.user.id && !Store.podeGerir(ctx.user, dono.id))) {
        return Blocos.cab('Certificado', '') + Blocos.vazio('certificado', 'Certificado não encontrado', 'Ele não existe ou pertence a outra pessoa.', '<a class="btn btn-primario" href="#/certificados">Ver meus certificados</a>');
      }
      const emp = Store.empresa(dono.empresaId);
      return Blocos.cab('Certificado', esc(c.titulo), `<a class="btn btn-fantasma" href="#/${dono.id === ctx.user.id ? 'certificados' : 'pessoa?id=' + dono.id}">${ic('voltar')} Voltar</a><button type="button" class="btn btn-primario" data-acao="imprimir">${ic('imprimir')} Imprimir ou salvar em PDF</button>`) +
        `<article class="certificado">
          <div class="certificado-topo">${UI.marca(34)}<span>Certificado de evolução</span></div>
          <p class="certificado-linha">Certificamos que</p>
          <h2>${esc(dono.nome)}</h2>
          <p class="certificado-linha">${esc(dono.cargo)} · ${esc(emp.nome)}</p>
          <p class="certificado-texto">concluiu a trilha de desenvolvimento da competência</p>
          <h3>${esc(c.titulo)}</h3>
          <p class="certificado-texto">com ${fmt.horas(c.horas)} de estudo registradas, prática aplicada no trabalho e ${c.nota}% de acerto no quiz de validação.</p>
          <div class="certificado-pe"><div><b>${fmt.data(c.emitidoEm)}</b><span>Data de emissão</span></div><div><b>${esc(c.codigo)}</b><span>Código de verificação</span></div></div>
        </article>`;
    },
    montar(el) { App.acoes(el, { imprimir() { window.print(); } }); }
  };

  /* ====================================================================== */
  /* Mensagens                                                               */
  /* ====================================================================== */
  const TIPO_MSG = {
    sugestao: ['faisca', 'Sugestão de conteúdo'], pergunta: ['mensagens', 'Pergunta'], lembrete: ['relogio', 'Lembrete'],
    quiz: ['quiz', 'Quiz'], sistema: ['certificado', 'SkillWay'], reconhecimento: ['certificado', 'Reconhecimento']
  };
  Views.mensagens = {
    titulo: 'Mensagens',
    render(ctx) {
      const u = ctx.user, lista = Store.caixa(u.id);
      if (!lista.length) return Blocos.cab('Mensagens', 'Sugestões, perguntas e lembretes do seu gestor ou do RH.') + Blocos.vazio('mensagens', 'Nenhuma mensagem', 'Quando o seu gestor enviar uma sugestão, uma pergunta ou um quiz, aparece aqui.');
      const itens = lista.map(m => {
        const tipo = TIPO_MSG[m.tipo] || TIPO_MSG.sistema, de = m.de ? Store.usuario(m.de) : null;
        const ct = m.conteudoId ? C.conteudo(m.conteudoId) : null;
        let acoes = '';
        if (m.tipo === 'sugestao' && ct) {
          const trilha = Store.trilha(u.id);
          const jaTem = trilha && trilha.modulos.some(mod => mod.passos.some(p => p.conteudoId === ct.id));
          acoes = `<div class="msg-conteudo">${Blocos.iconeTipo(ct.tipo)}<span><b>${esc(ct.titulo)}</b><small>${Blocos.metaConteudo(ct)} · ${esc(C.comp(ct.comp).nome)}</small></span></div>
            <div class="msg-acoes">${ct.url ? `<a class="btn btn-fantasma btn-p" href="${esc(ct.url)}" target="_blank" rel="noopener">${ic('externo', 15)} Abrir conteúdo</a>` : ''}
            ${jaTem ? '<span class="marca-mini">' + ic('check', 13) + ' já está na sua trilha</span>' : (trilha ? `<button type="button" class="btn btn-primario btn-p" data-acao="adicionar" data-id="${m.id}">Adicionar à minha trilha</button>` : '<a class="link" href="#/diagnostico">Faça o diagnóstico para montar a trilha</a>')}</div>`;
        } else if (m.tipo === 'sugestao' && m.link) {
          acoes = `<div class="msg-acoes"><a class="btn btn-fantasma btn-p" href="${esc(m.link)}" target="_blank" rel="noopener">${ic('externo', 15)} Abrir link</a></div>`;
        } else if (m.tipo === 'pergunta') {
          acoes = m.respondidoEm ? `<blockquote class="evidencia"><span>Sua resposta, ${fmt.quando(m.respondidoEm)}</span>${esc(m.resposta)}</blockquote>`
            : `<form class="msg-resposta" data-id="${m.id}"><label class="campo"><span>Sua resposta</span><textarea class="entrada" name="resposta" rows="3" required></textarea></label><button type="submit" class="btn btn-primario btn-p">${ic('enviar', 15)} Enviar resposta</button></form>`;
        } else if (m.tipo === 'quiz' && m.quizId && Store.quiz(m.quizId)) {
          const t = Store.tentativaDoQuiz(m.quizId, u.id);
          acoes = `<div class="msg-acoes">${t ? `<span class="marca-mini">${ic('check', 13)} respondido com ${t.pct}%</span>` : `<a class="btn btn-primario btn-p" href="#/quiz?id=${m.quizId}">Responder quiz</a>`}</div>`;
        } else if (m.tipo === 'lembrete' && !Store.diagnostico(u.id)) {
          acoes = '<div class="msg-acoes"><a class="btn btn-primario btn-p" href="#/diagnostico">Fazer diagnóstico</a></div>';
        }
        return `<li class="msg${m.lidoEm ? '' : ' nova'}"><span class="msg-icone">${ic(tipo[0])}</span><div>
          <div class="msg-topo"><span>${tipo[1]}${de ? ' · ' + esc(de.nome) : ''}</span><time>${fmt.quando(m.criadoEm)}</time>${m.lidoEm ? '' : UI.etiqueta('Nova', 'ciano')}</div>
          <h2>${esc(m.titulo)}</h2>${m.corpo ? `<p>${esc(m.corpo)}</p>` : ''}${acoes}</div></li>`;
      }).join('');
      return Blocos.cab('Mensagens', 'Sugestões, perguntas e lembretes do seu gestor ou do RH.') + `<ul class="msgs">${itens}</ul>`;
    },
    montar(el, ctx) {
      const u = ctx.user;
      let mudou = false;
      Store.caixa(u.id).forEach(m => { if (!m.lidoEm) { m.lidoEm = Store.agora(); mudou = true; } });
      if (mudou) {
        Store.salvar();
        const selo = document.querySelector('.nav-item[href="#/mensagens"] .selo');
        if (selo) selo.remove();
      }
      App.acoes(el, {
        adicionar(alvo) {
          const m = Store.db.mensagens.find(x => x.id === alvo.dataset.id);
          UI.toast(Engine.adicionarSugestao(u.id, m.conteudoId) ? 'Conteúdo adicionado à sua trilha.' : 'Este conteúdo já está na sua trilha.', 'sucesso');
          App.atualizar();
        }
      });
      el.addEventListener('submit', e => {
        const f = e.target.closest('.msg-resposta');
        if (!f) return;
        e.preventDefault();
        const m = Store.db.mensagens.find(x => x.id === f.dataset.id), texto = f.elements.resposta.value.trim();
        if (!texto) return;
        m.resposta = texto; m.respondidoEm = Store.agora(); Store.salvar();
        UI.toast('Resposta enviada.', 'sucesso');
        App.atualizar();
      });
    }
  };

  /* ====================================================================== */
  /* Configurações                                                           */
  /* ====================================================================== */
  Views.configuracoes = {
    titulo: 'Configurações',
    render(ctx) {
      const u = ctx.user, cadeia = Store.cadeiaAcima(u.id), diretos = Store.diretos(u.id);
      return Blocos.cab('Configurações', 'Seus dados, seu currículo e sua senha.') + `
        <div class="grade g-2">
          <section class="cartao"><h2 class="cartao-titulo">Meus dados</h2>
            <form id="formDados">
              <label class="campo"><span>Nome</span><input class="entrada" name="nome" value="${esc(u.nome)}" required></label>
              <label class="campo"><span>E-mail corporativo</span><input class="entrada" value="${esc(u.email)}" disabled><small>O e-mail é o seu acesso. Para trocar, fale com o RH.</small></label>
              <label class="campo"><span>Currículo resumido</span><textarea class="entrada" name="curriculo" rows="5" placeholder="Formação, experiências e cursos.">${esc(u.curriculo || '')}</textarea><small>Usado no seu perfil como evidência de competências.</small></label>
              <button type="submit" class="btn btn-primario">Salvar dados</button>
            </form></section>
          <div class="coluna">
            <section class="cartao"><h2 class="cartao-titulo">Minha posição na empresa</h2>
              <dl class="ficha"><div><dt>Empresa</dt><dd>${esc(ctx.empresa.nome)}</dd></div><div><dt>Cargo</dt><dd>${esc(u.cargo)}</dd></div>
                <div><dt>Área</dt><dd>${esc(C.area(u.area).nome)}</dd></div><div><dt>Unidade</dt><dd>${esc(u.unidade || '—')}</dd></div>
                <div><dt>Gestor direto</dt><dd>${cadeia.length ? esc(cadeia[0].nome) + ' · ' + esc(cadeia[0].cargo) : 'Sem gestor cadastrado'}</dd></div>
                <div><dt>Equipe direta</dt><dd>${diretos.length ? diretos.length + (diretos.length === 1 ? ' pessoa' : ' pessoas') : 'Nenhuma'}</dd></div></dl>
              <p class="nota-rodape">Cargo, área, unidade e gestor são definidos por quem administra você no SkillWay.</p></section>
            <section class="cartao"><h2 class="cartao-titulo">Alterar senha</h2>
              <form id="formSenha">
                <label class="campo"><span>Senha atual</span><input class="entrada" type="password" name="atual" autocomplete="current-password" required></label>
                <label class="campo"><span>Nova senha</span><input class="entrada" type="password" name="nova" autocomplete="new-password" required><small>Pelo menos 6 caracteres.</small></label>
                <p class="erro-form" role="alert" hidden></p>
                <button type="submit" class="btn btn-fantasma">Alterar senha</button>
              </form></section>
          </div>
        </div>`;
    },
    montar(el, ctx) {
      const u = ctx.user;
      el.querySelector('#formDados').addEventListener('submit', e => {
        e.preventDefault();
        const d = UI.dadosForm(e.target);
        if (!d.nome.trim()) { UI.toast('Informe o seu nome.', 'erro'); return; }
        u.nome = d.nome.trim(); u.curriculo = d.curriculo.trim(); Store.salvar();
        UI.toast('Dados salvos.', 'sucesso'); App.atualizar();
      });
      el.querySelector('#formSenha').addEventListener('submit', e => {
        e.preventDefault();
        const d = UI.dadosForm(e.target), erro = e.target.querySelector('.erro-form');
        const form = e.target;
        Store.trocarMinhaSenha(d.atual, d.nova).then(r => {
          if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
          form.reset(); erro.hidden = true;
          UI.toast('Senha alterada.', 'sucesso');
        });
      });
    }
  };
})();
