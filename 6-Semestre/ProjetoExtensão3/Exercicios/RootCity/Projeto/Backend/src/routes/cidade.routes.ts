import { ativarCidade, atualizarCidade, criarCidade, desativarCidade, listarCidades, listarCidadesAtivas, listarCidadesUsuario } from "../controllers/cidade.controller.js";
import { Role } from "../generated/prisma/enums.js";
import { verificarRole } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.get(
  "/", 
  verificarRole([Role.GLOBAL]), 
  listarCidades
);

router.get(
  "/usuario", 
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]), 
  listarCidadesUsuario
);

router.get(
  "/ativas", 
  listarCidadesAtivas
);

router.post(
  "/", 
  verificarRole([Role.GLOBAL]),  
  criarCidade
);

router.put(
  "/:id",
  verificarRole([Role.GLOBAL]),
  atualizarCidade
)

router.put(
  "/ativar/:id",
  verificarRole([Role.GLOBAL]),
  ativarCidade
);

router.put(
  "/desativar/:id",
  verificarRole([Role.GLOBAL]),
  desativarCidade
);

export default router;
