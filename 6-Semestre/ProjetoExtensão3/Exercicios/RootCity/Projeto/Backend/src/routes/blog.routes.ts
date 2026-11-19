import { Router } from "express";
import { autenticarOpcional, verificarRole } from "../middlewares/auth.middlewares.js";
import { Role } from "../generated/prisma/enums.js";
import { buscarPublicacao, criarPublicacao, listarPublicacoes } from "../controllers/blog.controller.js";
const router = Router();

const verificarUsuario = verificarRole([
  Role.CIDADAO,
  Role.FUNCIONARIO,
  Role.ADMIN_LOCAL,
  Role.GLOBAL,
]);

//Passa por todos para verificar se é cidadão comum e req é dele mesmo 
router.post(
  "/", 
  verificarUsuario,
  criarPublicacao
);

// Listar publicações: aceita visitantes e usuários logados.
router.get(
  "/",
  autenticarOpcional,
  (req, res, next) => {
    if (req.query.minhasPublicacoes === "true") {
      return verificarUsuario(req, res, next);
    }

    return next();
  },
  listarPublicacoes
);


router.get(
  "/buscarReq/:id",
  verificarUsuario,
  buscarPublicacao
);


export default router;