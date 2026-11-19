import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import router from './routes/auth.routes.js';
import arvoreRouter from './routes/arvore.routes.js';
import cidadeRouter from './routes/cidade.routes.js';
import usuarioRouter from './routes/usuario.routes.js';
import requisicaoRouter from './routes/requisicao.routes.js';
import blogRouter from './routes/blog.routes.js';
import relatorioRouter from './routes/relatorio.routes.js';
import enderecoRouter from './routes/endereco.routes.js';
import { tratarErroUpload } from './middlewares/upload-error.middleware.js';


const app = express();

app.use(helmet());

app.use(cors({
  origin: 'http://localhost:5173', //URL VITE
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", router);
app.use("/api/arvores", arvoreRouter);
app.use("/api/cidades", cidadeRouter);
app.use("/api/usuario", usuarioRouter);
app.use("/api/requisicao", requisicaoRouter);
app.use("/api/blog", blogRouter);
app.use("/api/relatorio", relatorioRouter);
app.use("/api/endereco", enderecoRouter);

app.use(tratarErroUpload);

export default app;
