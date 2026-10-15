/* ==========================================================================
   SkillWay — Assistente de conexão com o Supabase
   Uso: abra o arquivo conectar-supabase.bat (ou rode: node servidor/configurar.js)

   Pede a senha do banco, testa a conexão e grava a DATABASE_URL no arquivo .env.
   A senha fica só nesse arquivo, no seu computador (o .env está no .gitignore).
   ========================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const RAIZ = path.join(__dirname, '..');
const ARQ_ENV = path.join(RAIZ, '.env');
const ARQ_PROJETO = path.join(__dirname, 'supabase.json');

function lerProjeto() {
  try {
    const p = JSON.parse(fs.readFileSync(ARQ_PROJETO, 'utf8').replace(/^﻿/, ''));
    return p && /^[a-z0-9]{15,30}$/.test(p.projeto || '') ? p : null;
  } catch (e) { return null; }
}

/* ---------- perguntas no terminal ---------- */
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const filaLinhas = [], esperando = [];
let fim = false;
if (!process.stdin.isTTY) {
  rl.on('line', l => { const r = esperando.shift(); if (r) r(l); else filaLinhas.push(l); });
  rl.on('close', () => { fim = true; esperando.splice(0).forEach(r => r('')); });
}
let oculto = false;
const escrever = rl._writeToOutput && rl._writeToOutput.bind(rl);
if (escrever) rl._writeToOutput = texto => { if (!oculto || /[\r\n]/.test(texto)) escrever(texto); };

function perguntar(texto, esconder) {
  if (!process.stdin.isTTY) {
    process.stdout.write(texto + '\n');
    if (filaLinhas.length) return Promise.resolve(filaLinhas.shift().trim());
    if (fim) return Promise.resolve('');
    return new Promise(r => esperando.push(l => r(String(l).trim())));
  }
  return new Promise(resolve => {
    rl.question(texto, resposta => { oculto = false; if (esconder) process.stdout.write('\n'); resolve(resposta.trim()); });
    oculto = !!esconder;
  });
}

/* ---------- montagem e teste da conexão ---------- */
const ehEndereco = t => /^postgres(ql)?:\/\//i.test(t);

/** Endereços possíveis quando só a senha foi informada. */
function candidatos(projeto, senha) {
  const s = encodeURIComponent(senha), ref = projeto.projeto, reg = projeto.regiao;
  const lista = [];
  if (reg) {
    ['aws-1-', 'aws-0-'].forEach(prefixo => lista.push({
      nome: 'Session pooler (' + prefixo + reg + ')',
      url: 'postgresql://postgres.' + ref + ':' + s + '@' + prefixo + reg + '.pooler.supabase.com:5432/postgres'
    }));
  }
  lista.push({ nome: 'conexão direta (precisa de IPv6)', url: 'postgresql://postgres:' + s + '@db.' + ref + '.supabase.co:5432/postgres' });
  return lista;
}

/** Coloca a senha em um endereço colado do painel (troca o [YOUR-PASSWORD] ou a senha que veio nele). */
function comSenha(endereco, senha) {
  const s = encodeURIComponent(senha);
  if (/\[YOUR-PASSWORD\]/i.test(endereco)) return endereco.replace(/\[YOUR-PASSWORD\]/i, s);
  const m = endereco.match(/^(postgres(?:ql)?:\/\/[^:@\/]+)(?::[^@]*)?@(.*)$/i);
  return m ? m[1] + ':' + s + '@' + m[2] : endereco;
}
const temSenha = endereco => !/\[YOUR-PASSWORD\]/i.test(endereco) && /^postgres(?:ql)?:\/\/[^:@\/]+:[^@]+@/i.test(endereco);

