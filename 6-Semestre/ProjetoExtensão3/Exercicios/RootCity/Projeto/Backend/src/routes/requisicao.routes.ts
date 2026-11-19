import { Router } from "express";

import { agendarPlantio, aguardarRetirada, alterarStatus, atualizarFotoPlantio, atualizarRequisicao, buscarRequisicoes, buscarRequisicoesPorCidade, buscarRequisicoesPorUsuario, buscarUrlComprovante, criarRequisicao, recusarRequisicao } from "../controllers/requisicao.controller.js";
import { verificarRole } from "../middlewares/auth.middlewares.js";
import { Role } from "../generated/prisma/enums.js";
import { uploadDocumentos } from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/",
  verificarRole([Role.ADMIN_LOCAL, Role.FUNCIONARIO, Role.GLOBAL, Role.CIDADAO]),
  uploadDocumentos.fields([
    { name: "fotoLocal", maxCount: 1 },
    { name: "comprovante", maxCount: 1 },
  ]),
   criarRequisicao
);

//Passa todos os roles, pois é preciso validar se usuário está alterando uma requisição criada por ele mesmo
router.put(
  "/:id",
  uploadDocumentos.fields([
    { name: "fotoLocal", maxCount: 1 },
    { name: "comprovante", maxCount: 1 },
  ]),
  verificarRole([Role.ADMIN_LOCAL, Role.FUNCIONARIO, Role.GLOBAL, Role.CIDADAO]),
  atualizarRequisicao
);

//Passa todos os roles, e verifica se caso o usuário seja cidadão, se ele é o dono da requisição 
router.put(
  "/fotoPlantio/:id",
  uploadDocumentos.fields([
    { name: "fotoPlantio", maxCount: 1 },
  ]),
  verificarRole([Role.ADMIN_LOCAL, Role.FUNCIONARIO, Role.GLOBAL, Role.CIDADAO]),
  atualizarFotoPlantio
);

router.get(
  '/',
  verificarRole([Role.ADMIN_LOCAL, Role.FUNCIONARIO, Role.GLOBAL]),
  buscarRequisicoes
)

router.get(
  "/cidade/:id",
  verificarRole([Role.GLOBAL]),
  buscarRequisicoesPorCidade
);

// Passamos todos os roles, para fazer uma busca pelo usuário logado.
router.get(
  "/usuario",
  verificarRole([Role.ADMIN_LOCAL, Role.FUNCIONARIO, Role.GLOBAL, Role.CIDADAO]),
  buscarRequisicoesPorUsuario
)

router.get(
  "/:id/comprovante",
  verificarRole([Role.ADMIN_LOCAL, Role.FUNCIONARIO, Role.GLOBAL]),
  buscarUrlComprovante
)

router.put(
  "/recusar/:id",
  verificarRole([Role.FUNCIONARIO, Role.ADMIN_LOCAL, Role.GLOBAL]),
  recusarRequisicao
)

router.put(
  "/agendar/:id",
  verificarRole([Role.FUNCIONARIO, Role.ADMIN_LOCAL, Role.GLOBAL]),
  agendarPlantio
)

router.put(
  "/retirada/:id",
  verificarRole([Role.FUNCIONARIO, Role.ADMIN_LOCAL, Role.GLOBAL]),
  aguardarRetirada
)

router.put(
  "/alterarStatus/:id",
  verificarRole([Role.FUNCIONARIO, Role.ADMIN_LOCAL, Role.GLOBAL]),
  alterarStatus
)

export default router;