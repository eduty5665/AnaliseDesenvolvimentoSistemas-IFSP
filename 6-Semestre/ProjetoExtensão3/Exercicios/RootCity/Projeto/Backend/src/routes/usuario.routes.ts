import { ativarUsuario, atualizarUsuario, desativarUsuario, listarRoles, listarUsuarios, listarUsuariosCidade } from "../controllers/usuario.controller.js";
import { Role } from "../generated/prisma/enums.js";
import { verificarRole } from "../middlewares/auth.middlewares.js";
import { Router } from "express";

const router = Router();

router.get(
  "/roles", 
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  listarRoles
);

router.put(
  "/:id",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  atualizarUsuario
)

router.get(
  "/",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  listarUsuarios
)

router.get(
  "/cidade/:cidadeId/:role",
  verificarRole([Role.GLOBAL]),
  listarUsuariosCidade
)

router.put(
  "/ativar/:id",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  ativarUsuario
)

router.put(
  "/desativar/:id",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL]),
  desativarUsuario
)

export default router;
