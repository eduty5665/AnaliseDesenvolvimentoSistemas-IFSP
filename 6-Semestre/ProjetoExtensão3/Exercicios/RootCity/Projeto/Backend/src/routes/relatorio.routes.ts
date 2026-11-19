import { ativarCidade, atualizarCidade, criarCidade, desativarCidade, listarCidades, listarCidadesAtivas, listarCidadesUsuario } from "../controllers/cidade.controller.js";
import { buscarDadosRelatorio } from "../controllers/relatorio.controller.js";
import { Role } from "../generated/prisma/enums.js";
import { verificarRole } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.get(
  "/", 
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL, Role.FUNCIONARIO]), 
  buscarDadosRelatorio
);

export default router;