async function testar(url) {
  const postgres = require('./vendor/postgres.js');
  let alvo;
  try { alvo = new URL(url); } catch (e) { return { ok: false, tipo: 'endereco', mensagem: 'endereço inválido' }; }
  const local = ['localhost', '127.0.0.1', '::1'].indexOf(alvo.hostname) >= 0;
  const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 12, idle_timeout: 2, ssl: local ? false : 'require', onnotice() {} });
  try {
    const r = await sql.unsafe('SELECT current_database() AS banco, current_user AS usuario');
    return { ok: true, banco: r[0].banco, usuario: r[0].usuario };
  } catch (e) {
    const m = String(e && e.message || e), c = e && e.code;
    let tipo = 'outro';
    if (c === '28P01' || /password authentication failed|SASL|senha/i.test(m)) tipo = 'senha';
    else if (/tenant or user not found/i.test(m)) tipo = 'projeto';
    else if (['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'CONNECT_TIMEOUT', 'ENETUNREACH', 'EHOSTUNREACH', 'ECONNREFUSED', 'ECONNRESET'].indexOf(c) >= 0) tipo = 'rede';
    return { ok: false, tipo, mensagem: m };
  } finally {
    await sql.end({ timeout: 2 }).catch(() => {});
  }
}

/* ---------- gravação do .env ---------- */
function gravarEnv(url) {
  const fimLinha = os.EOL;
  let linhas = [];
  if (fs.existsSync(ARQ_ENV)) linhas = fs.readFileSync(ARQ_ENV, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
  let trocou = false;
  linhas = linhas.map(l => {
    if (/^\s*#?\s*(DATABASE_URL|SUPABASE_DB_URL)\s*=/.test(l)) { if (trocou) return null; trocou = true; return 'DATABASE_URL=' + url; }
    return l;
  }).filter(l => l !== null);
  if (!trocou) {
    while (linhas.length && linhas[linhas.length - 1] === '') linhas.pop();
    if (linhas.length) linhas.push('');
    linhas.push('# Banco de dados do SkillWay no Supabase (gravado por conectar-supabase.bat).', 'DATABASE_URL=' + url);
  }
  fs.writeFileSync(ARQ_ENV, linhas.join(fimLinha) + fimLinha, 'utf8');
}

const destinoDe = url => { try { const a = new URL(url); return a.hostname + ':' + (a.port || 5432); } catch (e) { return ''; } };

async function principal() {
  const projeto = lerProjeto();
  console.log('\n  SkillWay — conectar ao Supabase');
  console.log('  --------------------------------');
  if (projeto) console.log('  Projeto: ' + (projeto.nome || projeto.projeto) + '  (código ' + projeto.projeto + (projeto.regiao ? ', região ' + projeto.regiao : '') + ')');
  console.log('\n  Você vai precisar da senha do banco (Database password), a que foi definida ao criar');
  console.log('  o projeto. Não é a senha da sua conta do Supabase. Se não lembrar, redefina em:');
  console.log('  painel do Supabase > Project Settings > Database > Reset database password.\n');
  if (fs.existsSync(ARQ_ENV) && /^\s*DATABASE_URL\s*=\s*\S/m.test(fs.readFileSync(ARQ_ENV, 'utf8'))) {
    console.log('  Já existe uma DATABASE_URL no arquivo .env. Se continuar, ela será substituída.\n');
  }

  let colado = null;
  for (let tentativa = 1; tentativa <= 4; tentativa++) {
    let entrada;
    if (colado && !temSenha(colado)) entrada = await perguntar('  Senha do banco: ', true);
    else if (projeto) entrada = await perguntar('  Digite a senha do banco e tecle Enter (ela não aparece na tela).\n  Ou cole a string de conexão inteira copiada do botão Connect: ', true);
    else entrada = await perguntar('  Cole a string de conexão do Supabase (botão Connect > Session pooler) e tecle Enter: ', true);
    if (!entrada) { console.log('\n  Nada foi informado. Nenhuma alteração feita.\n'); return 1; }

    let opcoes;
    if (ehEndereco(entrada)) {
      colado = entrada;
      if (!temSenha(colado)) { console.log('  A string veio sem a senha (com [YOUR-PASSWORD]).'); tentativa--; continue; }
      opcoes = [{ nome: 'string informada', url: colado }];
    } else if (colado) {
      opcoes = [{ nome: 'string informada', url: comSenha(colado, entrada) }];
    } else if (projeto) {
      opcoes = candidatos(projeto, entrada);
    } else { console.log('  Isso não parece uma string de conexão (ela começa com postgresql://).'); continue; }

    let senhaErrada = false, ultimo = null;
    for (const o of opcoes) {
      process.stdout.write('  Testando ' + o.nome + '… ');
      const r = await testar(o.url);
      if (r.ok) {
        console.log('conectou.');
        gravarEnv(o.url);
        console.log('\n  Pronto! A conexão foi gravada no arquivo .env (' + destinoDe(o.url) + ', banco ' + r.banco + ').');
        console.log('  Agora abra o iniciar.bat: o SkillWay passa a gravar tudo no Supabase,');
        console.log('  nas tabelas do esquema "skillway" (Table Editor > schema skillway).\n');
        return 0;
      }
      console.log(r.tipo === 'senha' ? 'senha recusada.' : (r.tipo === 'projeto' ? 'o projeto não está neste endereço.' : (r.tipo === 'rede' ? 'sem resposta.' : 'falhou.')));
      ultimo = r;
      if (r.tipo === 'senha') { senhaErrada = true; break; }
    }
    if (senhaErrada) {
      console.log('\n  A senha do banco não confere. Tente de novo.');
      console.log(colado ? '' : '  (Se tiver certeza da senha, cole no lugar dela a string completa do botão Connect > Session pooler.)\n');
      continue;
    }
    console.log('\n  Não foi possível conectar' + (ultimo ? ': ' + ultimo.mensagem : '.'));
    if (ultimo && ultimo.tipo === 'rede') console.log('  Confira a internet deste computador e se o projeto não está pausado no painel do Supabase.');
    if (!colado) {
      console.log('  Vamos pelo caminho certeiro: no painel do Supabase, clique em Connect (no topo), escolha');
      console.log('  "Session pooler" e copie a string que começa com postgresql://\n');
      colado = '';
      const s = await perguntar('  Cole a string aqui e tecle Enter: ', true);
      if (!ehEndereco(s)) { console.log('\n  Isso não parece uma string de conexão. Nenhuma alteração feita.\n'); return 1; }
      colado = s;
      if (temSenha(colado)) {
        process.stdout.write('  Testando string informada… ');
        const r = await testar(colado);
        if (r.ok) { console.log('conectou.'); gravarEnv(colado); console.log('\n  Pronto! A conexão foi gravada no arquivo .env. Agora abra o iniciar.bat.\n'); return 0; }
        console.log('falhou: ' + r.mensagem + '\n');
      }
    } else console.log('');
  }
  console.log('  Não deu certo depois de algumas tentativas. Nenhuma alteração foi feita no .env.\n');
  return 1;
}

if (require.main === module) {
  principal().then(codigo => { rl.close(); process.exit(codigo); }, e => { console.error('\n  Erro inesperado:', e && e.message || e, '\n'); rl.close(); process.exit(1); });
} else {
  module.exports = { candidatos, comSenha, temSenha, testar, gravarEnv };
}
