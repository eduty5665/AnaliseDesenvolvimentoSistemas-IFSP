/* ==========================================================================
   SkillWay — Motor de diagnóstico e recomendação
   Cruza currículo + setor + autoavaliação com a base curada (catalog.js) para
   montar o Perfil da Pessoa, o gap de competências e a trilha priorizada.
   Também gera as sugestões exibidas para gestores e RH.
   ========================================================================== */
(function () {
  'use strict';

  var NOTA_MINIMA = 70;      // % para validar um quiz
  var DIAS_PARADO = 10;      // dias sem atividade para considerar "parado"
  var MAX_MODULOS = 4;       // direção clara, sem sobrecarregar de opções

  function meio(n) { return Math.round(n * 2) / 2; }
  function embaralhar(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var Engine = {
    NOTA_MINIMA: NOTA_MINIMA, DIAS_PARADO: DIAS_PARADO, embaralhar: embaralhar,

    /** Competências-chave e nível esperado para uma pessoa, conforme a área-alvo. */
    alvos: function (user, areaAlvo) {
      var area = Catalog.area(areaAlvo) || Catalog.area(user.area) || Catalog.area('administrativo');
      var mapa = {};
      Object.keys(area.comp).forEach(function (k) { mapa[k] = area.comp[k]; });
      // Quem tem equipe abaixo também é avaliado em liderança (hierarquia espelhada).
      if (Store.diretos(user.id).length && !mapa.lideranca) mapa.lideranca = 3;
      return Object.keys(mapa).map(function (k) { return { comp: k, alvo: mapa[k] }; });
    },

    /** Competências que aparecem no texto do currículo. */
    evidenciasCurriculo: function (texto) {
      var t = Store.semAcento(texto), achadas = {};
      if (!t) return achadas;
      Catalog.competencias().forEach(function (c) {
        var hit = c.palavras.filter(function (p) { return t.indexOf(Store.semAcento(p)) >= 0; });
        if (hit.length) achadas[c.id] = hit[0];
      });
      return achadas;
    },

    /* ------------------------------------------------------------------ */
    /* Diagnóstico -> trilha                                               */
    /* ------------------------------------------------------------------ */
    salvarDiagnostico: function (userId, r, quando) {
      var user = Store.usuario(userId);
      var areaAlvo = (r.objetivo === 'reskilling' && r.areaAlvo) ? r.areaAlvo : r.areaAtual;
      var diag = {
        id: Store.uid('d'), userId: userId, data: quando || Store.agora(),
        areaAtual: r.areaAtual, cargo: r.cargo || user.cargo, objetivo: r.objetivo, areaAlvo: areaAlvo,
        notas: r.notas, tempo: r.tempo, orcamento: r.orcamento, curriculo: r.curriculo || ''
      };
      Store.db.diagnosticos.push(diag);
      if (r.curriculo != null) user.curriculo = r.curriculo;
      if (r.cargo) user.cargo = r.cargo;
      if (r.areaAtual) user.area = r.areaAtual;
      var ev = Store.evento(userId, 'diagnostico', { ref: diag.id });
      ev.data = diag.data;
      this.montarTrilha(user, diag);
      Store.salvar();
      return diag;
    },

    montarTrilha: function (user, diag) {
      var anterior = Store.trilha(user.id);
      var jaFeitos = {};
      if (anterior) {
        anterior.modulos.forEach(function (m) {
          m.passos.forEach(function (p) { if (p.tipo === 'conteudo' && p.status === 'concluido') jaFeitos[p.conteudoId] = p; });
        });
      }
      var teto = Catalog.ORCAMENTOS[diag.orcamento] ? Catalog.ORCAMENTOS[diag.orcamento].teto : 0;
      var lista = this.alvos(user, diag.areaAlvo).map(function (a) {
        var nota = diag.notas[a.comp] || 1;
        return { comp: a.comp, alvo: a.alvo, nota: nota, gap: a.alvo - nota };
      });
      var comGap = lista.filter(function (x) { return x.gap > 0; })
        .sort(function (a, b) { return (b.gap - a.gap) || (b.alvo - a.alvo); });
      var escolhidos, aprofundamento = false;
      if (comGap.length) {
        escolhidos = comGap.slice(0, MAX_MODULOS);
      } else {
        // Sem lacunas: propõe aprofundar as duas competências com menor folga.
        aprofundamento = true;
        escolhidos = lista.slice().sort(function (a, b) { return a.gap < b.gap ? 1 : -1; }).slice(0, 2);
      }
      var trilha = {
        id: Store.uid('t'), userId: user.id, diagId: diag.id, criadaEm: diag.data,
        aprofundamento: aprofundamento, modulos: []
      };
      escolhidos.forEach(function (x) {
        var comp = Catalog.comp(x.comp);
        var elegiveis = comp.conteudos.filter(function (ct) { return ct.tipo !== 'pratica' && ct.custo <= teto; });
        // Quem já tem base começa pelo aprofundamento.
        elegiveis.sort(function (a, b) {
          var pa = (x.nota >= 3 || aprofundamento) ? -a.nivel : a.nivel;
          var pb = (x.nota >= 3 || aprofundamento) ? -b.nivel : b.nivel;
          return pa - pb;
        });
        var qtd = x.gap >= 2 ? 2 : 1;
        var passos = elegiveis.slice(0, qtd);
        var pratica = comp.conteudos.filter(function (ct) { return ct.tipo === 'pratica'; })[0];
        if (pratica) passos.push(pratica);
        var n = 0;
        var modulo = {
          comp: x.comp, alvo: x.alvo, notaInicial: x.nota,
          passos: passos.map(function (ct) {
            var antigo = jaFeitos[ct.id];
            return {
              id: trilha.id + ':' + x.comp + ':' + (n++), tipo: 'conteudo', conteudoId: ct.id,
              status: antigo ? 'concluido' : 'pendente', herdado: !!antigo,
              horas: antigo ? antigo.horas : 0, iniciadoEm: antigo ? antigo.iniciadoEm : null,
              concluidoEm: antigo ? antigo.concluidoEm : null, evidencia: antigo ? antigo.evidencia : ''
            };
          })
        };
        modulo.passos.push({ id: trilha.id + ':' + x.comp + ':quiz', tipo: 'quiz', status: 'pendente', nota: null, concluidoEm: null });
        trilha.modulos.push(modulo);
      });
      Store.db.trilhas.push(trilha);
      return trilha;
    },

    /** Inclui na trilha um conteúdo sugerido pelo gestor. */
    adicionarSugestao: function (userId, conteudoId) {
      var trilha = Store.trilha(userId), ct = Catalog.conteudo(conteudoId);
      if (!trilha || !ct) return false;
      var existe = trilha.modulos.some(function (m) {
        return m.passos.some(function (p) { return p.conteudoId === conteudoId; });
      });
      if (existe) return false;
      var modulo = trilha.modulos.filter(function (m) { return m.comp === ct.comp; })[0];
      var passo = {
        id: trilha.id + ':' + ct.comp + ':s' + Date.now().toString(36), tipo: 'conteudo', conteudoId: conteudoId,
        status: 'pendente', herdado: false, sugerido: true, horas: 0, iniciadoEm: null, concluidoEm: null, evidencia: ''
      };
      if (modulo) {
        var posQuiz = modulo.passos.length - 1;
        modulo.passos.splice(posQuiz, 0, passo);
        if (modulo.certificadoId) { /* módulo já certificado: conteúdo extra, sem reabrir */ }
      } else {
        var perfil = this.perfil(userId);
        var item = perfil.itens.filter(function (i) { return i.comp === ct.comp; })[0];
        trilha.modulos.push({
          comp: ct.comp, alvo: item ? item.alvo : 3, notaInicial: item ? item.auto : 1, sugerido: true,
          passos: [passo, { id: trilha.id + ':' + ct.comp + ':quiz', tipo: 'quiz', status: 'pendente', nota: null, concluidoEm: null }]
        });
      }
      Store.salvar();
      return true;
    },

    acharPasso: function (userId, passoId) {
      var trilha = Store.trilha(userId), achado = null;
      if (!trilha) return null;
      trilha.modulos.forEach(function (m) {
        m.passos.forEach(function (p, i) { if (p.id === passoId) achado = { trilha: trilha, modulo: m, passo: p, indice: i }; });
      });
      return achado;
    },

    /** Um passo só abre depois que o anterior do mesmo módulo foi concluído. */
    liberado: function (modulo, indice) {
      for (var i = 0; i < indice; i++) if (modulo.passos[i].status !== 'concluido') return false;
      return true;
    },

    iniciarPasso: function (userId, passoId, quando) {
      var a = this.acharPasso(userId, passoId);
      if (!a || a.passo.status !== 'pendente') return;
      a.passo.status = 'andamento';
      a.passo.iniciadoEm = quando || Store.agora();
      var ev = Store.evento(userId, 'inicio', { comp: a.modulo.comp, ref: a.passo.conteudoId });
      ev.data = a.passo.iniciadoEm;
      Store.salvar();
    },

    concluirPasso: function (userId, passoId, dados, quando) {
      var a = this.acharPasso(userId, passoId);
      if (!a || a.passo.tipo !== 'conteudo' || a.passo.status === 'concluido') return null;
      var ct = Catalog.conteudo(a.passo.conteudoId);
      var horas = Math.max(0, parseFloat(String((dados && dados.horas) != null ? dados.horas : ct.horas).replace(',', '.')) || 0);
      a.passo.status = 'concluido';
      a.passo.horas = horas;
      a.passo.evidencia = (dados && dados.evidencia) || '';
      a.passo.concluidoEm = quando || Store.agora();
      if (!a.passo.iniciadoEm) a.passo.iniciadoEm = a.passo.concluidoEm;
      var ev = Store.evento(userId, 'conteudo', { comp: a.modulo.comp, ref: ct.id, horas: horas });
      ev.data = a.passo.concluidoEm;
      var cert = this.verificarCertificado(userId, a.modulo, a.passo.concluidoEm);
      Store.salvar();
      return { certificado: cert };
    },

    /* ------------------------------------------------------------------ */
    /* Quizzes                                                             */
    /* ------------------------------------------------------------------ */
    perguntasDe: function (compId, qtd) {
      var comp = Catalog.comp(compId);
      return embaralhar(comp.perguntas).slice(0, qtd || 5).map(function (p) {
        return { p: p.p, opcoes: p.opcoes.slice(), correta: p.correta, porque: p.porque };
      });
    },

    /** Registra uma tentativa. `respostas` = índice escolhido por pergunta. */
    registrarQuiz: function (userId, dados, quando) {
      var acertos = 0;
      var detalhe = dados.perguntas.map(function (p, i) {
        var certo = dados.respostas[i] === p.correta;
        if (certo) acertos++;
        return { p: p.p, escolhida: dados.respostas[i], correta: p.correta, certo: certo };
      });
      var pct = Math.round(acertos / dados.perguntas.length * 100);
      var t = {
        id: Store.uid('q'), userId: userId, quizId: dados.quizId || null, comp: dados.comp,
        acertos: acertos, total: dados.perguntas.length, pct: pct, data: quando || Store.agora(), detalhe: detalhe
      };
      if (dados.pratica) t.pratica = true; // perguntas geradas pela IA: treino, não altera o nível
      Store.db.tentativas.push(t);
      var ev = Store.evento(userId, 'quiz', { comp: dados.comp, ref: t.id, pct: pct });
      ev.data = t.data;
      var cert = null;
      if (!dados.quizId && !dados.pratica && dados.validar !== false) cert = this.aplicarValidacao(userId, dados.comp, pct, t.data);
      Store.salvar();
      return { tentativa: t, certificado: cert, aprovado: pct >= NOTA_MINIMA };
    },

    aplicarValidacao: function (userId, compId, pct, quando) {
      var trilha = Store.trilha(userId);
      if (!trilha) return null;
      var modulo = trilha.modulos.filter(function (m) { return m.comp === compId; })[0];
      if (!modulo) return null;
      var passo = modulo.passos[modulo.passos.length - 1];
      if (passo.tipo !== 'quiz') return null;
      if (passo.nota == null || pct > passo.nota) passo.nota = pct;
      if (pct >= NOTA_MINIMA && passo.status !== 'concluido') {
        passo.status = 'concluido';
        passo.concluidoEm = quando;
      }
      return this.verificarCertificado(userId, modulo, quando);
    },

    verificarCertificado: function (userId, modulo, quando) {
      if (modulo.certificadoId) return null;
      var completo = modulo.passos.every(function (p) { return p.status === 'concluido'; });
      if (!completo) return null;
      var comp = Catalog.comp(modulo.comp);
      var horas = modulo.passos.reduce(function (s, p) { return s + (p.horas || 0); }, 0);
      var quiz = modulo.passos[modulo.passos.length - 1];
      var cert = {
        id: Store.uid('c'), userId: userId, comp: modulo.comp, titulo: comp.nome, horas: horas,
        nota: quiz.nota, emitidoEm: quando || Store.agora(),
        codigo: 'SW-' + Store.sha256(userId + modulo.comp + (quando || '')).slice(0, 4).toUpperCase() + '-' +
          Math.random().toString(36).slice(2, 6).toUpperCase()
      };
      Store.db.certificados.push(cert);
      modulo.certificadoId = cert.id;
      var ev = Store.evento(userId, 'certificado', { comp: modulo.comp, ref: cert.id });
      ev.data = cert.emitidoEm;
      var user = Store.usuario(userId);
      Store.enviarMensagem({
        empresaId: user.empresaId, para: userId, tipo: 'sistema', criadoEm: cert.emitidoEm,
        titulo: 'Certificado emitido: ' + comp.nome,
        corpo: 'Você concluiu todos os passos e validou a competência com ' + quiz.nota + '% no quiz. O certificado já está na sua área de certificados.'
      });
      return cert;
    },

    /* ------------------------------------------------------------------ */
    /* Perfil da Pessoa                                                    */
    /* ------------------------------------------------------------------ */
    /** `ate` (ISO) permite reconstruir o perfil em uma data passada, para o gráfico de evolução. */
    perfil: function (userId, ate) {
      var user = Store.usuario(userId);
      var diags = Store.diagnosticos(userId).filter(function (d) { return !ate || d.data <= ate; });
      var diag = diags[diags.length - 1] || null;
      var eventos = Store.eventos(userId).filter(function (e) { return !ate || e.data <= ate; });
      var relevantes = eventos.filter(function (e) { return e.tipo !== 'inicio'; });
      var ultimo = relevantes.length ? relevantes[relevantes.length - 1].data : null;
      var semana = Date.now() - 7 * 86400000;
      var horas = 0, horasSemana = 0;
      eventos.forEach(function (e) {
        if (e.tipo === 'conteudo') {
          horas += e.horas || 0;
          if (new Date(e.data).getTime() >= semana) horasSemana += e.horas || 0;
        }
      });
      var certificados = Store.certificados(userId).filter(function (c) { return !ate || c.emitidoEm <= ate; });
      var base = {
        user: user, diag: diag, itens: [], aderencia: null, progresso: 0, passosFeitos: 0, passosTotal: 0,
        horas: horas, horasSemana: horasSemana, horasRestantes: 0, semanasRestantes: null,
        certificados: certificados, ultimaAtividade: ultimo, diasParado: Store.diasDesde(ultimo),
        trilha: null, status: 'sem-diagnostico', evidencias: {}, quantosDiagnosticos: diags.length
      };
      if (!diag) return base;

      var trilha = Store.db.trilhas.filter(function (t) { return t.diagId === diag.id; })[0] || null;
      var evidencias = this.evidenciasCurriculo(diag.curriculo || user.curriculo);
      var tentativas = Store.tentativas(userId).filter(function (t) { return !t.pratica && t.data >= diag.data && (!ate || t.data <= ate); });
      var soma = 0, feitos = 0, total = 0, restantes = 0;

      base.itens = this.alvos(user, diag.areaAlvo).map(function (a) {
        var auto = diag.notas[a.comp] || 1;
        var modulo = trilha ? trilha.modulos.filter(function (m) { return m.comp === a.comp; })[0] : null;
        var concluidos = 0;
        if (modulo) {
          modulo.passos.forEach(function (p) {
            if (p.tipo === 'conteudo' && p.status === 'concluido' && !p.herdado && (!ate || p.concluidoEm <= ate)) concluidos++;
          });
        }
        var melhor = null;
        tentativas.forEach(function (t) { if (t.comp === a.comp && (melhor == null || t.pct > melhor)) melhor = t.pct; });
        var bonus = Math.min(concluidos, 2) * 0.5 + (melhor != null && melhor >= NOTA_MINIMA ? 0.5 : 0);
        var nivel = Math.min(5, meio(auto + bonus));
        var gap = Math.max(0, a.alvo - nivel);
        soma += Math.min(nivel / a.alvo, 1);
        return {
          comp: a.comp, nome: Catalog.comp(a.comp).nome, curto: Catalog.comp(a.comp).curto,
          auto: auto, nivel: nivel, alvo: a.alvo, gap: gap,
          status: gap >= 2 ? 'critico' : (gap > 0 ? 'atencao' : 'ok'),
          evidencia: evidencias[a.comp] || null, quiz: melhor, naTrilha: !!modulo
        };
      });
      base.aderencia = Math.round(soma / base.itens.length * 100);
      base.evidencias = evidencias;
      base.trilha = trilha;

      if (trilha) {
        trilha.modulos.forEach(function (m) {
          m.passos.forEach(function (p) {
            total++;
            var feito = p.status === 'concluido' && (!ate || !p.concluidoEm || p.concluidoEm <= ate);
            if (feito) feitos++;
            else if (p.tipo === 'conteudo') restantes += Catalog.conteudo(p.conteudoId).horas;
          });
        });
      }
      base.passosFeitos = feitos;
      base.passosTotal = total;
      base.progresso = total ? Math.round(feitos / total * 100) : 0;
      base.horasRestantes = restantes;
      var porSemana = Catalog.TEMPOS[diag.tempo] ? Catalog.TEMPOS[diag.tempo].horas : 2;
      base.semanasRestantes = restantes ? Math.ceil(restantes / porSemana) : 0;

      if (total && feitos === total) base.status = 'concluida';
      else if (base.diasParado != null && base.diasParado > DIAS_PARADO) base.status = 'parado';
      else base.status = 'em-dia';
      return base;
    },

    rotuloStatus: function (perfil) {
      switch (perfil.status) {
        case 'sem-diagnostico': return { texto: 'Sem diagnóstico', cor: 'vermelho' };
        case 'concluida': return { texto: 'Trilha concluída', cor: 'verde' };
        case 'parado': return { texto: 'Parado há ' + perfil.diasParado + ' dias', cor: 'amarelo' };
        default: return { texto: 'Em dia', cor: 'verde' };
      }
    },

    /** Áreas em que as notas informadas já se encaixam (útil para quem pensa em migrar). */
    afinidades: function (userId) {
      var diag = Store.diagnostico(userId);
      if (!diag) return [];
      var perfil = this.perfil(userId), niveis = {};
      perfil.itens.forEach(function (i) { niveis[i.comp] = i.nivel; });
      return Catalog.areas().filter(function (a) { return a.id !== diag.areaAlvo; }).map(function (a) {
        var comuns = Object.keys(a.comp).filter(function (k) { return niveis[k] != null; });
        var s = comuns.reduce(function (acc, k) { return acc + Math.min(niveis[k] / a.comp[k], 1); }, 0);
        return { area: a, comuns: comuns.length, total: Object.keys(a.comp).length, pct: comuns.length ? Math.round(s / comuns.length * 100) : 0 };
      }).filter(function (x) { return x.comuns >= 3; })
        .sort(function (a, b) { return (b.pct - a.pct) || (b.comuns - a.comuns); }).slice(0, 3);
    },

    /** Pontos (data, aderência) para o gráfico de evolução. */
    evolucao: function (userId) {
      var self = this, datas = [];
      Store.eventos(userId).forEach(function (e) {
        if (e.tipo === 'diagnostico' || e.tipo === 'conteudo' || e.tipo === 'quiz') datas.push(e.data);
      });
      var pontos = [];
      datas.forEach(function (d) {
        var p = self.perfil(userId, d);
        if (p.aderencia == null) return;
        var dia = d.slice(0, 10);
        if (pontos.length && pontos[pontos.length - 1].dia === dia) pontos[pontos.length - 1].valor = p.aderencia;
        else pontos.push({ dia: dia, data: d, valor: p.aderencia });
      });
      return pontos;
    },

    /** Próximo passo em aberto, respeitando a ordem de prioridade da trilha. */
    proximoPasso: function (userId) {
      var trilha = Store.trilha(userId);
      if (!trilha) return null;
      for (var m = 0; m < trilha.modulos.length; m++) {
        var mod = trilha.modulos[m];
        for (var i = 0; i < mod.passos.length; i++) {
          if (mod.passos[i].status !== 'concluido') return { modulo: mod, passo: mod.passos[i], indice: i };
        }
      }
      return null;
    },

    /** Colegas da mesma empresa que já dominam a competência (mentoria entre pares). */
    referenciasInternas: function (userId, compId) {
      var user = Store.usuario(userId), self = this;
      // No modo servidor, cada pessoa só recebe os próprios registros; o servidor manda um resumo de quem domina cada competência.
      var publico = Store.db.publico;
      if (publico && publico.referencias) {
        return (publico.referencias[compId] || []).filter(function (r) { return r.userId !== userId && Store.usuario(r.userId); })
          .map(function (r) { return { user: Store.usuario(r.userId), nivel: r.nivel }; })
          .sort(function (a, b) { return b.nivel - a.nivel; }).slice(0, 2);
      }
      return Store.pessoas(user.empresaId).filter(function (u) { return u.id !== userId; }).map(function (u) {
        var p = self.perfil(u.id);
        var item = p.itens.filter(function (i) { return i.comp === compId; })[0];
        return item ? { user: u, nivel: item.nivel } : null;
      }).filter(function (x) { return x && x.nivel >= 4; })
        .sort(function (a, b) { return b.nivel - a.nivel; }).slice(0, 2);
    },

    /* ------------------------------------------------------------------ */
    /* Visão do administrador                                              */
    /* ------------------------------------------------------------------ */
    resumoEquipe: function (pessoas) {
      var self = this;
      var perfis = pessoas.map(function (u) { return self.perfil(u.id); });
      var comDiag = perfis.filter(function (p) { return p.diag; });
      var media = function (lista, campo) {
        return lista.length ? Math.round(lista.reduce(function (s, p) { return s + p[campo]; }, 0) / lista.length) : 0;
      };
      var porComp = {};
      comDiag.forEach(function (p) {
        p.itens.forEach(function (i) {
          var c = porComp[i.comp] || (porComp[i.comp] = { comp: i.comp, nome: i.nome, curto: i.curto, pessoas: 0, somaNivel: 0, somaAlvo: 0, abaixo: [], criticos: 0 });
          c.pessoas++; c.somaNivel += i.nivel; c.somaAlvo += i.alvo;
          if (i.gap > 0) c.abaixo.push(p.user.id);
          if (i.gap >= 2) c.criticos++;
        });
      });
      var competencias = Object.keys(porComp).map(function (k) {
        var c = porComp[k];
        c.nivel = Math.round(c.somaNivel / c.pessoas * 10) / 10;
        c.alvo = Math.round(c.somaAlvo / c.pessoas * 10) / 10;
        c.cobertura = Math.round(Math.min(c.somaNivel / c.somaAlvo, 1) * 100);
        c.status = c.cobertura < 60 ? 'critico' : (c.cobertura < 85 ? 'atencao' : 'ok');
        return c;
      }).sort(function (a, b) { return a.cobertura - b.cobertura; });
      return {
        perfis: perfis, total: pessoas.length, comDiagnostico: comDiag.length,
        progressoMedio: media(comDiag, 'progresso'), aderenciaMedia: media(comDiag, 'aderencia'),
        certificados: perfis.reduce(function (s, p) { return s + p.certificados.length; }, 0),
        horas: Math.round(perfis.reduce(function (s, p) { return s + p.horas; }, 0)),
        competencias: competencias
      };
    },

    /** Sugestões geradas por regras a partir dos dados reais da equipe. */
    sugestoes: function (admin) {
      var pessoas = Store.equipe(admin), resumo = this.resumoEquipe(pessoas), lista = [];
      var semDiag = resumo.perfis.filter(function (p) { return !p.diag; });
      if (semDiag.length) {
        lista.push({
          cor: 'vermelho',
          titulo: semDiag.length === 1 ? semDiag[0].user.nome + ' ainda não fez o diagnóstico'
            : semDiag.length + ' pessoas ainda não fizeram o diagnóstico',
          texto: semDiag.length === 1 ? 'Sem o diagnóstico não há trilha. Envie um lembrete.'
            : semDiag.map(function (p) { return p.user.nome.split(' ')[0]; }).join(', ') + '. Envie um lembrete.',
          acao: { tipo: 'lembrete', rotulo: 'Enviar lembrete', ids: semDiag.map(function (p) { return p.user.id; }), motivo: 'diagnostico' }
        });
      }
      resumo.perfis.filter(function (p) { return p.status === 'parado'; })
        .sort(function (a, b) { return b.diasParado - a.diasParado; }).slice(0, 3).forEach(function (p) {
          lista.push({
            cor: 'vermelho', titulo: p.user.nome + ' está sem avançar',
            texto: 'Há ' + p.diasParado + ' dias sem registrar progresso na trilha (' + p.progresso + '% concluída).',
            acao: { tipo: 'lembrete', rotulo: 'Enviar lembrete', ids: [p.user.id], motivo: 'trilha' }
          });
        });
      resumo.competencias.filter(function (c) { return c.abaixo.length >= 2 && c.status !== 'ok'; }).slice(0, 2).forEach(function (c) {
        lista.push({
          cor: 'amarelo', titulo: 'Reforçar ' + c.nome,
          texto: c.abaixo.length + ' pessoas estão abaixo do nível esperado para o cargo (cobertura de ' + c.cobertura + '%).',
          acao: { tipo: 'quiz', rotulo: 'Criar quiz para elas', ids: c.abaixo, comp: c.comp }
        });
      });
      var limite = Date.now() - 14 * 86400000;
      resumo.perfis.forEach(function (p) {
        p.certificados.filter(function (c) { return new Date(c.emitidoEm).getTime() >= limite; }).slice(0, 1).forEach(function (c) {
          var jaParabenizado = Store.db.mensagens.some(function (m) {
            return m.de === admin.id && m.para === p.user.id && m.tipo === 'reconhecimento' && m.grupo === c.id;
          });
          if (jaParabenizado) return;
          lista.push({
            cor: 'verde', titulo: 'Certificado novo: ' + p.user.nome,
            texto: 'Concluiu ' + c.titulo + ' com ' + c.nota + '% no quiz de validação.',
            acao: { tipo: 'parabens', rotulo: 'Enviar reconhecimento', ids: [p.user.id], certId: c.id, compNome: c.titulo }
          });
        });
      });
      return lista.slice(0, 6);
    },

    plano: function (empresaId) {
      var n = Store.pessoas(empresaId).length;
      var plano = Catalog.planoPara(n);
      return { colaboradores: n, plano: plano, mensal: n * plano.preco, abaixoDoMinimo: n < 100 };
    }
  };

  window.Engine = Engine;
})();
