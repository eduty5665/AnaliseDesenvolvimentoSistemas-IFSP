/* ==========================================================================
   SkillWay — Regras de negócio no servidor
   Carrega os mesmos arquivos do navegador (catalog, store, engine, seed) em um
   contexto isolado. Assim o servidor calcula perfil, gap, trilha e resumo de
   equipe com exatamente a mesma lógica das telas, sem duplicar código.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const ctx = { console, setTimeout, clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
['catalog', 'store', 'engine', 'seed'].forEach(nome => {
  const arquivo = path.join(RAIZ, 'js', nome + '.js');
  vm.runInContext(fs.readFileSync(arquivo, 'utf8'), ctx, { filename: arquivo });
});

module.exports = {
  Catalog: ctx.Catalog, Store: ctx.Store, Engine: ctx.Engine, Seed: ctx.Seed,
  /** Aponta as regras para os dados de uma empresa (objeto com as coleções). */
  usar(dados) { ctx.Store.usar(dados); return this; },
  /** Banco de demonstração gerado em memória, com datas relativas a hoje. */
  demo() { return JSON.parse(JSON.stringify(ctx.Seed.gerar())); }
};
