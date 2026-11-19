import { Router } from "express";
import { 
  listarArvores, 
  criarArvore, 
  atualizarArvore, 
  excluirArvore, 
  listarArvoresCidade
} from "../controllers/arvore.controller.js";
import { verificarRole } from "../middlewares/auth.middlewares.js";
import { Role } from "../generated/prisma/enums.js";
import { uploadImagem } from "../middlewares/upload.middleware.js";

const router = Router();

router.get(
  "/",
  verificarRole([Role.GLOBAL, Role.ADMIN_LOCAL, Role.FUNCIONARIO]),
  listarArvores
);

//Busca as árvores com base no id da cidade
router.get(
  "/cidade/:id",
  listarArvoresCidade
);

router.post(
  "/", 
  verificarRole([Role.FUNCIONARIO, Role.ADMIN_LOCAL, Role.GLOBAL]), 
  uploadImagem.single("image"),
  criarArvore
);

router.put(
  "/:id", 
  verificarRole([Role.FUNCIONARIO, Role.ADMIN_LOCAL, Role.GLOBAL]), 
  uploadImagem.single("image"),
  atualizarArvore
);

router.delete(
  "/:id", 
  verificarRole([Role.ADMIN_LOCAL, Role.GLOBAL]), // Excluir restrito apenas a admins
  excluirArvore
);

export default router;