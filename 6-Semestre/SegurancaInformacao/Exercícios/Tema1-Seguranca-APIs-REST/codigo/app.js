import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { SignJWT, jwtVerify } from 'jose';

const app = express();
const SEGREDO = new TextEncoder().encode(process.env.JWT_SECRET);
const EMISSOR = 'https://auth.exemplo.com';
const AUDIENCIA = 'api-pedidos';

// "Banco de dados" em memoria, so para a demonstracao
const usuarios = [
  { id: 'u1', email: 'ana@exemplo.com', senha: 'senha-da-ana', papel: 'cliente' },
  { id: 'u2', email: 'beto@exemplo.com', senha: 'senha-do-beto', papel: 'cliente' },
];
const pedidos = [
  { id: '1001', usuarioId: 'u1', produto: 'Teclado', quantidade: 1, custoInterno: 80 },
  { id: '1002', usuarioId: 'u2', produto: 'Monitor', quantidade: 2, custoInterno: 600 },
];

// 1. Cabecalhos de seguranca e limite de tamanho do corpo
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// 2. CORS com lista fixa de origens
const ORIGENS_PERMITIDAS = ['https://loja.exemplo.com'];
app.use(cors({
  origin: ORIGENS_PERMITIDAS,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  maxAge: 600,
}));

// 3. Rate limiting: geral e mais rigido no login
const limiteGeral = rateLimit({
  windowMs: 60_000, limit: 100,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { erro: 'limite_excedido' },
});
const limiteLogin = rateLimit({
  windowMs: 15 * 60_000, limit: 5,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { erro: 'muitas_tentativas' },
});
app.use(limiteGeral);

// 4. Autenticacao: valida assinatura, algoritmo, emissor, audiencia e expiracao
async function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) return res.status(401).json({ erro: 'nao_autenticado' });
  try {
    const { payload } = await jwtVerify(token, SEGREDO, {
      algorithms: ['HS256'], issuer: EMISSOR, audience: AUDIENCIA,
    });
    req.usuario = { id: payload.sub, papel: payload.papel };
    next();
  } catch {
    res.status(401).json({ erro: 'token_invalido' });
  }
}

// 5. Autorizacao por funcao
const exigirPapel = (papel) => (req, res, next) =>
  req.usuario.papel === papel ? next() : res.status(403).json({ erro: 'proibido' });

// 6. Validacao de payload por schema (campos desconhecidos sao rejeitados)
const validar = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) {
    return res.status(400).json({
      erro: 'payload_invalido',
      campos: r.error.issues.map((i) => i.path.join('.') || '(raiz)'),
    });
  }
  req.dados = r.data;
  next();
};
const LoginSchema = z.strictObject({
  email: z.email().max(254),
  senha: z.string().min(8).max(128),
});
const NovoPedidoSchema = z.strictObject({
  produto: z.string().trim().min(1).max(80),
  quantidade: z.number().int().min(1).max(100),
});

// 7. Filtro de saida: so os campos que o cliente pode ver
const paraResposta = ({ id, produto, quantidade }) => ({ id, produto, quantidade });

app.post('/login', limiteLogin, validar(LoginSchema), async (req, res) => {
  const u = usuarios.find((x) => x.email === req.dados.email && x.senha === req.dados.senha);
  if (!u) return res.status(401).json({ erro: 'credenciais_invalidas' });
  const token = await new SignJWT({ papel: u.papel })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(u.id).setIssuer(EMISSOR).setAudience(AUDIENCIA)
    .setIssuedAt().setExpirationTime('15m')
    .sign(SEGREDO);
  res.json({ accessToken: token, expiraEm: 900 });
});

// VULNERAVEL (BOLA): busca so pelo id e devolve o registro inteiro
app.get('/inseguro/pedidos/:id', autenticar, (req, res) => {
  const pedido = pedidos.find((p) => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'nao_encontrado' });
  res.json(pedido);
});

// CORRIGIDO: busca pelo id E pelo dono; devolve so os campos permitidos
app.get('/pedidos/:id', autenticar, (req, res) => {
  const pedido = pedidos.find((p) => p.id === req.params.id && p.usuarioId === req.usuario.id);
  if (!pedido) return res.status(404).json({ erro: 'nao_encontrado' });
  res.set('Cache-Control', 'no-store').json(paraResposta(pedido));
});

app.post('/pedidos', autenticar, validar(NovoPedidoSchema), (req, res) => {
  const pedido = { id: String(1001 + pedidos.length), usuarioId: req.usuario.id, ...req.dados, custoInterno: 0 };
  pedidos.push(pedido);
  res.status(201).json(paraResposta(pedido));
});

app.delete('/admin/pedidos/:id', autenticar, exigirPapel('admin'), (req, res) => {
  res.status(204).end();
});

// 8. Erros: detalhe no log, mensagem generica na resposta
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ erro: 'corpo_grande_demais' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'json_invalido' });
  console.error(err);
  res.status(500).json({ erro: 'erro_interno' });
});

export default app;
if (process.env.PORTA) app.listen(Number(process.env.PORTA));
