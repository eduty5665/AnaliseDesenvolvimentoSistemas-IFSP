/* ==========================================================================
   SkillWay — Área de gestão (gestores e RH)
   Visão geral, equipe e organograma, relatórios, sugestões e quizzes,
   benchmarks e dados da empresa. Cada administrador enxerga quem está abaixo
   dele na hierarquia; o RH enxerga a empresa toda.
   ========================================================================== */
(function () {
  'use strict';
  const { esc, ic, fmt } = UI;
  const C = Catalog, B = window.Blocos;

  const escopo = (u, emp) => u.rh ? emp.nome : (u.unidade || 'Sua estrutura');
  const modAtual = p => {
    if (!p.diag) return 'Diagnóstico pendente';
    const prox = Engine.proximoPasso(p.user.id);
    return prox ? C.comp(prox.modulo.comp).nome : 'Trilha concluída';
  };
  const corStatus = { critico: 'vermelho', atencao: 'amarelo', ok: 'verde' };

  function seletorPessoas(pessoas, marcados) {
    const set = {};
    (marcados || pessoas.map(p => p.id)).forEach(id => { set[id] = true; });
    return `<fieldset class="seletor"><legend>Para quem <button type="button" class="link" data-todos>marcar todos</button> <button type="button" class="link" data-nenhum>limpar</button></legend>
      <div class="seletor-lista">${pessoas.map(p => `<label><input type="checkbox" name="para" value="${p.id}" ${set[p.id] ? 'checked' : ''}><span>${esc(p.nome)}<small>${esc(p.cargo)}${p.unidade ? ' · ' + esc(p.unidade) : ''}</small></span></label>`).join('')}</div></fieldset>`;
  }
  function ligarSeletor(m) {
    m.addEventListener('click', e => {
      if (e.target.closest('[data-todos]')) m.querySelectorAll('[name=para]').forEach(c => { c.checked = true; });
      if (e.target.closest('[data-nenhum]')) m.querySelectorAll('[name=para]').forEach(c => { c.checked = false; });
    });
  }
  const marcadosDe = m => Array.from(m.querySelectorAll('[name=para]:checked')).map(c => c.value);

  /* ---------- Ações compartilhadas ---------- */
  const Gestao = {
    lembrete(admin, ids, motivo) {
      if (!ids.length) return;
      ids.forEach(id => {
        const alvo = Store.usuario(id), diag = motivo === 'diagnostico';
        Store.enviarMensagem({
          empresaId: admin.empresaId, de: admin.id, para: id, tipo: 'lembrete',
          titulo: diag ? 'Lembrete: faça o seu diagnóstico' : 'Lembrete: a sua trilha está esperando',
          corpo: diag ? `${fmt.primeiro(alvo.nome)}, o diagnóstico leva cerca de cinco minutos e libera a sua trilha de desenvolvimento.`
            : `${fmt.primeiro(alvo.nome)}, faz alguns dias que a sua trilha não avança. Reserve um horário nesta semana para o próximo passo. Se algo estiver travando, me avise.`
        });
      });
      Store.salvar();
      UI.toast(ids.length === 1 ? 'Lembrete enviado.' : ids.length + ' lembretes enviados.', 'sucesso');
    },
    parabens(admin, id, certId, compNome) {
      Store.enviarMensagem({ empresaId: admin.empresaId, de: admin.id, para: id, tipo: 'reconhecimento', grupo: certId,
        titulo: 'Parabéns pelo certificado de ' + compNome,
        corpo: `${fmt.primeiro(Store.usuario(id).nome)}, vi que você concluiu a trilha de ${compNome}. Bom trabalho. Vamos conversar sobre como aplicar isso na rotina da equipe.` });
      Store.salvar();
      UI.toast('Reconhecimento enviado.', 'sucesso');
    },

    sugestao(admin, preset) {
      preset = preset || {};
      const equipe = Store.equipe(admin);
      const compIni = preset.comp || 'comunicacao';
      const optsConteudo = comp => C.comp(comp).conteudos.map(ct => [ct.id, `${ct.titulo} (${C.TIPOS[ct.tipo]}, ${fmt.horas(ct.horas)}, ${C.CUSTOS[ct.custo]})`]);
      UI.modal({
        titulo: 'Enviar sugestão de conteúdo', classe: 'largo',
        corpo: `<form id="formSug">
          <div class="campo-linha">
            <label class="campo"><span>Competência</span><select class="entrada" name="comp">${UI.opcoes(C.competencias().map(c => [c.id, c.nome]), compIni)}</select></label>
            <label class="campo"><span>Conteúdo da base curada</span><select class="entrada" name="conteudo">${UI.opcoes(optsConteudo(compIni), '')}</select></label>
          </div>
          <label class="campo"><span>Ou um link seu <em>opcional</em></span><input class="entrada" name="link" type="url" placeholder="https://"><small>Se preencher, o link substitui o conteúdo da base.</small></label>
          <label class="campo"><span>Mensagem</span><textarea class="entrada" name="corpo" rows="3" placeholder="Por que este conteúdo vale o tempo da pessoa?" required></textarea></label>
          ${seletorPessoas(equipe, preset.ids || [])}
          <p class="erro-form" role="alert" hidden></p>
          <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="submit" class="btn btn-primario">${ic('enviar', 16)} Enviar sugestão</button></div>
        </form>`,
        aoMontar(m, ctl) {
          ligarSeletor(m);
          const f = m.querySelector('form');
          f.elements.comp.addEventListener('change', () => { f.elements.conteudo.innerHTML = UI.opcoes(optsConteudo(f.elements.comp.value), ''); });
          f.addEventListener('submit', e => {
            e.preventDefault();
            const d = UI.dadosForm(f), ids = marcadosDe(m), erro = m.querySelector('.erro-form');
            const link = d.link.trim();
            const msg = !ids.length ? 'Escolha pelo menos uma pessoa.' : (!d.corpo.trim() ? 'Escreva uma mensagem curta.' : (link && !/^https?:\/\//i.test(link) ? 'O link precisa começar com http:// ou https://.' : ''));
            if (msg) { erro.textContent = msg; erro.hidden = false; return; }
            const ct = C.conteudo(d.conteudo);
            ids.forEach(id => Store.enviarMensagem({ empresaId: admin.empresaId, de: admin.id, para: id, tipo: 'sugestao',
              conteudoId: link ? null : ct.id, link, titulo: link ? 'Sugestão de ' + fmt.primeiro(admin.nome) + ': ' + C.comp(d.comp).curto : 'Sugestão de ' + fmt.primeiro(admin.nome) + ': ' + ct.titulo, corpo: d.corpo.trim() }));
            Store.salvar(); ctl.fechar();
            UI.toast(ids.length === 1 ? 'Sugestão enviada.' : 'Sugestão enviada para ' + ids.length + ' pessoas.', 'sucesso');
            App.atualizar();
          });
        }
      });
    },

    pergunta(admin) {
      const equipe = Store.equipe(admin);
      UI.modal({
        titulo: 'Fazer pergunta à equipe', classe: 'largo',
        corpo: `<form id="formPerg">
          <label class="campo"><span>Pergunta</span><input class="entrada" name="titulo" maxlength="140" placeholder="Ex.: O que mais ajudaria você a evoluir neste trimestre?" required></label>
          <label class="campo"><span>Contexto <em>opcional</em></span><textarea class="entrada" name="corpo" rows="2" placeholder="Para que você vai usar as respostas."></textarea></label>
          ${seletorPessoas(equipe)}
          <p class="erro-form" role="alert" hidden></p>
          <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="submit" class="btn btn-primario">${ic('enviar', 16)} Enviar pergunta</button></div>
        </form>`,
        aoMontar(m, ctl) {
          ligarSeletor(m);
          m.querySelector('form').addEventListener('submit', e => {
            e.preventDefault();
            const d = UI.dadosForm(e.target), ids = marcadosDe(m), erro = m.querySelector('.erro-form');
            const msg = !d.titulo.trim() ? 'Escreva a pergunta.' : (!ids.length ? 'Escolha pelo menos uma pessoa.' : '');
            if (msg) { erro.textContent = msg; erro.hidden = false; return; }
            const grupo = Store.uid('perg');
            ids.forEach(id => Store.enviarMensagem({ empresaId: admin.empresaId, de: admin.id, para: id, tipo: 'pergunta', grupo, titulo: d.titulo.trim(), corpo: d.corpo.trim() }));
            Store.salvar(); ctl.fechar();
            UI.toast('Pergunta enviada para ' + ids.length + (ids.length === 1 ? ' pessoa.' : ' pessoas.'), 'sucesso');
            App.ir('engajamento?aba=perguntas');
          });
        }
      });
    },

    novoQuiz(admin, preset) {
      preset = preset || {};
      const equipe = Store.equipe(admin);
      let comp = preset.comp || 'comunicacao';
      let qs = Engine.perguntasDe(comp, 5);
      const prazo = Store.diasAtras(-7).slice(0, 10);
      const blocoPerguntas = () => qs.map((q, i) => `<div class="q-edit" data-i="${i}">
          <div class="q-edit-topo"><b>Pergunta ${i + 1}</b><button type="button" class="btn-icone" data-remover="${i}" aria-label="Remover pergunta ${i + 1}">${ic('lixeira', 16)}</button></div>
          <textarea class="entrada" data-q="p" rows="2" placeholder="Enunciado da pergunta">${esc(q.p)}</textarea>
          <div class="q-opcoes">${[0, 1, 2, 3].map(n => `<label><input type="radio" name="correta${i}" value="${n}" ${q.correta === n ? 'checked' : ''} aria-label="Marcar alternativa ${n + 1} como correta"><input class="entrada" data-q="o${n}" value="${esc(q.opcoes[n] || '')}" placeholder="Alternativa ${n + 1}"></label>`).join('')}</div>
        </div>`).join('') || '<p class="vazio-mini">Nenhuma pergunta. Gere da base ou adicione uma em branco.</p>';
      UI.modal({
        titulo: 'Novo quiz', classe: 'largo',
        corpo: `<form id="formQuiz">
          <div class="campo-linha">
            <label class="campo"><span>Competência</span><select class="entrada" name="comp">${UI.opcoes(C.competencias().map(c => [c.id, c.nome]), comp)}</select></label>
            <label class="campo"><span>Prazo</span><input class="entrada" type="date" name="prazo" value="${prazo}"></label>
          </div>
          <label class="campo"><span>Título</span><input class="entrada" name="titulo" value="${esc('Checagem rápida: ' + C.comp(comp).nome)}" required></label>
          <div class="q-barra"><span>Perguntas <small>marque a alternativa correta de cada uma</small></span>
            <span><button type="button" class="btn btn-fantasma btn-p" data-gerar>Usar a base curada</button> <button type="button" class="btn btn-fantasma btn-p" data-nova>${ic('mais', 15)} Em branco</button></span></div>
          ${IA.ativa() ? `<div class="ia-gerador"><b>${ic('faisca', 15)} Gerar perguntas com o Claude</b>
            <div class="ia-gerador-campos">
              <label class="campo"><span>Quantidade</span><select class="entrada" name="iaQtd">${UI.opcoes([[3, '3 perguntas'], [5, '5 perguntas'], [8, '8 perguntas']], 5)}</select></label>
              <label class="campo"><span>Dificuldade</span><select class="entrada" name="iaNivel">${UI.opcoes([['básico', 'Básico'], ['intermediário', 'Intermediário'], ['avançado', 'Avançado']], 'intermediário')}</select></label>
              <label class="campo ia-contexto"><span>Contexto <em>opcional</em></span><input class="entrada" name="iaContexto" maxlength="300" placeholder="Ex.: situações de caixa em dia de loja cheia"></label>
              <button type="button" class="btn btn-primario btn-p" data-ia-quiz data-espera="Escrevendo as perguntas…">Gerar com IA</button>
            </div><small>As perguntas substituem as da lista abaixo. Revise o enunciado e o gabarito antes de enviar.</small></div>` : ''}
          <div id="qLista">${blocoPerguntas()}</div>
          ${seletorPessoas(equipe, preset.ids)}
          <p class="erro-form" role="alert" hidden></p>
          <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="submit" class="btn btn-primario">${ic('enviar', 16)} Enviar quiz</button></div>
        </form>`,
        aoMontar(m, ctl) {
          ligarSeletor(m);
          const f = m.querySelector('form'), lista = m.querySelector('#qLista');
          const ler = () => {
            lista.querySelectorAll('.q-edit').forEach(bloco => {
              const q = qs[parseInt(bloco.dataset.i, 10)];
              q.p = bloco.querySelector('[data-q=p]').value;
              q.opcoes = [0, 1, 2, 3].map(n => bloco.querySelector('[data-q=o' + n + ']').value);
              const marc = bloco.querySelector('input[type=radio]:checked');
              q.correta = marc ? parseInt(marc.value, 10) : -1;
            });
          };
          const pintar = () => { lista.innerHTML = blocoPerguntas(); };
          let tituloTocado = false, origem = 'base';
          f.elements.titulo.addEventListener('input', () => { tituloTocado = true; });
          f.elements.comp.addEventListener('change', () => {
            comp = f.elements.comp.value; qs = Engine.perguntasDe(comp, 5); pintar();
            if (!tituloTocado) f.elements.titulo.value = 'Checagem rápida: ' + C.comp(comp).nome;
          });
          m.addEventListener('click', e => {
            const rem = e.target.closest('[data-remover]');
            if (rem) { ler(); qs.splice(parseInt(rem.dataset.remover, 10), 1); pintar(); }
            if (e.target.closest('[data-gerar]')) { qs = Engine.perguntasDe(comp, 5); origem = 'base'; pintar(); }
            const bIA = e.target.closest('[data-ia-quiz]');
            if (bIA && !bIA.disabled) {
              IA.comEspera(bIA, IA.pedir('quiz', { comp, quantidade: f.elements.iaQtd.value, nivel: f.elements.iaNivel.value, contexto: f.elements.iaContexto.value })).then(r => {
                qs = r.perguntas; origem = 'ia'; pintar();
                UI.toast(r.perguntas.length + ' perguntas geradas. Revise o gabarito antes de enviar.', 'sucesso');
              }, () => {});
            }
            if (e.target.closest('[data-nova]')) { ler(); qs.push({ p: '', opcoes: ['', '', '', ''], correta: -1, porque: '' }); pintar(); }
          });
          f.addEventListener('submit', e => {
            e.preventDefault(); ler();
            const d = UI.dadosForm(f), ids = marcadosDe(m), erro = m.querySelector('.erro-form');
            let msg = '';
            const limpas = [];
            qs.forEach((q, i) => {
              const ops = q.opcoes.map(o => o.trim());
              const validas = ops.filter(Boolean);
              if (!q.p.trim()) msg = msg || `A pergunta ${i + 1} está sem enunciado.`;
              else if (validas.length < 2) msg = msg || `A pergunta ${i + 1} precisa de pelo menos duas alternativas.`;
              else if (q.correta < 0 || !ops[q.correta]) msg = msg || `Marque a alternativa correta da pergunta ${i + 1}.`;
              else limpas.push({ p: q.p.trim(), opcoes: validas, correta: validas.indexOf(ops[q.correta]), porque: q.porque || '' });
            });
            if (!d.titulo.trim()) msg = 'Dê um título ao quiz.';
            else if (!qs.length) msg = 'Adicione pelo menos uma pergunta.';
            else if (!msg && !ids.length) msg = 'Escolha pelo menos uma pessoa.';
            if (msg) { erro.textContent = msg; erro.hidden = false; return; }
            const quiz = { id: Store.uid('quiz'), empresaId: admin.empresaId, autorId: admin.id, titulo: d.titulo.trim(), comp, perguntas: limpas, prazo: d.prazo || '', criadoEm: Store.agora(), destinatarios: ids, origem };
            Store.db.quizzes.push(quiz);
            ids.forEach(id => Store.enviarMensagem({ empresaId: admin.empresaId, de: admin.id, para: id, tipo: 'quiz', quizId: quiz.id, titulo: 'Novo quiz: ' + quiz.titulo,
              corpo: `${limpas.length} ${limpas.length === 1 ? 'pergunta' : 'perguntas'} sobre ${C.comp(comp).nome}.${quiz.prazo ? ' Prazo: ' + fmt.data(quiz.prazo) + '.' : ''}` }));
            Store.salvar(); ctl.fechar();
            UI.toast('Quiz enviado para ' + ids.length + (ids.length === 1 ? ' pessoa.' : ' pessoas.'), 'sucesso');
            App.ir('engajamento?aba=quizzes');
          });
        }
      });
    },

    executar(admin, acao) {
      if (acao.tipo === 'lembrete') { Gestao.lembrete(admin, acao.ids, acao.motivo); App.atualizar(); }
      else if (acao.tipo === 'parabens') { Gestao.parabens(admin, acao.ids[0], acao.certId, acao.compNome); App.atualizar(); }
      else if (acao.tipo === 'quiz') Gestao.novoQuiz(admin, { comp: acao.comp, ids: acao.ids });
    }
  };

  function linhasCsvEquipe(perfis) {
    return [['Nome', 'E-mail', 'Cargo', 'Área', 'Unidade', 'Gestor', 'Status', 'Aderência ao cargo (%)', 'Progresso da trilha (%)', 'Horas de estudo', 'Certificados', 'Última atividade']]
      .concat(perfis.map(p => {
        const g = p.user.gestorId ? Store.usuario(p.user.gestorId) : null;
        return [p.user.nome, p.user.email, p.user.cargo, C.area(p.user.area).nome, p.user.unidade, g ? g.nome : '', Engine.rotuloStatus(p).texto,
          p.aderencia == null ? '' : p.aderencia, p.diag ? p.progresso : '', fmt.num(p.horas), p.certificados.length, p.ultimaAtividade ? p.ultimaAtividade.slice(0, 10) : ''];
      }));
  }

  /* ====================================================================== */
  /* Visão geral                                                             */
  /* ====================================================================== */
  Views.gestao = {
    titulo: 'Visão geral da equipe', admin: true,
    render(ctx) {
      const u = ctx.user, equipe = Store.equipe(u), r = Engine.resumoEquipe(equipe), sugs = Engine.sugestoes(u);
      const diretos = Store.diretos(u.id).length;
      if (!equipe.length) {
        return B.cab('Visão geral da equipe', esc(escopo(u, ctx.empresa))) + B.vazio('equipe', 'Sua equipe ainda está vazia', 'Cadastre as pessoas uma a uma ou importe o organograma de uma planilha. Quem você indicar como gestor passa a administrar o próprio time.', '<a class="btn btn-primario" href="#/equipe">Montar a equipe</a>');
      }
      return B.cab('Visão geral da equipe', `${esc(escopo(u, ctx.empresa))} · ${equipe.length} ${equipe.length === 1 ? 'pessoa' : 'pessoas'}${u.rh ? '' : `, ${diretos} ${diretos === 1 ? 'direta' : 'diretas'}`}`,
          `<label class="busca">${ic('busca', 16)}<input class="entrada" id="busca" type="search" placeholder="Buscar colaborador" aria-label="Buscar colaborador"></label>
           <button type="button" class="btn btn-fantasma" data-acao="exportar">${ic('baixar')} Exportar relatório</button>
           <button type="button" class="btn btn-primario" data-acao="quiz">${ic('mais')} Novo quiz</button>`) +
        `<div class="grade g-4">
          ${B.indicador('Pessoas na equipe', r.total, u.rh ? 'empresa toda' : 'quem responde a você, direta ou indiretamente')}
          ${B.indicador('Diagnósticos concluídos', `${r.comDiagnostico}<small> de ${r.total}</small>`, r.comDiagnostico < r.total ? (r.total - r.comDiagnostico) + ' pendente' + (r.total - r.comDiagnostico > 1 ? 's' : '') : 'todos fizeram', r.comDiagnostico < r.total ? 'amarelo' : 'verde')}
          ${B.indicador('Progresso médio na trilha', r.progressoMedio + '%', `aderência média ao cargo: ${r.aderenciaMedia}%`)}
          ${B.indicador('Certificados emitidos', r.certificados, fmt.horas(r.horas) + ' de estudo registradas')}
        </div>
        <div class="grade g-principal">
          <section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">Progresso por colaborador</h2><a class="link" href="#/equipe">Gerenciar equipe</a></div>
            <div class="tabela-rolagem"><table class="tabela" id="tabEquipe"><thead><tr><th>Colaborador</th><th>Módulo atual</th><th>Progresso</th><th>Status</th></tr></thead>
            <tbody>${r.perfis.map(p => { const st = Engine.rotuloStatus(p); return `<tr data-busca="${esc(Store.semAcento(p.user.nome + ' ' + p.user.cargo + ' ' + p.user.unidade))}">
              <td><a class="linha-link" href="#/pessoa?id=${p.user.id}">${UI.pessoaCel(p.user)}</a></td>
              <td class="suave">${esc(modAtual(p))}</td>
              <td><span class="prog">${UI.barra(p.progresso, st.cor)}<small>${p.diag ? p.progresso + '%' : '—'}</small></span></td>
              <td>${UI.etiqueta(st.texto, st.cor)}</td></tr>`; }).join('')}</tbody></table></div>
            <p class="vazio-mini" id="semResultado" hidden>Nenhum colaborador encontrado.</p></section>
          <div class="coluna">
            <section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">Gap de competências da equipe</h2><a class="link" href="#/benchmarks">Detalhar</a></div>
              ${r.competencias.length ? r.competencias.slice(0, 5).map(c => `<div class="comp-linha"><div class="comp-topo"><b>${esc(c.nome)}</b>${UI.statusComp(c.status)}</div>${UI.barra(c.cobertura, corStatus[c.status])}<small class="comp-nota">Média ${fmt.nivel(c.nivel)} para ${fmt.nivel(c.alvo)} esperado · ${c.abaixo.length} de ${c.pessoas} abaixo</small></div>`).join('') : '<p class="vazio-mini">Aparece quando alguém da equipe concluir o diagnóstico.</p>'}
            </section>
            ${IA.cartaoEquipe(u)}
            <section class="cartao"><h2 class="cartao-titulo">Alertas automáticos</h2>
              ${sugs.length ? `<ul class="sugs">${sugs.map((s, i) => `<li class="${s.cor}"><b>${esc(s.titulo)}</b><p>${esc(s.texto)}</p><button type="button" class="btn btn-fantasma btn-p" data-acao="sugestao" data-i="${i}">${esc(s.acao.rotulo)}</button></li>`).join('')}</ul>` : '<p class="vazio-mini">Nada pede atenção agora. A equipe está em dia.</p>'}
              <p class="nota-rodape">Regras fixas sobre os dados da equipe: diagnósticos pendentes, dias sem avanço, competências abaixo do esperado e certificados novos.</p>
            </section>
          </div>
        </div>`;
    },
    montar(el, ctx) {
      const u = ctx.user, sugs = Engine.sugestoes(u);
      const busca = el.querySelector('#busca');
      if (busca) busca.addEventListener('input', () => {
        const termo = Store.semAcento(busca.value);
        let visiveis = 0;
        el.querySelectorAll('#tabEquipe tbody tr').forEach(tr => { const ok = tr.dataset.busca.indexOf(termo) >= 0; tr.hidden = !ok; if (ok) visiveis++; });
        el.querySelector('#semResultado').hidden = visiveis > 0;
      });
      App.acoes(el, {
        exportar() { UI.baixar('skillway-equipe.csv', UI.csv(linhasCsvEquipe(Engine.resumoEquipe(Store.equipe(u)).perfis)), 'text/csv;charset=utf-8'); UI.toast('Relatório exportado em CSV.', 'sucesso'); },
        quiz() { Gestao.novoQuiz(u); },
        sugestao(alvo) { Gestao.executar(u, sugs[parseInt(alvo.dataset.i, 10)].acao); },
        // Ação sugerida pelo Claude na leitura da equipe.
        iaAcao(alvo) {
          const a = Store.analise('an_equipe_' + u.id), acao = a && a.resultado.acoes[parseInt(alvo.dataset.i, 10)];
          if (!acao) return;
          const ids = (acao.ids || []).filter(id => Store.podeGerir(u, id));
          if (!ids.length) { UI.toast('As pessoas citadas não fazem mais parte da sua equipe.', 'erro'); return; }
          if (acao.tipo === 'lembrete') {
            Gestao.lembrete(u, ids.filter(id => !Store.diagnostico(id)), 'diagnostico');
            Gestao.lembrete(u, ids.filter(id => Store.diagnostico(id)), 'trilha');
            App.atualizar();
          } else if (acao.tipo === 'quiz') Gestao.novoQuiz(u, { comp: acao.comp, ids });
          else if (acao.tipo === 'conteudo') Gestao.sugestao(u, { comp: acao.comp, ids });
        }
      });
      IA.ligar(el);
    }
  };

  /* ====================================================================== */
  /* Minha equipe: lista, organograma, cadastro e importação                 */
  /* ====================================================================== */
  function gestoresPossiveis(admin, alvoId) {
    let lista = admin.rh ? Store.pessoas(admin.empresaId) : [admin].concat(Store.equipe(admin));
    if (alvoId) {
      const abaixo = Store.abaixo(alvoId).map(x => x.id);
      lista = lista.filter(p => p.id !== alvoId && abaixo.indexOf(p.id) < 0);
    }
    return lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  function formPessoa(admin, alvo) {
    const novo = !alvo, gestores = gestoresPossiveis(admin, alvo ? alvo.id : null);
    const d = alvo || { nome: '', email: '', cargo: '', area: 'atendimento', unidade: admin.unidade || '', gestorId: admin.rh ? '' : admin.id, rh: false, admissao: Store.agora().slice(0, 10) };
    UI.modal({
      titulo: novo ? 'Adicionar pessoa' : 'Editar ' + fmt.primeiro(alvo.nome), classe: 'largo',
      corpo: `<form id="formPessoa">
        <div class="campo-linha"><label class="campo"><span>Nome completo</span><input class="entrada" name="nome" value="${esc(d.nome)}" required></label>
          <label class="campo"><span>E-mail corporativo</span><input class="entrada" type="email" name="email" value="${esc(d.email)}" required></label></div>
        <div class="campo-linha"><label class="campo"><span>Cargo</span><input class="entrada" name="cargo" value="${esc(d.cargo)}" required></label>
          <label class="campo"><span>Área</span><select class="entrada" name="area">${UI.opcoes(C.areas().map(a => [a.id, a.nome]), d.area)}</select></label></div>
        <div class="campo-linha"><label class="campo"><span>Unidade</span><input class="entrada" name="unidade" value="${esc(d.unidade || '')}" placeholder="Ex.: Loja 04"></label>
          <label class="campo"><span>Admissão</span><input class="entrada" type="date" name="admissao" value="${esc(d.admissao || '')}"></label></div>
        <label class="campo"><span>Superior direto</span><select class="entrada" name="gestorId">${UI.opcoes(gestores.map(g => [g.id, g.nome + ' · ' + g.cargo]), d.gestorId || '', admin.rh ? 'Sem superior (topo do organograma)' : null)}</select>
          <small>O superior passa a administrar esta pessoa no SkillWay.</small></label>
        ${admin.rh ? `<label class="marcar"><input type="checkbox" name="rh" ${d.rh ? 'checked' : ''}><span>Faz parte do RH <small>enxerga e administra a empresa toda</small></span></label>` : ''}
        <p class="erro-form" role="alert" hidden></p>
        <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="submit" class="btn btn-primario">${novo ? 'Adicionar pessoa' : 'Salvar alterações'}</button></div>
      </form>`,
      aoMontar(m, ctl) {
        m.querySelector('form').addEventListener('submit', e => {
          e.preventDefault();
          const f = UI.dadosForm(e.target), erro = m.querySelector('.erro-form');
          try {
            if (!f.cargo.trim()) throw new Error('Informe o cargo.');
            const dados = { nome: f.nome.trim(), email: f.email, cargo: f.cargo.trim(), area: f.area, unidade: f.unidade.trim(), admissao: f.admissao, gestorId: f.gestorId || null };
            if (!dados.nome) throw new Error('Informe o nome.');
            if (admin.rh) dados.rh = !!f.rh;
            if (novo) {
              const senha = Store.senhaProvisoria();
              const p = Store.novaPessoa(Object.assign(dados, { empresaId: admin.empresaId, senha, trocarSenha: true }));
              Store.salvar(); ctl.fechar(); App.atualizar();
              mostrarSenha(p, senha, 'Pessoa adicionada');
            } else {
              if (alvo.id === admin.id && admin.rh && !dados.rh) throw new Error('Você não pode remover o próprio acesso de RH.');
              Store.atualizarPessoa(alvo.id, dados);
              Store.salvar(); ctl.fechar(); UI.toast('Alterações salvas.', 'sucesso'); App.atualizar();
            }
          } catch (ex) { erro.textContent = ex.message; erro.hidden = false; }
        });
      }
    });
  }

  function mostrarSenha(p, senha, titulo) {
    UI.modal({ titulo, classe: 'estreito',
      corpo: `<p class="modal-texto">Passe estes dados para <b>${esc(p.nome)}</b>. No primeiro acesso, a pessoa cria a própria senha.</p>
        <dl class="credencial"><div><dt>E-mail</dt><dd>${esc(p.email)}</dd></div><div><dt>Senha provisória</dt><dd id="senhaProv">${esc(senha)}</dd></div></dl>
        <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-copiar>Copiar dados</button><button type="button" class="btn btn-primario" data-fechar>Concluir</button></div>`,
      aoMontar(m) {
        m.querySelector('[data-copiar]').addEventListener('click', () => {
          const texto = `SkillWay\nE-mail: ${p.email}\nSenha provisória: ${senha}`;
          const feito = () => UI.toast('Dados copiados.', 'sucesso');
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(feito, () => UI.toast('Não foi possível copiar. Anote a senha exibida.', 'erro'));
          else UI.toast('Seu navegador não permite copiar daqui. Anote a senha exibida.', 'erro');
        });
      } });
  }

  const COLUNAS_CSV = ['nome', 'email', 'cargo', 'area', 'unidade', 'email_gestor'];
  function acharArea(texto) {
    const t = Store.semAcento(texto);
    if (!t) return null;
    const areas = C.areas(), palavras = t.split(/[^a-z0-9]+/).filter(Boolean);
    return areas.find(a => a.id === t) || areas.find(a => Store.semAcento(a.nome) === t) ||
      areas.find(a => palavras.indexOf(a.id) >= 0) ||
      areas.find(a => Store.semAcento(a.nome).split(/[^a-z0-9]+/).some(w => w.length > 3 && palavras.indexOf(w) >= 0)) || null;
  }

  function importar(admin) {
    let analise = null;
    const etapa1 = () => `<p class="modal-texto">Importe o organograma de uma planilha. Cada linha é uma pessoa; a coluna <b>email_gestor</b> diz quem é o superior direto, e é isso que monta a hierarquia.</p>
      <ol class="passos-import"><li>Baixe o modelo e preencha no Excel ou no Google Planilhas.</li><li>Salve como CSV e envie o arquivo, ou cole as linhas abaixo.</li><li>Confira a prévia antes de confirmar.</li></ol>
      <p><button type="button" class="btn btn-fantasma btn-p" data-modelo>${ic('baixar', 15)} Baixar modelo CSV</button></p>
      <label class="campo"><span>Arquivo CSV</span><input class="entrada" type="file" id="arqCsv" accept=".csv,.txt,text/csv"></label>
      <label class="campo"><span>Ou cole as linhas aqui</span><textarea class="entrada mono" id="txtCsv" rows="6" placeholder="nome;email;cargo;area;unidade;email_gestor"></textarea>
        <small>Áreas aceitas: ${C.areas().map(a => esc(a.nome)).join(', ')}.</small></label>
      <p class="erro-form" role="alert" hidden></p>
      <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="button" class="btn btn-primario" data-analisar>Conferir prévia</button></div>`;

    function analisar(texto) {
      const linhas = UI.lerCsv(texto);
      if (!linhas.length) throw new Error('Não encontrei nenhuma linha. Envie um arquivo ou cole o conteúdo.');
      let cab = linhas[0].map(c => Store.semAcento(c).replace(/[\s-]+/g, '_'));
      let dados = linhas.slice(1);
      if (cab.indexOf('email') < 0 || cab.indexOf('nome') < 0) { cab = COLUNAS_CSV; dados = linhas; } // sem cabeçalho: assume a ordem do modelo
      const col = n => cab.indexOf(n);
      const pega = (l, n) => (col(n) >= 0 && l[col(n)] != null) ? String(l[col(n)]).trim() : '';
      const noArquivo = {}, permitidos = {};
      gestoresPossiveis(admin).forEach(p => { permitidos[p.email] = p; });
      const itens = dados.map(l => {
        const it = { nome: pega(l, 'nome'), email: pega(l, 'email').toLowerCase(), cargo: pega(l, 'cargo'), areaTxt: pega(l, 'area'), unidade: pega(l, 'unidade'), gestorEmail: pega(l, 'email_gestor').toLowerCase(), erros: [], avisos: [] };
        if (!it.nome) it.erros.push('sem nome');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(it.email)) it.erros.push('e-mail inválido');
        else if (Store.porEmail(it.email)) it.erros.push('e-mail já cadastrado');
        else if (noArquivo[it.email]) it.erros.push('e-mail repetido no arquivo');
        else noArquivo[it.email] = it;
        const area = acharArea(it.areaTxt);
        it.area = area ? area.id : 'administrativo';
        if (!area) it.avisos.push(it.areaTxt ? 'área não reconhecida: usei Administrativo' : 'sem área: usei Administrativo');
        return it;
      });
      itens.forEach(it => {
        if (it.erros.length) return;
        if (!it.gestorEmail) { if (!admin.rh) it.avisos.push('sem gestor: fica com você'); return; }
        const interno = noArquivo[it.gestorEmail];
        if (it.gestorEmail === it.email) { it.avisos.push('gestor igual à própria pessoa: ignorado'); it.gestorEmail = ''; }
        else if (!permitidos[it.gestorEmail] && !(interno && !interno.erros.length)) { it.avisos.push('gestor não encontrado' + (admin.rh ? ': fica no topo' : ': fica com você')); it.gestorEmail = ''; }
      });
      return itens;
    }

    const etapa2 = () => {
      const bons = analise.filter(i => !i.erros.length);
      return `<p class="modal-texto"><b>${bons.length}</b> ${bons.length === 1 ? 'pessoa pronta' : 'pessoas prontas'} para importar${analise.length - bons.length ? ` e <b>${analise.length - bons.length}</b> com erro (não ${analise.length - bons.length === 1 ? 'entra' : 'entram'})` : ''}.</p>
        <div class="previa"><ul class="lista-simples">
        ${analise.map(i => `<li><span><span><b>${esc(i.nome || '(sem nome)')}</b><small>${esc(i.email || 'sem e-mail')} · ${esc(i.cargo || 'sem cargo')} · ${esc(C.area(i.area).nome)} · gestor: ${esc(i.gestorEmail || (admin.rh ? 'nenhum (topo)' : 'você'))}</small></span></span>
          ${i.erros.length ? UI.etiqueta(i.erros.join(', '), 'vermelho') : (i.avisos.length ? UI.etiqueta(i.avisos.join('; '), 'amarelo') : UI.etiqueta('ok', 'verde'))}</li>`).join('')}</ul></div>
        <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-voltar>Voltar</button><button type="button" class="btn btn-primario" data-confirmar ${bons.length ? '' : 'disabled'}>Importar ${bons.length} ${bons.length === 1 ? 'pessoa' : 'pessoas'}</button></div>`;
    };

    UI.modal({
      titulo: 'Importar organograma', classe: 'largo', corpo: `<div id="impCorpo">${etapa1()}</div>`,
      aoMontar(m, ctl) {
        const corpo = m.querySelector('#impCorpo');
        m.addEventListener('change', e => {
          if (e.target.id !== 'arqCsv' || !e.target.files[0]) return;
          const leitor = new FileReader();
          leitor.onload = () => { m.querySelector('#txtCsv').value = leitor.result; };
          leitor.readAsText(e.target.files[0], 'utf-8');
        });
        m.addEventListener('click', e => {
          if (e.target.closest('[data-modelo]')) {
            UI.baixar('modelo-organograma-skillway.csv', UI.csv([COLUNAS_CSV,
              ['Maria Exemplo', 'maria.exemplo@suaempresa.com.br', 'Gerente de Loja', 'Gestão e liderança', 'Loja 01', ''],
              ['José Exemplo', 'jose.exemplo@suaempresa.com.br', 'Vendedor', 'Vendas e comercial', 'Loja 01', 'maria.exemplo@suaempresa.com.br']]), 'text/csv;charset=utf-8');
          }
          if (e.target.closest('[data-analisar]')) {
            try { analise = analisar(m.querySelector('#txtCsv').value); corpo.innerHTML = etapa2(); }
            catch (ex) { const er = m.querySelector('.erro-form'); er.textContent = ex.message; er.hidden = false; }
          }
          if (e.target.closest('[data-voltar]')) { corpo.innerHTML = etapa1(); }
          if (e.target.closest('[data-confirmar]')) {
            const bons = analise.filter(i => !i.erros.length), senha = Store.senhaProvisoria(), criados = {};
            bons.forEach(i => { criados[i.email] = Store.novaPessoa({ empresaId: admin.empresaId, nome: i.nome, email: i.email, cargo: i.cargo, area: i.area, unidade: i.unidade, senha, trocarSenha: true, gestorId: admin.rh ? null : admin.id }); });
            bons.forEach(i => {
              if (!i.gestorEmail) return;
              const g = criados[i.gestorEmail] || Store.porEmail(i.gestorEmail);
              if (g) { try { Store.atualizarPessoa(criados[i.email].id, { gestorId: g.id }); } catch (ex) { /* ciclo no arquivo: mantém o gestor padrão */ } }
            });
            Store.salvar(); App.atualizar();
            corpo.innerHTML = `<p class="modal-texto"><b>${bons.length}</b> ${bons.length === 1 ? 'pessoa importada' : 'pessoas importadas'}. Todas entram com a mesma senha provisória e criam a própria senha no primeiro acesso.</p>
              <dl class="credencial"><div><dt>Senha provisória</dt><dd>${esc(senha)}</dd></div></dl>
              <div class="modal-acoes"><button type="button" class="btn btn-primario" data-fechar>Concluir</button></div>`;
          }
        });
      }
    });
  }

  function arvore(raizes, visiveis) {
    const no = u => {
      const p = Engine.perfil(u.id), st = Engine.rotuloStatus(p);
      const filhos = Store.diretos(u.id).filter(f => visiveis[f.id]).sort((a, b) => a.nome.localeCompare(b.nome));
      return `<li><a class="org-no" href="#/pessoa?id=${u.id}">${UI.avatar(u)}<span><b>${esc(u.nome)}</b><small>${esc(u.cargo)}${u.unidade ? ' · ' + esc(u.unidade) : ''}</small></span>
        <span class="org-meta">${filhos.length ? `<span class="chip">administra ${filhos.length}</span>` : ''}${UI.etiqueta(p.diag ? p.progresso + '%' : st.texto, st.cor)}</span></a>
        ${filhos.length ? `<ul>${filhos.map(no).join('')}</ul>` : ''}</li>`;
    };
    return `<ul class="org">${raizes.map(no).join('')}</ul>`;
  }

  Views.equipe = {
    titulo: 'Minha equipe', admin: true,
    render(ctx) {
      const u = ctx.user, aba = ctx.params.aba === 'organograma' ? 'organograma' : 'lista';
      const equipe = Store.equipe(u).sort((a, b) => a.nome.localeCompare(b.nome));
      const idsEscopo = {};
      [u].concat(equipe).forEach(p => { idsEscopo[p.id] = true; });
      const inativos = Store.pessoas(u.empresaId, true).filter(p => !p.ativo && (u.rh || idsEscopo[p.gestorId]));
      let corpo;
      if (!equipe.length) {
        corpo = B.vazio('organograma', 'Nenhuma pessoa cadastrada', 'Importe o organograma de uma planilha para montar a hierarquia em minutos, ou adicione as pessoas uma a uma.', `<button type="button" class="btn btn-primario" data-acao="importar">${ic('upload')} Importar planilha</button>`);
      } else if (aba === 'organograma') {
        const visiveis = Object.assign({}, idsEscopo);
        const raizes = u.rh ? Store.pessoas(u.empresaId).filter(p => !p.gestorId || !Store.usuario(p.gestorId) || !Store.usuario(p.gestorId).ativo) : [u];
        if (u.rh) visiveis[u.id] = true;
        corpo = `<section class="cartao"><p class="nota-rodape topo">A hierarquia da empresa espelhada no sistema: cada pessoa é administrada pelo seu superior direto. A etiqueta mostra o progresso na trilha.</p>${arvore(raizes.sort((a, b) => a.nome.localeCompare(b.nome)), visiveis)}</section>`;
      } else {
        corpo = `<section class="cartao"><div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Pessoa</th><th>Área</th><th>Unidade</th><th>Superior direto</th><th>Último acesso</th><th><span class="so-leitor">Ações</span></th></tr></thead><tbody>
          ${equipe.map(p => { const g = p.gestorId ? Store.usuario(p.gestorId) : null; return `<tr>
            <td><a class="linha-link" href="#/pessoa?id=${p.id}">${UI.pessoaCel(p)}</a>${p.rh ? ' ' + UI.etiqueta('RH', 'ciano') : ''}</td>
            <td class="suave">${esc(C.area(p.area).nome)}</td><td class="suave">${esc(p.unidade || '—')}</td><td class="suave">${g ? esc(g.nome) : '—'}</td>
            <td class="suave">${p.ultimoAcesso ? fmt.quando(p.ultimoAcesso) : 'nunca entrou'}</td>
            <td class="acoes-linha"><button type="button" class="btn-icone" data-acao="editar" data-id="${p.id}" title="Editar" aria-label="Editar ${esc(p.nome)}">${ic('editar', 17)}</button>
              <button type="button" class="btn-icone" data-acao="senha" data-id="${p.id}" title="Redefinir senha" aria-label="Redefinir senha de ${esc(p.nome)}">${ic('chave', 17)}</button>
              <button type="button" class="btn-icone" data-acao="desativar" data-id="${p.id}" title="Desativar acesso" aria-label="Desativar ${esc(p.nome)}">${ic('lixeira', 17)}</button></td></tr>`; }).join('')}
          </tbody></table></div></section>
          ${inativos.length ? `<section class="cartao"><h2 class="cartao-titulo">Acessos desativados</h2><ul class="lista-simples">${inativos.map(p => `<li><span>${UI.avatar(p)}<span><b>${esc(p.nome)}</b><small>${esc(p.cargo)} · ${esc(p.email)}</small></span></span><button type="button" class="btn btn-fantasma btn-p" data-acao="reativar" data-id="${p.id}">Reativar</button></li>`).join('')}</ul><p class="nota-rodape">O histórico de quem foi desativado é mantido.</p></section>` : ''}`;
      }
      return B.cab('Minha equipe', `${equipe.length} ${equipe.length === 1 ? 'pessoa ativa' : 'pessoas ativas'} em ${esc(escopo(u, ctx.empresa))}`,
          `<button type="button" class="btn btn-fantasma" data-acao="importar">${ic('upload')} Importar planilha</button><button type="button" class="btn btn-primario" data-acao="nova">${ic('mais')} Adicionar pessoa</button>`) +
        `<nav class="abas" aria-label="Visualização"><a href="#/equipe" class="${aba === 'lista' ? 'ativa' : ''}">${ic('equipe', 16)} Lista</a><a href="#/equipe?aba=organograma" class="${aba === 'organograma' ? 'ativa' : ''}">${ic('organograma', 16)} Organograma</a></nav>` + corpo;
    },
    montar(el, ctx) {
      const u = ctx.user;
      const alvo = b => Store.usuario(b.dataset.id);
      const pode = p => p && (Store.podeGerir(u, p.id) || (!p.ativo && (u.rh || p.gestorId === u.id || Store.podeGerir(u, p.gestorId))));
      App.acoes(el, {
        nova() { formPessoa(u, null); },
        importar() { importar(u); },
        editar(b) { const p = alvo(b); if (pode(p)) formPessoa(u, p); },
        senha(b) {
          const p = alvo(b); if (!pode(p)) return;
          UI.confirmar({ titulo: 'Redefinir senha', texto: `Gerar uma senha provisória para ${p.nome}? A senha atual deixa de funcionar.`, rotulo: 'Gerar senha provisória' }).then(ok => {
            if (!ok) return;
            const senha = Store.senhaProvisoria();
            Store.definirSenha(p.id, senha, true); Store.salvar();
            mostrarSenha(p, senha, 'Senha redefinida');
          });
        },
        desativar(b) {
          const p = alvo(b); if (!pode(p)) return;
          const diretos = Store.diretos(p.id).length;
          UI.confirmar({ titulo: 'Desativar acesso', perigo: true, rotulo: 'Desativar acesso',
            texto: `${p.nome} deixa de entrar no SkillWay. O histórico é mantido e você pode reativar depois.${diretos ? ` As ${diretos} pessoas que respondem a ${fmt.primeiro(p.nome)} passam a responder ao superior ${p.gestorId ? 'dele(a)' : 'imediato disponível'}.` : ''}` }).then(ok => {
            if (!ok) return;
            Store.diretos(p.id).forEach(f => { f.gestorId = p.gestorId || null; });
            p.ativo = false; Store.salvar();
            UI.toast('Acesso desativado.', 'sucesso'); App.atualizar();
          });
        },
        reativar(b) {
          const p = alvo(b); if (!pode(p)) return;
          p.ativo = true;
          if (p.gestorId && (!Store.usuario(p.gestorId) || !Store.usuario(p.gestorId).ativo)) p.gestorId = u.rh ? null : u.id;
          Store.salvar(); UI.toast('Acesso reativado.', 'sucesso'); App.atualizar();
        }
      });
    }
  };

  /* ====================================================================== */
  /* Relatório individual                                                    */
  /* ====================================================================== */
  Views.pessoa = {
    titulo(ctx) { const p = Store.usuario(ctx.params.id); return p ? p.nome : 'Relatório individual'; },
    admin: true,
    render(ctx) {
      const u = ctx.user, p = Store.usuario(ctx.params.id);
      if (!p || !Store.podeGerir(u, p.id)) {
        return B.cab('Relatório individual', '') + B.vazio('perfil', 'Pessoa não encontrada', 'Ela não existe ou não faz parte da sua equipe.', '<a class="btn btn-primario" href="#/equipe">Voltar à equipe</a>');
      }
      const perfil = Engine.perfil(p.id), st = Engine.rotuloStatus(perfil), g = p.gestorId ? Store.usuario(p.gestorId) : null;
      const tent = Store.tentativas(p.id).slice().reverse().slice(0, 8);
      const respostas = Store.db.mensagens.filter(m => m.para === p.id && m.tipo === 'pergunta' && m.respondidoEm && (u.rh || m.de === u.id));
      return B.cab(`${p.nome}`, `${esc(p.cargo)}${p.unidade ? ' · ' + esc(p.unidade) : ''} · admissão em ${fmt.data(p.admissao)}${g ? ' · responde a ' + esc(g.nome) : ''} ${UI.etiqueta(st.texto, st.cor)}`,
          `<a class="btn btn-fantasma" href="#/equipe">${ic('voltar')} Equipe</a>
           <button type="button" class="btn btn-fantasma" data-acao="lembrete">${ic('relogio')} Enviar lembrete</button>
           <button type="button" class="btn btn-fantasma" data-acao="sugerir">${ic('faisca')} Sugerir conteúdo</button>
           <button type="button" class="btn btn-primario" data-acao="imprimir">${ic('imprimir')} Exportar PDF</button>`) +
        B.relatorio(p.id, { admin: true }) +
        `<div class="grade g-2">
          <section class="cartao"><h2 class="cartao-titulo">Quizzes respondidos</h2>${tent.length ? `<ul class="lista-simples">${tent.map(t => { const q = t.quizId ? Store.quiz(t.quizId) : null; return `<li><span>${ic('quiz')}<span><b>${esc(q ? q.titulo : 'Validação: ' + C.comp(t.comp).nome)}</b><small>${fmt.data(t.data)} · ${t.acertos} de ${t.total} corretas</small></span></span>${UI.etiqueta(t.pct + '%', t.pct >= Engine.NOTA_MINIMA ? 'verde' : 'amarelo')}</li>`; }).join('')}</ul>` : '<p class="vazio-mini">Nenhum quiz respondido.</p>'}</section>
          <section class="cartao"><h2 class="cartao-titulo">Respostas às suas perguntas</h2>${respostas.length ? respostas.map(m => `<blockquote class="evidencia"><span>${esc(m.titulo)} · ${fmt.quando(m.respondidoEm)}</span>${esc(m.resposta)}</blockquote>`).join('') : '<p class="vazio-mini">Nenhuma resposta registrada.</p>'}</section>
        </div>`;
    },
    montar(el, ctx) {
      const u = ctx.user, p = Store.usuario(ctx.params.id);
      if (!p) return;
      App.acoes(el, {
        imprimir() { window.print(); },
        sugerir() { const perfil = Engine.perfil(p.id), pior = perfil.itens.slice().sort((a, b) => b.gap - a.gap)[0]; Gestao.sugestao(u, { ids: [p.id], comp: pior ? pior.comp : null }); },
        lembrete() { Gestao.lembrete(u, [p.id], Store.diagnostico(p.id) ? 'trilha' : 'diagnostico'); }
      });
      IA.ligar(el);
    }
  };

  /* ====================================================================== */
  /* Relatórios consolidados                                                 */
  /* ====================================================================== */
  function filtrar(equipe, params) {
    return equipe.filter(p => (!params.unidade || p.unidade === params.unidade) && (!params.area || p.area === params.area));
  }
  function grupos(perfis, chave) {
    const mapa = {};
    perfis.forEach(p => { const k = chave(p.user) || '—'; (mapa[k] = mapa[k] || []).push(p); });
    return Object.keys(mapa).sort().map(k => {
      const l = mapa[k], com = l.filter(p => p.diag), media = campo => com.length ? Math.round(com.reduce((s, p) => s + p[campo], 0) / com.length) : null;
      return { nome: k, pessoas: l.length, comDiag: com.length, aderencia: media('aderencia'), progresso: media('progresso'), horas: l.reduce((s, p) => s + p.horas, 0), certificados: l.reduce((s, p) => s + p.certificados.length, 0) };
    });
  }
  const tabelaGrupos = (titulo, lista) => `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>${titulo}</th><th class="num">Pessoas</th><th class="num">Com diagnóstico</th><th class="num">Aderência média</th><th class="num">Progresso médio</th><th class="num">Horas</th><th class="num">Certificados</th></tr></thead><tbody>
    ${lista.map(g => `<tr><td><b>${esc(g.nome)}</b></td><td class="num">${g.pessoas}</td><td class="num">${g.comDiag}</td><td class="num">${g.aderencia == null ? '—' : g.aderencia + '%'}</td><td class="num">${g.progresso == null ? '—' : g.progresso + '%'}</td><td class="num">${fmt.horas(g.horas)}</td><td class="num">${g.certificados}</td></tr>`).join('')}</tbody></table></div>`;

  Views.relatorios = {
    titulo: 'Relatórios', admin: true,
    render(ctx) {
      const u = ctx.user, toda = Store.equipe(u), equipe = filtrar(toda, ctx.params).sort((a, b) => a.nome.localeCompare(b.nome));
      const r = Engine.resumoEquipe(equipe);
      const unidades = Array.from(new Set(toda.map(p => p.unidade).filter(Boolean))).sort();
      const areas = Array.from(new Set(toda.map(p => p.area))).map(a => [a, C.area(a).nome]).sort((a, b) => a[1].localeCompare(b[1]));
      const comps = r.competencias.slice().sort((a, b) => a.nome.localeCompare(b.nome));
      const calor = r.perfis.filter(p => p.diag).map(p => `<tr><th scope="row"><a class="linha-link" href="#/pessoa?id=${p.user.id}">${esc(p.user.nome)}</a></th>${comps.map(c => { const it = p.itens.find(i => i.comp === c.comp); return it ? `<td class="calor ${it.status}" title="${esc(c.nome)}: nível ${fmt.nivel(it.nivel)} de ${it.alvo} esperado">${fmt.nivel(it.nivel)}</td>` : '<td class="calor nd" title="Não se aplica ao cargo">·</td>'; }).join('')}</tr>`).join('');
      return B.cab('Relatórios', `Consolidado de ${esc(escopo(u, ctx.empresa))} · gerado em ${fmt.data(Store.agora())}`,
          `<button type="button" class="btn btn-fantasma" data-acao="csv">${ic('baixar')} Exportar CSV</button><button type="button" class="btn btn-primario" data-acao="imprimir">${ic('imprimir')} Exportar PDF</button>`) +
        `<form class="filtros" id="filtros"><label class="campo"><span>Unidade</span><select class="entrada" name="unidade">${UI.opcoes(unidades.map(x => [x, x]), ctx.params.unidade || '', 'Todas')}</select></label>
          <label class="campo"><span>Área</span><select class="entrada" name="area">${UI.opcoes(areas, ctx.params.area || '', 'Todas')}</select></label></form>
        ${!equipe.length ? B.vazio('relatorios', 'Nada neste filtro', 'Nenhuma pessoa da sua equipe corresponde à unidade e à área escolhidas.', '<a class="btn btn-fantasma" href="#/relatorios">Limpar filtros</a>') : `
        <div class="grade g-4">
          ${B.indicador('Pessoas', r.total, r.comDiagnostico + ' com diagnóstico')}
          ${B.indicador('Aderência média ao cargo', r.aderenciaMedia + '%', 'quanto do nível esperado já está coberto')}
          ${B.indicador('Progresso médio na trilha', r.progressoMedio + '%', '')}
          ${B.indicador('Horas de estudo', fmt.horas(r.horas), r.certificados + (r.certificados === 1 ? ' certificado' : ' certificados'))}
        </div>
        <section class="cartao"><h2 class="cartao-titulo">Por pessoa</h2><div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Pessoa</th><th>Unidade</th><th class="num">Aderência</th><th>Progresso</th><th class="num">Horas</th><th class="num">Certificados</th><th>Última atividade</th><th>Status</th></tr></thead><tbody>
          ${r.perfis.map(p => { const st = Engine.rotuloStatus(p); return `<tr><td><a class="linha-link" href="#/pessoa?id=${p.user.id}">${UI.pessoaCel(p.user)}</a></td><td class="suave">${esc(p.user.unidade || '—')}</td><td class="num">${p.aderencia == null ? '—' : p.aderencia + '%'}</td>
            <td><span class="prog">${UI.barra(p.progresso, st.cor)}<small>${p.diag ? p.progresso + '%' : '—'}</small></span></td><td class="num">${fmt.horas(p.horas)}</td><td class="num">${p.certificados.length}</td><td class="suave">${p.ultimaAtividade ? fmt.quando(p.ultimaAtividade) : '—'}</td><td>${UI.etiqueta(st.texto, st.cor)}</td></tr>`; }).join('')}</tbody></table></div></section>
        <section class="cartao"><h2 class="cartao-titulo">Por área</h2>${tabelaGrupos('Área', grupos(r.perfis, x => C.area(x.area).nome))}</section>
        <section class="cartao"><h2 class="cartao-titulo">Por unidade</h2>${tabelaGrupos('Unidade', grupos(r.perfis, x => x.unidade))}</section>
        <section class="cartao"><h2 class="cartao-titulo">Mapa de competências da equipe</h2>
          ${calor ? `<div class="tabela-rolagem"><table class="tabela mapa"><thead><tr><th>Pessoa</th>${comps.map(c => `<th class="mapa-col" title="${esc(c.nome)}"><span>${esc(c.curto)}</span></th>`).join('')}</tr></thead><tbody>${calor}</tbody></table></div>
          <div class="legenda"><span><i class="lg-ok"></i>No nível esperado</span><span><i class="lg-atencao"></i>Abaixo do esperado</span><span><i class="lg-critico"></i>Dois níveis ou mais abaixo</span><span><i class="lg-nd"></i>Não se aplica ao cargo</span></div>` : '<p class="vazio-mini">O mapa aparece quando alguém concluir o diagnóstico.</p>'}</section>`}`;
    },
    montar(el, ctx) {
      const u = ctx.user, form = el.querySelector('#filtros');
      form.addEventListener('change', () => {
        const d = UI.dadosForm(form), q = [];
        if (d.unidade) q.push('unidade=' + encodeURIComponent(d.unidade));
        if (d.area) q.push('area=' + encodeURIComponent(d.area));
        App.ir('relatorios' + (q.length ? '?' + q.join('&') : ''));
      });
      App.acoes(el, {
        imprimir() { window.print(); },
        csv() {
          const r = Engine.resumoEquipe(filtrar(Store.equipe(u), ctx.params));
          const comps = r.competencias.slice().sort((a, b) => a.nome.localeCompare(b.nome));
          const base = linhasCsvEquipe(r.perfis);
          base[0] = base[0].concat(comps.map(c => c.nome + ' (nível / esperado)'));
          r.perfis.forEach((p, i) => { base[i + 1] = base[i + 1].concat(comps.map(c => { const it = p.itens.find(x => x.comp === c.comp); return it ? fmt.nivel(it.nivel) + ' / ' + it.alvo : ''; })); });
          UI.baixar('skillway-relatorio.csv', UI.csv(base), 'text/csv;charset=utf-8');
          UI.toast('Relatório exportado em CSV.', 'sucesso');
        }
      });
    }
  };

  /* ====================================================================== */
  /* Sugestões e quizzes                                                     */
  /* ====================================================================== */
  Views.engajamento = {
    titulo: 'Sugestões e quizzes', admin: true,
    render(ctx) {
      const u = ctx.user, aba = ['quizzes', 'sugestoes', 'perguntas'].indexOf(ctx.params.aba) >= 0 ? ctx.params.aba : 'quizzes';
      let corpo = '', acao = '';
      if (aba === 'quizzes') {
        const lista = u.rh ? Store.db.quizzes.filter(q => q.empresaId === u.empresaId).sort((a, b) => a.criadoEm < b.criadoEm ? 1 : -1) : Store.quizzesDe(u.id);
        acao = `<button type="button" class="btn btn-primario" data-acao="quiz">${ic('mais')} Novo quiz</button>`;
        corpo = lista.length ? `<section class="cartao"><ul class="lista-simples">${lista.map(q => {
          const tent = q.destinatarios.map(id => Store.tentativaDoQuiz(q.id, id)).filter(Boolean);
          const media = tent.length ? Math.round(tent.reduce((s, t) => s + t.pct, 0) / tent.length) : null;
          const autor = Store.usuario(q.autorId);
          return `<li><span>${ic('quiz')}<span><b>${esc(q.titulo)}</b><small>${esc(C.comp(q.comp).nome)} · ${q.perguntas.length} perguntas${q.origem === 'ia' ? ' geradas com IA' : ''} · enviado ${fmt.quando(q.criadoEm)}${u.rh && autor && autor.id !== u.id ? ' por ' + esc(autor.nome) : ''}${q.prazo ? ' · prazo ' + fmt.dataCurta(q.prazo) : ''}</small></span></span>
            <span class="lado"><span class="chip">${tent.length} de ${q.destinatarios.length} responderam</span>${media != null ? UI.etiqueta('média ' + media + '%', media >= Engine.NOTA_MINIMA ? 'verde' : 'amarelo') : ''}
            <button type="button" class="btn btn-fantasma btn-p" data-acao="resultado" data-id="${q.id}">Ver resultados</button>
            <button type="button" class="btn-icone" data-acao="excluirQuiz" data-id="${q.id}" aria-label="Excluir quiz ${esc(q.titulo)}" title="Excluir">${ic('lixeira', 17)}</button></span></li>`;
        }).join('')}</ul></section>` : B.vazio('quiz', 'Nenhum quiz enviado', 'Crie um quiz por competência. As perguntas saem da base curada e você pode editar ou escrever as suas.', acao);
      } else if (aba === 'sugestoes') {
        const lista = Store.enviadas(u.id).filter(m => m.tipo === 'sugestao' || m.tipo === 'lembrete' || m.tipo === 'reconhecimento');
        acao = `<button type="button" class="btn btn-fantasma" data-acao="lembrete">${ic('relogio')} Enviar lembrete</button><button type="button" class="btn btn-primario" data-acao="sugestao">${ic('mais')} Sugerir conteúdo</button>`;
        const nomes = { sugestao: 'Sugestão', lembrete: 'Lembrete', reconhecimento: 'Reconhecimento' };
        corpo = lista.length ? `<section class="cartao"><ul class="lista-simples">${lista.map(m => { const para = Store.usuario(m.para), ct = m.conteudoId ? C.conteudo(m.conteudoId) : null;
          return `<li><span>${ic(m.tipo === 'sugestao' ? 'faisca' : (m.tipo === 'lembrete' ? 'relogio' : 'certificado'))}<span><b>${esc(m.titulo)}</b><small>${nomes[m.tipo]} para ${esc(para ? para.nome : '—')} · ${fmt.quando(m.criadoEm)}${ct ? ' · ' + esc(C.comp(ct.comp).nome) : ''}</small></span></span>${m.lidoEm ? UI.etiqueta('Lida', 'verde') : UI.etiqueta('Não lida', '')}</li>`; }).join('')}</ul></section>`
          : B.vazio('faisca', 'Nenhuma sugestão enviada', 'Indique um conteúdo da base curada, ou um link seu, para uma pessoa ou para a equipe inteira.', `<button type="button" class="btn btn-primario" data-acao="sugestao">${ic('mais')} Sugerir conteúdo</button>`);
      } else {
        const porGrupo = {};
        Store.enviadas(u.id).filter(m => m.tipo === 'pergunta').forEach(m => { (porGrupo[m.grupo || m.id] = porGrupo[m.grupo || m.id] || []).push(m); });
        const gruposP = Object.keys(porGrupo).map(k => porGrupo[k]).sort((a, b) => a[0].criadoEm < b[0].criadoEm ? 1 : -1);
        acao = `<button type="button" class="btn btn-primario" data-acao="pergunta">${ic('mais')} Nova pergunta</button>`;
        corpo = gruposP.length ? gruposP.map(g => { const resp = g.filter(m => m.respondidoEm), falta = g.filter(m => !m.respondidoEm);
          return `<section class="cartao"><div class="cartao-topo"><h2 class="cartao-titulo">${esc(g[0].titulo)}</h2><span class="chip">${resp.length} de ${g.length} responderam</span></div>
            ${g[0].corpo ? `<p class="texto-suave">${esc(g[0].corpo)}</p>` : ''}
            ${IA.resumoRespostas(g[0].grupo || g[0].id, resp.length)}
            ${resp.map(m => `<blockquote class="evidencia"><span>${esc((Store.usuario(m.para) || {}).nome)} · ${fmt.quando(m.respondidoEm)}</span>${esc(m.resposta)}</blockquote>`).join('') || '<p class="vazio-mini">Ainda sem respostas.</p>'}
            ${falta.length ? `<p class="nota-rodape">Aguardando: ${falta.map(m => esc(fmt.primeiro((Store.usuario(m.para) || {}).nome))).join(', ')}. Enviada ${fmt.quando(g[0].criadoEm)}.</p>` : ''}</section>`; }).join('')
          : B.vazio('mensagens', 'Nenhuma pergunta enviada', 'Faça uma pergunta aberta à equipe e leia as respostas reunidas em um só lugar.', acao);
      }
      const abas = [['quizzes', 'Quizzes', 'quiz'], ['sugestoes', 'Sugestões e lembretes', 'faisca'], ['perguntas', 'Perguntas à equipe', 'mensagens']];
      return B.cab('Sugestões e quizzes', 'Incentive o desenvolvimento de quem está abaixo de você na hierarquia.', acao) +
        `<nav class="abas" aria-label="Seções">${abas.map(a => `<a href="#/engajamento?aba=${a[0]}" class="${aba === a[0] ? 'ativa' : ''}">${ic(a[2], 16)} ${a[1]}</a>`).join('')}</nav>` + corpo;
    },
    montar(el, ctx) {
      const u = ctx.user;
      IA.ligar(el);
      App.acoes(el, {
        quiz() { Gestao.novoQuiz(u); },
        sugestao() { Gestao.sugestao(u); },
        pergunta() { Gestao.pergunta(u); },
        lembrete() {
          const equipe = Store.equipe(u), parados = Engine.resumoEquipe(equipe).perfis.filter(p => p.status === 'parado' || !p.diag).map(p => p.user.id);
          UI.modal({ titulo: 'Enviar lembrete', classe: 'largo',
            corpo: `<p class="modal-texto">O texto se ajusta a cada pessoa: quem não fez o diagnóstico é lembrado dele; os demais, do próximo passo da trilha. Já vêm marcados quem está parado ou sem diagnóstico.</p>
              <form>${seletorPessoas(equipe, parados)}<p class="erro-form" role="alert" hidden></p>
              <div class="modal-acoes"><button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button><button type="submit" class="btn btn-primario">${ic('enviar', 16)} Enviar lembrete</button></div></form>`,
            aoMontar(m, ctl) {
              ligarSeletor(m);
              m.querySelector('form').addEventListener('submit', e => {
                e.preventDefault();
                const ids = marcadosDe(m);
                if (!ids.length) { const er = m.querySelector('.erro-form'); er.textContent = 'Escolha pelo menos uma pessoa.'; er.hidden = false; return; }
                Gestao.lembrete(u, ids.filter(id => !Store.diagnostico(id)), 'diagnostico');
                Gestao.lembrete(u, ids.filter(id => Store.diagnostico(id)), 'trilha');
                ctl.fechar(); UI.toast(ids.length === 1 ? 'Lembrete enviado.' : ids.length + ' lembretes enviados.', 'sucesso'); App.ir('engajamento?aba=sugestoes');
              });
            } });
        },
        resultado(b) {
          const q = Store.quiz(b.dataset.id);
          UI.modal({ titulo: q.titulo, classe: 'largo',
            corpo: `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Pessoa</th><th>Situação</th><th class="num">Acertos</th><th class="num">Nota</th></tr></thead><tbody>
              ${q.destinatarios.map(id => { const p = Store.usuario(id), t = Store.tentativaDoQuiz(q.id, id); if (!p) return ''; return `<tr><td>${UI.pessoaCel(p)}</td><td>${t ? 'Respondeu em ' + fmt.dataCurta(t.data) : UI.etiqueta('Pendente', 'amarelo')}</td><td class="num">${t ? t.acertos + ' de ' + t.total : '—'}</td><td class="num">${t ? UI.etiqueta(t.pct + '%', t.pct >= Engine.NOTA_MINIMA ? 'verde' : 'amarelo') : '—'}</td></tr>`; }).join('')}</tbody></table></div>
              <h3 class="sub-titulo">Acerto por pergunta</h3><ol class="quiz-revisao">${q.perguntas.map((p, i) => { const tent = q.destinatarios.map(id => Store.tentativaDoQuiz(q.id, id)).filter(Boolean); const certos = tent.filter(t => t.detalhe[i] && t.detalhe[i].certo).length;
                return `<li><b>${esc(p.p)}</b><span>Correta: ${esc(p.opcoes[p.correta])}</span><small>${tent.length ? certos + ' de ' + tent.length + ' acertaram' : 'Sem respostas ainda'}</small></li>`; }).join('')}</ol>
              <div class="modal-acoes"><button type="button" class="btn btn-primario" data-fechar>Fechar</button></div>` });
        },
        excluirQuiz(b) {
          const q = Store.quiz(b.dataset.id);
          UI.confirmar({ titulo: 'Excluir quiz', perigo: true, rotulo: 'Excluir quiz', texto: `Excluir "${q.titulo}"? Ele some para quem ainda não respondeu. As notas já registradas continuam no histórico de cada pessoa.` }).then(ok => {
            if (!ok) return;
            Store.db.quizzes = Store.db.quizzes.filter(x => x.id !== q.id);
            Store.db.mensagens = Store.db.mensagens.filter(m => m.quizId !== q.id);
            Store.salvar(); UI.toast('Quiz excluído.', 'sucesso'); App.atualizar();
          });
        }
      });
    }
  };

  /* ====================================================================== */
  /* Benchmarks                                                              */
  /* ====================================================================== */
  Views.benchmarks = {
    titulo: 'Benchmarks', admin: true,
    render(ctx) {
      const u = ctx.user, equipe = Store.equipe(u), r = Engine.resumoEquipe(equipe);
      // No modo servidor o gestor não recebe os registros de outras equipes: a média da empresa vem pronta do servidor.
      const pub = Store.db.publico && Store.db.publico.empresa;
      const geral = pub || Engine.resumoEquipe(Store.pessoas(u.empresaId));
      const daEmpresa = {};
      geral.competencias.forEach(c => { daEmpresa[c.comp] = c; });
      const linhaGeral = { nome: 'Empresa (média geral)', pessoas: geral.total, comDiag: geral.comDiagnostico, aderencia: geral.comDiagnostico ? geral.aderenciaMedia : null, progresso: geral.comDiagnostico ? geral.progressoMedio : null, horas: geral.horas, certificados: geral.certificados };
      const porUnidade = grupos(r.perfis, x => x.unidade), porArea = grupos(r.perfis, x => C.area(x.area).nome);
      return B.cab('Benchmarks', `Como ${u.rh ? 'cada parte da empresa' : 'a sua equipe'} se compara ao nível esperado e à média da empresa.`) +
        (!r.competencias.length ? B.vazio('benchmark', 'Ainda sem dados para comparar', 'Os benchmarks aparecem quando as pessoas da equipe concluírem o diagnóstico.', '<a class="btn btn-primario" href="#/engajamento?aba=sugestoes">Enviar lembrete</a>') : `
        <section class="cartao"><h2 class="cartao-titulo">Competências: equipe, empresa e nível esperado</h2>
          <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Competência</th><th class="num">Avaliadas</th><th>Nível médio da equipe</th><th class="num">Média da empresa</th><th class="num">Esperado</th><th class="num">Cobertura</th><th>Situação</th></tr></thead><tbody>
          ${r.competencias.map(c => `<tr><td><b>${esc(c.nome)}</b></td><td class="num">${c.pessoas}</td><td><span class="prog larga">${UI.barraNivel(c.nivel, c.alvo, c.status)}<small>${fmt.nivel(c.nivel)}</small></span></td>
            <td class="num">${daEmpresa[c.comp] ? fmt.nivel(daEmpresa[c.comp].nivel) : '—'}</td><td class="num">${fmt.nivel(c.alvo)}</td><td class="num">${c.cobertura}%</td><td>${UI.statusComp(c.status)}</td></tr>`).join('')}</tbody></table></div>
          <p class="nota-rodape">Cobertura é o nível médio dividido pelo esperado. O traço vertical na barra marca o esperado.</p></section>
        <section class="cartao"><h2 class="cartao-titulo">Por unidade</h2>${tabelaGrupos('Unidade', porUnidade.concat(u.rh ? [] : [linhaGeral]))}</section>
        <section class="cartao"><h2 class="cartao-titulo">Por área</h2>${tabelaGrupos('Área', porArea.concat(u.rh ? [] : [linhaGeral]))}</section>`) +
        `<section class="cartao pesquisa"><h2 class="cartao-titulo">Referência externa: a pesquisa de validação do SkillWay</h2>
          <div class="grade g-4 sem-margem"><div><b>73%</b><span>sentem-se capacitados para a área que desejam</span></div><div><b>45%</b><span>sentem alguma insegurança na função atual</span></div><div><b>68%</b><span>querem evoluir na própria formação ou atuação</span></div><div><b>95%</b><span>achariam útil uma plataforma que desse direção</span></div></div>
          <p class="nota-rodape">Formulário de inscrição SkillWay, 22 respostas, de 10 a 18 de setembro de 2026. Amostra pequena e concentrada em São Paulo e em pessoas de 18 a 24 anos: use como contexto, não como meta.</p></section>`;
    }
  };

  /* ====================================================================== */
  /* Empresa (somente RH)                                                    */
  /* ====================================================================== */
  const NOME_TABELA = { empresas: 'Empresa', usuarios: 'Pessoas', diagnosticos: 'Diagnósticos', trilhas: 'Trilhas', eventos: 'Eventos de estudo', quizzes: 'Quizzes',
    tentativas: 'Tentativas de quiz', mensagens: 'Mensagens', certificados: 'Certificados', analises: 'Análises da IA', conversas: 'Mensagens do mentor' };

  function pintarBanco(el) {
    const alvo = el.querySelector('#bancoInfo');
    if (!alvo) return;
    Store.api('GET', 'banco').then(b => {
      const onde = b.nuvem ? 'Endereço' : 'Arquivo';
      const tamanho = b.tamanho == null ? '' : `<div><dt>Tamanho</dt><dd>${fmt.num(b.tamanho / 1024)} KB</dd></div>`;
      const nota = b.nuvem
        ? (/supabase/i.test(b.motor)
          ? 'Os dados ficam no PostgreSQL do seu projeto no Supabase, no esquema <b>skillway</b>. Para ver as tabelas, abra o Table Editor no painel do Supabase e troque o esquema de <i>public</i> para <i>skillway</i>.'
          : 'Os dados ficam em um banco PostgreSQL, no esquema <b>skillway</b>.') + ' Cada alteração feita nas telas é gravada lá na hora.'
        : 'É um arquivo SQLite comum: abre em programas como o DB Browser for SQLite. Cada alteração feita nas telas é gravada nele na hora. Para gravar no Supabase, abra o arquivo conectar-supabase.bat.';
      alvo.innerHTML = `<dl class="ficha"><div><dt>Motor</dt><dd>${esc(b.motor)}</dd></div><div><dt>${onde}</dt><dd class="quebra">${esc(b.destino)}</dd></div>${tamanho}</dl>
        <h3 class="sub-titulo">Registros desta empresa</h3>
        <ul class="contagens">${Object.keys(b.tabelas).map(t => `<li><span>${NOME_TABELA[t] || t}</span><b>${b.tabelas[t]}</b></li>`).join('')}</ul>
        <p class="nota-rodape">${nota}</p>`;
    }, e => { alvo.innerHTML = `<p class="erro-form">${esc(e.message)}</p>`; });
  }

  function pintarIA(el, u) {
    const alvo = el.querySelector('#iaConfig');
    if (!alvo) return;
    const titulo = `<h2 class="cartao-titulo">${ic('faisca')} Inteligência artificial (Claude)</h2>`;
    const desenhar = c => {
      Store.definirIA({ ativa: c.ativa, modelo: c.modelo });
      const conhecido = c.modelos.some(m => m.id === c.modelo);
      const estado = c.ativa ? UI.etiqueta('Ativa', 'verde') : UI.etiqueta('Sem chave', 'amarelo');
      const origem = c.origem === 'ambiente' ? 'definida no arquivo .env do servidor' : (c.origem === 'banco' ? 'salva no banco de dados do servidor' : '');
      alvo.innerHTML = `<div class="cartao-topo">${titulo}${estado}</div>
        <div class="grade g-2 sem-margem">
          <div>
            <p class="texto-suave">Com uma chave da API da Anthropic, o SkillWay usa o Claude para ler currículos no diagnóstico, escrever a leitura do perfil e o plano de estudo, gerar quizzes sob medida, analisar a equipe, resumir respostas e atender no Mentor IA.</p>
            <dl class="ficha">
              <div><dt>Chave</dt><dd>${c.ativa ? 'termina em ' + esc(c.final) + (origem ? ' · ' + origem : '') : 'não configurada'}</dd></div>
              <div><dt>Modelo</dt><dd>${esc(c.modelo)}</dd></div>
              <div><dt>Limite por pessoa</dt><dd>${c.limiteDiario} pedidos por dia</dd></div>
              <div><dt>Pedidos desta empresa</dt><dd>${c.uso.chamadas}</dd></div>
              <div><dt>Tokens de entrada / saída</dt><dd>${Number(c.uso.entrada).toLocaleString('pt-BR')} / ${Number(c.uso.saida).toLocaleString('pt-BR')}</dd></div>
            </dl>
            ${c.porTipo.length ? `<p class="nota-rodape">Por recurso: ${c.porTipo.map(t => esc(t.tipo) + ' ' + t.n).join(' · ')}.</p>` : ''}
          </div>
          <div>
            ${c.podeConfigurar ? `<form id="formIA">
              <label class="campo"><span>Chave da API da Anthropic</span><input class="entrada mono" type="password" name="chave" autocomplete="off" placeholder="${c.origem === 'ambiente' ? 'definida no .env (não editável aqui)' : (c.ativa ? 'deixe em branco para manter a atual' : 'sk-ant-...')}" ${c.origem === 'ambiente' ? 'disabled' : ''}>
                <small>Crie a chave no console da Anthropic (console.anthropic.com), em API Keys. O uso é cobrado pela Anthropic conforme os tokens consumidos.</small></label>
              <label class="campo"><span>Modelo</span><select class="entrada" name="modelo" ${c.modeloFixo ? 'disabled' : ''}>${UI.opcoes(c.modelos.map(m => [m.id, m.nome]).concat(conhecido ? [] : [[c.modelo, c.modelo]]), c.modelo)}</select></label>
              <p class="erro-form" role="alert" hidden></p>
              <div class="linha-botoes"><button type="submit" class="btn btn-primario">Salvar</button>
                <button type="button" class="btn btn-fantasma" data-testar data-espera="Testando…" ${c.ativa ? '' : 'disabled'}>Testar conexão</button>
                ${c.origem === 'banco' ? '<button type="button" class="btn btn-fantasma" data-remover>Remover chave</button>' : ''}</div>
            </form>` : `<p class="aviso">${ic('info', 16)}<span>Por segurança, a chave só pode ser alterada no computador onde o servidor está rodando (abrindo o sistema por http://localhost).</span></p>
              <div class="linha-botoes"><button type="button" class="btn btn-fantasma" data-testar data-espera="Testando…" ${c.ativa ? '' : 'disabled'}>Testar conexão</button></div>`}
          </div>
        </div>
        <p class="nota-rodape">A chave fica só no servidor e nunca é enviada ao navegador. Para gerar as análises, o servidor envia à API da Anthropic o cargo, os níveis, a trilha e o currículo informado; na leitura da equipe e no resumo de respostas, os nomes das pessoas são trocados por códigos antes do envio.</p>`;
      const form = alvo.querySelector('#formIA'), erro = alvo.querySelector('.erro-form');
      const falha = e => { if (erro) { erro.textContent = e.message + (e.detalhe ? ' (' + e.detalhe + ')' : ''); erro.hidden = false; } else UI.toast(e.message, 'erro'); };
      if (form) form.addEventListener('submit', e => {
        e.preventDefault();
        const d = UI.dadosForm(form);
        Store.api('POST', 'ia/config', { chave: d.chave || undefined, modelo: d.modelo || undefined }).then(r => { desenhar(r); UI.toast('Configuração da IA salva.', 'sucesso'); App.atualizar(); }, falha);
      });
      const testar = alvo.querySelector('[data-testar]');
      if (testar) testar.addEventListener('click', () => {
        IA.comEspera(testar, Store.api('POST', 'ia/testar', {})).then(r => { UI.toast('Conexão com o Claude funcionando (' + r.modelo + ').', 'sucesso'); return Store.api('GET', 'ia/config').then(desenhar); }, falha);
      });
      const remover = alvo.querySelector('[data-remover]');
      if (remover) remover.addEventListener('click', () => {
        UI.confirmar({ titulo: 'Remover chave', texto: 'Sem a chave, os recursos de IA ficam desligados para todas as pessoas. As análises já geradas continuam salvas.', rotulo: 'Remover chave', perigo: true }).then(ok => {
          if (ok) Store.api('POST', 'ia/config', { remover: true }).then(r => { desenhar(r); UI.toast('Chave removida.', 'sucesso'); App.atualizar(); }, falha);
        });
      });
    };
    Store.api('GET', 'ia/config').then(desenhar, e => { alvo.innerHTML = titulo + `<p class="erro-form">${esc(e.message)}</p>`; });
  }

  Views.empresa = {
    titulo: 'Empresa', admin: true, rh: true,
    render(ctx) {
      const u = ctx.user, emp = ctx.empresa, pl = Engine.plano(emp.id), meta = emp.meta || {};
      const segmentos = ['Varejo', 'Indústria', 'Serviços', 'Tecnologia', 'Outro'].map(s => [s, s]);
      const comDiag = Store.pessoas(emp.id).filter(p => Store.diagnostico(p.id)).length;
      const passosNovo = [
        [pl.colaboradores > 1, 'Monte o organograma', 'Importe a planilha com nome, e-mail, cargo e superior direto de cada pessoa.', 'equipe', 'Importar planilha'],
        [comDiag > 0, 'Peça o diagnóstico', 'Cada pessoa responde em cerca de cinco minutos e recebe a própria trilha.', 'engajamento?aba=sugestoes', 'Enviar lembrete'],
        [!!meta.titulo, 'Defina a meta coletiva', 'Uma competência prioritária para a empresa neste período, com prazo.', '', '']
      ];
      return B.cab('Empresa', 'Dados da conta, plano, meta coletiva e backup.') +
        (ctx.params.novo || pl.colaboradores <= 1 ? `<section class="cartao partida"><div><h2>${ctx.params.novo ? 'Conta criada. ' : ''}Três passos para colocar ${esc(emp.nome)} no ar</h2>
          <p>A implantação do SkillWay parte do organograma: quem você indicar como superior direto passa a administrar o próprio time, sem configuração manual.</p></div>
          <ol class="estrada compacta">${passosNovo.map((p, i) => `<li class="${p[0] ? 'feito' : 'atual'}"><span class="estrada-marco">${p[0] ? ic('check', 14) : i + 1}</span><div><b>${p[1]}</b><span>${p[2]} ${p[3] && !p[0] ? `<a class="link" href="#/${p[3]}">${p[4]}</a>` : ''}</span></div></li>`).join('')}</ol></section>` : '') +
        `<div class="grade g-2">
          <section class="cartao"><h2 class="cartao-titulo">Dados da empresa</h2>
            <form id="formEmpresa"><label class="campo"><span>Nome</span><input class="entrada" name="nome" value="${esc(emp.nome)}" required></label>
              <div class="campo-linha"><label class="campo"><span>Segmento</span><select class="entrada" name="segmento">${UI.opcoes(segmentos, emp.segmento)}</select></label>
              <label class="campo"><span>Cidade</span><input class="entrada" name="cidade" value="${esc(emp.cidade || '')}"></label></div>
              <button type="submit" class="btn btn-primario">Salvar dados</button></form></section>
          <section class="cartao"><h2 class="cartao-titulo">Plano</h2>
            <div class="plano-atual"><div><span>Colaboradores ativos</span><b>${pl.colaboradores}</b></div><div><span>Plano pela faixa</span><b>${pl.plano.nome}</b></div><div><span>Estimativa mensal</span><b>${fmt.moeda(pl.mensal)}</b></div></div>
            <table class="tabela compacta"><thead><tr><th>Plano</th><th>Faixa</th><th class="num">Por colaborador/mês</th></tr></thead><tbody>${C.PLANOS.map(p => `<tr class="${p.id === pl.plano.id ? 'atual' : ''}"><td><b>${p.nome}</b></td><td>${p.faixa}</td><td class="num">${fmt.moeda(p.preco)}</td></tr>`).join('')}</tbody></table>
            <p class="nota-rodape">Assinatura por colaborador ativo. ${pl.abaixoDoMinimo ? 'O Starter começa em 100 colaboradores; abaixo disso a conta roda como piloto e o valor acima é só uma referência (' + pl.colaboradores + ' × ' + fmt.moeda(pl.plano.preco) + ').' : pl.colaboradores + ' × ' + fmt.moeda(pl.plano.preco) + '.'}${emp.porte > pl.colaboradores ? ` Com os ${emp.porte.toLocaleString('pt-BR')} colaboradores informados no cadastro, o plano seria ${C.planoPara(emp.porte).nome}: ${fmt.moeda(emp.porte * C.planoPara(emp.porte).preco)} por mês.` : ''}</p></section>
        </div>
        <div class="grade g-2">
          <section class="cartao"><h2 class="cartao-titulo">Meta coletiva</h2>
            <form id="formMeta"><label class="campo"><span>Título</span><input class="entrada" name="titulo" value="${esc(meta.titulo || '')}" placeholder="Ex.: Atendimento sem ruído no 4º trimestre"></label>
              <label class="campo"><span>Descrição</span><textarea class="entrada" name="descricao" rows="3" placeholder="O que a empresa quer alcançar e como cada pessoa contribui.">${esc(meta.descricao || '')}</textarea></label>
              <div class="campo-linha"><label class="campo"><span>Competência ligada à meta</span><select class="entrada" name="comp">${UI.opcoes(C.competencias().map(c => [c.id, c.nome]), meta.comp || '', 'Nenhuma')}</select></label>
              <label class="campo"><span>Prazo</span><input class="entrada" type="date" name="prazo" value="${esc(meta.prazo || '')}"></label></div>
              <div class="linha-botoes"><button type="submit" class="btn btn-primario">Salvar meta</button>${meta.titulo ? '<button type="button" class="btn btn-fantasma" data-acao="removerMeta">Remover meta</button>' : ''}</div>
              <p class="nota-rodape">A meta aparece na tela inicial de todas as pessoas da empresa.</p></form></section>
          ${Store.servidor ? `<section class="cartao"><h2 class="cartao-titulo">Banco de dados</h2>
            <div id="bancoInfo"><p class="vazio-mini">Consultando o banco…</p></div>
            <div class="linha-botoes"><button type="button" class="btn btn-fantasma" data-acao="exportar">${ic('baixar')} Exportar cópia em JSON</button></div>
            ${emp.demo ? `<h3 class="sub-titulo">Demonstração</h3><p class="texto-suave">Apaga os dados da empresa de demonstração no banco e recria o estado inicial. As outras empresas cadastradas não são afetadas.</p>
            <button type="button" class="btn btn-perigo" data-acao="restaurar">Restaurar demonstração</button>` : ''}</section>`
          : `<section class="cartao"><h2 class="cartao-titulo">Dados e backup</h2>
            <p class="texto-suave">Você está no modo local: tudo fica salvo neste navegador. Para gravar em banco de dados e usar a IA, abra o sistema pelo servidor (dois cliques em <b>iniciar.bat</b>).</p>
            <div class="linha-botoes"><button type="button" class="btn btn-fantasma" data-acao="exportar">${ic('baixar')} Exportar backup</button>
              <label class="btn btn-fantasma">${ic('upload')} Importar backup<input type="file" id="arqBackup" accept=".json,application/json" hidden></label></div>
            <h3 class="sub-titulo">Demonstração</h3>
            <p class="texto-suave">Apaga tudo o que está salvo neste navegador e recria a empresa de demonstração (Grupo Atlântico Varejo).</p>
            <button type="button" class="btn btn-perigo" data-acao="restaurar">Restaurar demonstração</button></section>`}
        </div>
        <section class="cartao ia-cartao" id="iaConfig"><h2 class="cartao-titulo">${ic('faisca')} Inteligência artificial (Claude)</h2>
          ${Store.servidor ? '<p class="vazio-mini">Consultando a configuração…</p>' : IA.aviso(u)}</section>`;
    },
    montar(el, ctx) {
      const emp = ctx.empresa;
      el.querySelector('#formEmpresa').addEventListener('submit', e => {
        e.preventDefault();
        const d = UI.dadosForm(e.target);
        if (!d.nome.trim()) { UI.toast('Informe o nome da empresa.', 'erro'); return; }
        emp.nome = d.nome.trim(); emp.segmento = d.segmento; emp.cidade = d.cidade.trim(); Store.salvar();
        UI.toast('Dados salvos.', 'sucesso'); App.atualizar();
      });
      el.querySelector('#formMeta').addEventListener('submit', e => {
        e.preventDefault();
        const d = UI.dadosForm(e.target);
        if (!d.titulo.trim()) { UI.toast('Dê um título à meta.', 'erro'); return; }
        emp.meta = { titulo: d.titulo.trim(), descricao: d.descricao.trim(), comp: d.comp, prazo: d.prazo }; Store.salvar();
        UI.toast('Meta salva.', 'sucesso'); App.atualizar();
      });
      if (Store.servidor) { pintarBanco(el); pintarIA(el, ctx.user); }
      const arqBackup = el.querySelector('#arqBackup');
      if (arqBackup) arqBackup.addEventListener('change', e => {
        const arq = e.target.files[0];
        if (!arq) return;
        const leitor = new FileReader();
        leitor.onload = () => {
          UI.confirmar({ titulo: 'Importar backup', perigo: true, rotulo: 'Substituir e importar', texto: 'Os dados deste navegador serão substituídos pelo conteúdo do arquivo. Você precisará entrar de novo.' }).then(ok => {
            if (!ok) { e.target.value = ''; return; }
            try { Store.importar(leitor.result); UI.toast('Backup importado. Entre de novo.', 'sucesso'); location.hash = '#/entrar'; }
            catch (ex) { UI.toast(ex.message || 'Não foi possível ler o arquivo.', 'erro'); e.target.value = ''; }
          });
        };
        leitor.readAsText(arq, 'utf-8');
      });
      App.acoes(el, {
        removerMeta() { emp.meta = null; Store.salvar(); UI.toast('Meta removida.', 'sucesso'); App.atualizar(); },
        exportar() { UI.baixar('skillway-backup-' + Store.agora().slice(0, 10) + '.json', Store.exportar(), 'application/json'); UI.toast('Arquivo exportado.', 'sucesso'); },
        restaurar() {
          const local = !Store.servidor;
          UI.confirmar({ titulo: 'Restaurar demonstração', perigo: true, rotulo: 'Apagar e restaurar',
            texto: local ? 'Todas as empresas, pessoas e registros salvos neste navegador serão apagados e a demonstração volta ao estado inicial. Não dá para desfazer.'
              : 'Todos os registros da empresa de demonstração serão apagados do banco e recriados no estado inicial. Não dá para desfazer.' }).then(ok => {
            if (!ok) return;
            if (local) { Seed.restaurar(); UI.toast('Demonstração restaurada.', 'sucesso'); location.hash = '#/entrar'; return; }
            Store.api('POST', 'demo/restaurar', {}).then(() => Store.sair()).then(() => { UI.toast('Demonstração restaurada. Entre de novo.', 'sucesso'); location.hash = '#/entrar'; },
              e => UI.toast(e.message, 'erro'));
          });
        }
      });
    }
  };

  window.Gestao = Gestao;
})();
