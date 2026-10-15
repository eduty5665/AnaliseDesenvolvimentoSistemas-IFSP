/* ==========================================================================
   SkillWay — Componentes de interface compartilhados
   ========================================================================== */
(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Ícones (traço 1.8, 24x24) ---------- */
  var TRACOS = {
    inicio: '<path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    diagnostico: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/>',
    trilha: '<path d="M6 20c0-4 12-4 12-8s-12-4-12-8"/><circle cx="6" cy="4" r="1.6"/><circle cx="18" cy="12" r="1.6"/><circle cx="6" cy="20" r="1.6"/>',
    perfil: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2-2.5 3.6M12 17h.01"/>',
    certificado: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7M10 9l1.5 1.500L14.5 7.5"/>',
    mensagens: '<path d="M4 6.500A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.500v9a1.5 1.5 0 0 1-1.5 1.500H10l-4.5 3.500V17A1.5 1.5 0 0 1 4 15.500z"/>',
    config: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.5 12H21M5.6 5.600l1.8 1.800M16.6 16.600l1.8 1.800M5.6 18.400l1.8-1.800M16.6 7.400l1.8-1.8"/>',
    painel: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    equipe: '<circle cx="9" cy="8.5" r="3"/><circle cx="17" cy="9.5" r="2.3"/><path d="M3 20c.6-3.2 3-5 6-5s5.4 1.8 6 5M15.5 20c.3-1.8 1.6-3.3 3.5-3.3 1.3 0 2.3.7 3 1.8"/>',
    relatorios: '<path d="M4 20V10M10 20V5M16 20v-7M21.5 20h-19"/>',
    benchmark: '<path d="M4 18 9.5 12l3.5 3.500L20 7"/><path d="M15 7h5v5"/>',
    empresa: '<path d="M4 21V6l8-3v18M12 9l8 2.500V21M2.5 21h19M7.5 9v.01M7.5 13v.01M7.5 17v.01M16 14v.01M16 17.500v.01"/>',
    sair: '<path d="M10 4H6a1.5 1.5 0 0 0-1.5 1.500v13A1.5 1.5 0 0 0 6 20h4M15 8l4 4-4 4M19 12H9.5"/>',
    busca: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.500L19 7.5"/>',
    fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    voltar: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    cadeado: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.5"/>',
    relogio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.500V12l3 2"/>',
    externo: '<path d="M14 5h5v5M19 5l-8 8M11 6H6.500A1.5 1.5 0 0 0 5 7.500v10A1.5 1.5 0 0 0 6.5 19h10a1.5 1.5 0 0 0 1.5-1.500V13"/>',
    baixar: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.500M5 20h14"/>',
    enviar: '<path d="m4 12 16-7-6 16-3-6.500z"/>',
    imprimir: '<path d="M7 8V4h10v4M7 17H5a1.5 1.5 0 0 1-1.5-1.500v-6A1.5 1.5 0 0 1 5 8h14a1.5 1.5 0 0 1 1.5 1.500v6A1.5 1.5 0 0 1 19 17h-2M7 14h10v6H7z"/>',
    editar: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.500l4 4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    faisca: '<path d="M12 3l1.8 5.200L19 10l-5.2 1.800L12 17l-1.8-5.200L5 10l5.2-1.800zM18.5 15v4.500M16.25 17.250h4.5"/>',
    alvo: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    livro: '<path d="M5 4.500h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10"/>',
    video: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m10.5 9.5 4 2.5-4 2.500z"/>',
    curso: '<path d="M3 9.5 12 5l9 4.5-9 4.500zM7 12v4.500c1.5 1.3 3.2 2 5 2s3.5-.7 5-2V12M21 9.500V15"/>',
    pratica: '<path d="M14.5 5.5 18.5 9.5 9 19H5v-4zM4 21h16"/>',
    olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    upload: '<path d="M12 16V5M7.5 9.5 12 5l4.5 4.500M5 20h14"/>',
    organograma: '<rect x="9" y="3.5" width="6" height="4.5" rx="1"/><rect x="3" y="16" width="6" height="4.5" rx="1"/><rect x="15" y="16" width="6" height="4.5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.500M12 7.500v.01"/>',
    lixeira: '<path d="M5 7h14M9.5 7V4.500h5V7M7 7l.8 12.500h8.400L17 7"/>',
    chave: '<circle cx="8" cy="15" r="3.5"/><path d="m10.5 12.5 8-8M15.5 7.500l2.5 2.500M18 5l2 2"/>'
  };
  function ic(nome, tamanho) {
    var t = tamanho || 18;
    return '<svg class="ic" width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (TRACOS[nome] || '') + '</svg>';
  }

  /* ---------- Marca: a estrada em "S" com a seta ---------- */
  var seqLogo = 0;
  function logo(tamanho) {
    var id = 'lg' + (++seqLogo), t = tamanho || 30;
    return '<svg class="marca-simbolo" width="' + t + '" height="' + t + '" viewBox="0 0 48 48" fill="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="30" y1="4" x2="16" y2="44" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#19C8E6"/><stop offset=".55" stop-color="#4F7CF7"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>' +
      '<path d="M12 39.5 30 29.500c6.5-3.7 5.5-11-1.5-13L20.5 14c-6.8-2-6-9.5 1-10.300l12.5-1.4" stroke="url(#' + id + ')" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 3.5)"/>' +
      '<path d="M32.5 1.2 42.5 5 35.5 12.500z" fill="#19C8E6"/>' +
      '<path d="M14.5 41 29 33" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="2.6 3" opacity=".9"/>' +
      '</svg>';
  }
  function marca(tamanho) {
    return '<span class="marca">' + logo(tamanho) + '<span class="marca-nome">Skill<span>Way</span></span></span>';
  }

  /* ---------- Formatação ---------- */
  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var fmt = {
    data: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
      return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
    },
    dataCurta: function (iso) {
      if (!iso) return '—';
      var d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
      return d.getDate() + ' ' + MESES[d.getMonth()];
    },
    quando: function (iso) {
      var n = Store.diasDesde(iso);
      if (n == null) return 'sem registro';
      if (n <= 0) return 'hoje';
      if (n === 1) return 'ontem';
      if (n < 30) return 'há ' + n + ' dias';
      return fmt.data(iso);
    },
    num: function (n) { return String(Math.round(n * 10) / 10).replace('.', ','); },
    horas: function (n) { return fmt.num(n) + 'h'; },
    nivel: function (n) { return fmt.num(n); },
    moeda: function (n) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR'); },
    primeiro: function (nome) { return String(nome || '').trim().split(' ')[0]; }
  };

  function iniciais(nome) {
    var p = String(nome || '?').trim().split(/\s+/);
    return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
  }
  function avatar(user, classe) {
    var n = 0, nome = user ? user.nome : '?';
    for (var i = 0; i < nome.length; i++) n = (n + nome.charCodeAt(i) * (i + 3)) % 5;
    return '<span class="avatar tom-' + n + ' ' + (classe || '') + '" aria-hidden="true">' + esc(iniciais(nome)) + '</span>';
  }
  function pessoaCel(user, sub) {
    return '<span class="pessoa">' + avatar(user) + '<span><b>' + esc(user.nome) + '</b><small>' + esc(sub == null ? user.cargo : sub) + '</small></span></span>';
  }
  function etiqueta(texto, cor) { return '<span class="etiqueta ' + (cor || '') + '">' + esc(texto) + '</span>'; }

  /* ---------- Toast ---------- */
  var timerToast;
  function toast(msg, tipo) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.className = 'toast ' + (tipo || '');
    el.textContent = msg;
    void el.offsetWidth;
    el.classList.add('visivel');
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { el.classList.remove('visivel'); }, 3800);
  }

  /* ---------- Modal ---------- */
  function modal(opt) {
    var fundo = document.createElement('div');
    fundo.className = 'modal-fundo';
    fundo.innerHTML = '<div class="modal ' + (opt.classe || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(opt.titulo) + '">' +
      '<div class="modal-topo"><h2>' + esc(opt.titulo) + '</h2><button type="button" class="btn-icone" data-fechar aria-label="Fechar">' + ic('fechar') + '</button></div>' +
      '<div class="modal-corpo">' + opt.corpo + '</div></div>';
    var anterior = document.activeElement;
    function fechar() {
      document.removeEventListener('keydown', tecla);
      fundo.remove();
      if (anterior && anterior.focus) anterior.focus();
      if (opt.aoFechar) opt.aoFechar();
    }
    function tecla(e) { if (e.key === 'Escape') fechar(); }
    fundo.addEventListener('mousedown', function (e) { if (e.target === fundo) fechar(); });
    fundo.addEventListener('click', function (e) { if (e.target.closest('[data-fechar]')) fechar(); });
    document.addEventListener('keydown', tecla);
    document.body.appendChild(fundo);
    var ctl = { el: fundo.querySelector('.modal'), fechar: fechar };
    if (opt.aoMontar) opt.aoMontar(ctl.el, ctl);
    var foco = ctl.el.querySelector('[autofocus], input:not([type=hidden]), textarea, select, button.btn');
    if (foco) foco.focus();
    return ctl;
  }
  function confirmar(opt) {
    return new Promise(function (resolve) {
      var respondido = false;
      modal({
        titulo: opt.titulo, classe: 'estreito',
        corpo: '<p class="modal-texto">' + esc(opt.texto) + '</p><div class="modal-acoes">' +
          '<button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button>' +
          '<button type="button" class="btn ' + (opt.perigo ? 'btn-perigo' : 'btn-primario') + '" data-ok>' + esc(opt.rotulo || 'Confirmar') + '</button></div>',
        aoMontar: function (el, ctl) {
          el.querySelector('[data-ok]').addEventListener('click', function () { respondido = true; resolve(true); ctl.fechar(); });
        },
        aoFechar: function () { if (!respondido) resolve(false); }
      });
    });
  }

  /* ---------- Gráficos em SVG ---------- */
  function radar(itens) {
    var n = itens.length, cx = 230, cy = 150, R = 104, i;
    if (n < 3) return '';
    function ponto(idx, valor) {
      var ang = -Math.PI / 2 + idx * 2 * Math.PI / n, r = R * valor / 5;
      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    }
    function poligono(campo) {
      return itens.map(function (it, idx) { var p = ponto(idx, it[campo]); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    }
    var s = '<svg class="radar" viewBox="0 0 460 300" role="img" aria-label="Radar de competências: nível atual comparado ao esperado para o cargo">';
    for (var nivel = 1; nivel <= 5; nivel++) {
      var anel = [];
      for (i = 0; i < n; i++) { var p = ponto(i, nivel); anel.push(p[0].toFixed(1) + ',' + p[1].toFixed(1)); }
      s += '<polygon class="radar-anel" points="' + anel.join(' ') + '"/>';
    }
    for (i = 0; i < n; i++) {
      var fim = ponto(i, 5);
      s += '<line class="radar-eixo" x1="' + cx + '" y1="' + cy + '" x2="' + fim[0].toFixed(1) + '" y2="' + fim[1].toFixed(1) + '"/>';
    }
    s += '<polygon class="radar-alvo" points="' + poligono('alvo') + '"/>';
    s += '<polygon class="radar-nivel" points="' + poligono('nivel') + '"/>';
    itens.forEach(function (it, idx) {
      var p = ponto(idx, it.nivel), rot = ponto(idx, 6.25);
      var ancora = Math.abs(rot[0] - cx) < 12 ? 'middle' : (rot[0] > cx ? 'start' : 'end');
      s += '<circle class="radar-ponto ' + it.status + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.6"/>';
      s += '<text class="radar-rotulo" x="' + rot[0].toFixed(1) + '" y="' + (rot[1] + 4).toFixed(1) + '" text-anchor="' + ancora + '">' + esc(it.curto) + '</text>';
    });
    return s + '</svg><div class="legenda"><span><i class="lg-nivel"></i>Nível atual</span><span><i class="lg-alvo"></i>Esperado para o cargo</span></div>';
  }

  function linha(pontos) {
    if (!pontos.length) return '<p class="vazio-mini">O gráfico aparece depois do primeiro diagnóstico.</p>';
    var W = 560, H = 190, e = 44, d = 14, t = 20, b = 28;
    var min = Math.max(0, Math.min.apply(null, pontos.map(function (p) { return p.valor; })) - 10);
    min = Math.floor(min / 10) * 10;
    var t0 = new Date(pontos[0].data).getTime(), t1 = new Date(pontos[pontos.length - 1].data).getTime();
    function x(p) { return t1 === t0 ? (e + W - d) / 2 : e + (new Date(p.data).getTime() - t0) / (t1 - t0) * (W - e - d); }
    function y(v) { return t + (100 - v) / (100 - min || 1) * (H - t - b); }
    var s = '<svg class="grafico-linha" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Evolução da aderência ao cargo, de ' + pontos[0].valor + '% para ' + pontos[pontos.length - 1].valor + '%">';
    [min, Math.round((min + 100) / 2), 100].forEach(function (v) {
      s += '<line class="gl-grade" x1="' + e + '" x2="' + (W - d) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
        '<text class="gl-eixo" x="' + (e - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + '%</text>';
    });
    var caminho = pontos.map(function (p, i) { return (i ? 'L' : 'M') + x(p).toFixed(1) + ' ' + y(p.valor).toFixed(1); }).join(' ');
    if (pontos.length > 1) {
      s += '<path class="gl-area" d="' + caminho + ' L' + x(pontos[pontos.length - 1]).toFixed(1) + ' ' + (H - b) + ' L' + x(pontos[0]).toFixed(1) + ' ' + (H - b) + ' Z"/>';
      s += '<path class="gl-linha" d="' + caminho + '"/>';
    }
    pontos.forEach(function (p, i) {
      s += '<circle class="gl-ponto" cx="' + x(p).toFixed(1) + '" cy="' + y(p.valor).toFixed(1) + '" r="3.5"><title>' + fmt.data(p.data) + ': ' + p.valor + '%</title></circle>';
      if (i === 0 || i === pontos.length - 1) {
        s += '<text class="gl-eixo" x="' + x(p).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 && pontos.length > 1 ? 'start' : (pontos.length > 1 ? 'end' : 'middle')) + '">' + fmt.dataCurta(p.data) + '</text>';
      }
    });
    var ult = pontos[pontos.length - 1];
    s += '<text class="gl-valor" x="' + Math.min(x(ult), W - d - 4).toFixed(1) + '" y="' + (y(ult.valor) - 10).toFixed(1) + '" text-anchor="end">' + ult.valor + '%</text>';
    return s + '</svg>';
  }

  /** Barra de nível 0–5 com marcador do nível esperado. */
  function barraNivel(nivel, alvo, status) {
    return '<span class="nivel-barra" role="img" aria-label="Nível ' + fmt.nivel(nivel) + ' de 5; esperado ' + alvo + '">' +
      '<span class="nivel-preench ' + (status || '') + '" style="width:' + (nivel / 5 * 100) + '%"></span>' +
      '<span class="nivel-alvo" style="left:' + (alvo / 5 * 100) + '%"></span></span>';
  }
  function barra(pct, cor) {
    return '<span class="barra"><span class="' + (cor || '') + '" style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></span>';
  }
  var ROTULO_STATUS = { critico: ['Crítico', 'vermelho'], atencao: ['Atenção', 'amarelo'], ok: ['No nível', 'verde'] };
  function statusComp(status) { var r = ROTULO_STATUS[status]; return etiqueta(r[0], r[1]); }

  /* ---------- Arquivos ---------- */
  function baixar(nome, conteudo, tipo) {
    var blob = new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function csv(linhas) {
    // Separador ";" e BOM: abre direto no Excel em português.
    return '﻿' + linhas.map(function (l) {
      return l.map(function (c) {
        var v = String(c == null ? '' : c);
        return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(';');
    }).join('\r\n');
  }
  function lerCsv(texto) {
    var t = String(texto || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var primeira = t.split('\n')[0] || '';
    var sep = (primeira.split(';').length >= primeira.split(',').length) ? ';' : ',';
    if (primeira.indexOf('\t') >= 0 && primeira.split('\t').length > primeira.split(sep).length) sep = '\t';
    var linhas = [], atual = [], campo = '', aspas = false;
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (aspas) {
        if (ch === '"' && t[i + 1] === '"') { campo += '"'; i++; }
        else if (ch === '"') aspas = false;
        else campo += ch;
      } else if (ch === '"') aspas = true;
      else if (ch === sep) { atual.push(campo); campo = ''; }
      else if (ch === '\n') { atual.push(campo); linhas.push(atual); atual = []; campo = ''; }
      else campo += ch;
    }
    if (campo !== '' || atual.length) { atual.push(campo); linhas.push(atual); }
    return linhas.filter(function (l) { return l.some(function (c) { return String(c).trim() !== ''; }); })
      .map(function (l) { return l.map(function (c) { return String(c).trim(); }); });
  }

  function opcoes(lista, selecionado, vazio) {
    return (vazio != null ? '<option value="">' + esc(vazio) + '</option>' : '') + lista.map(function (o) {
      return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(selecionado) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
    }).join('');
  }
  function dadosForm(form) {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === 'checkbox') {
        if (form.querySelectorAll('[name="' + el.name + '"]').length > 1) {
          d[el.name] = d[el.name] || [];
          if (el.checked) d[el.name].push(el.value);
        } else d[el.name] = el.checked;
      } else if (el.type === 'radio') { if (el.checked) d[el.name] = el.value; }
      else d[el.name] = el.value;
    });
    return d;
  }

  window.UI = {
    esc: esc, ic: ic, logo: logo, marca: marca, fmt: fmt, iniciais: iniciais, avatar: avatar, pessoaCel: pessoaCel,
    etiqueta: etiqueta, toast: toast, modal: modal, confirmar: confirmar, radar: radar, linha: linha,
    barraNivel: barraNivel, barra: barra, statusComp: statusComp, baixar: baixar, csv: csv, lerCsv: lerCsv,
    opcoes: opcoes, dadosForm: dadosForm
  };
})();
