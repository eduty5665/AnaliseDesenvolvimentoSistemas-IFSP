// Utilitários de navegador usados pelo ERP (impressão, downloads, atalhos do PDV e QR code do Pix).
window.vino = {
    focar: (id) => {
        const el = document.getElementById(id);
        if (el) { el.focus(); if (el.select) el.select(); }
    },

    // Imprime somente o elemento indicado (cupom, ordem de separação, relatório) em um iframe limpo,
    // para sair sem menu lateral e com quebra de página correta.
    imprimir: (id) => {
        const el = id ? document.getElementById(id) : null;
        if (!el) { window.print(); return; }
        const quadro = document.createElement('iframe');
        quadro.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
        document.body.appendChild(quadro);
        const estilos = Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(l => l.outerHTML).join('');
        const doc = quadro.contentDocument;
        doc.open();
        doc.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><base href="' + document.baseURI + '">' + estilos +
            '</head><body class="impressao">' + el.outerHTML + '</body></html>');
        doc.close();
        let impresso = false;
        const imprimir = () => {
            if (impresso) return;
            impresso = true;
            quadro.contentWindow.focus();
            quadro.contentWindow.print();
            setTimeout(() => quadro.remove(), 2000);
        };
        quadro.onload = () => setTimeout(imprimir, 300);
        setTimeout(imprimir, 1200);
    },

    baixar: async (nome, streamRef) => {
        const blob = new Blob([await streamRef.arrayBuffer()]);
        vino._salvar(nome, blob);
    },

    // Texto (CSV) com BOM para o Excel reconhecer os acentos
    baixarTexto: (nome, conteudo) => vino._salvar(nome, new Blob(['﻿', conteudo], { type: 'text/csv;charset=utf-8' })),

    _salvar: (nome, blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nome || 'arquivo';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    copiar: async (texto) => {
        try { await navigator.clipboard.writeText(texto); return true; } catch { return false; }
    },

    // Desenha um QR code (SVG) dentro do elemento; devolve false se a biblioteca não carregou (sem internet)
    qr: (id, texto) => {
        const el = document.getElementById(id);
        if (!el || typeof qrcode !== 'function') return false;
        const q = qrcode(0, 'M');
        q.addData(texto);
        q.make();
        el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
        return true;
    },

    // Atalhos de teclado do PDV: F2, F4, F6, F7, F8, F9, F10
    atalhos: {
        _ouvinte: null,
        registrar: (dotnet) => {
            vino.atalhos.remover();
            vino.atalhos._ouvinte = (e) => {
                if (/^F(2|4|6|7|8|9|10)$/.test(e.key)) {
                    e.preventDefault();
                    dotnet.invokeMethodAsync('Atalho', e.key);
                }
            };
            document.addEventListener('keydown', vino.atalhos._ouvinte);
        },
        remover: () => {
            if (vino.atalhos._ouvinte) document.removeEventListener('keydown', vino.atalhos._ouvinte);
            vino.atalhos._ouvinte = null;
        }
    }
};
