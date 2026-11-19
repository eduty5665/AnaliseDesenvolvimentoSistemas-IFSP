import { alterarStatusEndereco, atualizarEndereco, criarEndereco, criarEnderecoCidade, listarEnderecos, listarEnderecosCidade } from "../controllers/endereco.controller.js";
import { Role } from "../generated/prisma/enums.js";
import { verificarRole } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.get(
  "/",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL, Role.FUNCIONARIO]),
  listarEnderecos
);

router.get(
  "/cidade/:cidadeId",
  verificarRole([Role.GLOBAL]),
  listarEnderecosCidade
)

router.post(
  "/",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  criarEndereco
)

router.post(
  "/cidade/:cidadeId",
  verificarRole([Role.GLOBAL]),
  criarEnderecoCidade
)

router.put(
  "/:idEndereco",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  atualizarEndereco
)

router.put(
  "/cidade/:idEndereco",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  atualizarEndereco
)

router.put(
  "/status/:idEndereco",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  alterarStatusEndereco
)

export default router;
