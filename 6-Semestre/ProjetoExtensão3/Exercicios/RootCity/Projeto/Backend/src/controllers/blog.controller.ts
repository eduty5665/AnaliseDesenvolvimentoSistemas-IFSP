import type { Request, Response } from "express";
import { publicacaoSchema } from "../schemas/publicacao.schema.js";
import { buscarPublicacaoService, criarPublicacaoService, listarPublicacoesService } from "../services/blog.service.js";

export async function criarPublicacao(req: Request, res: Response) {
  const validacao = publicacaoSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten()
    });
  }

  try {
    const novaPublicacao = await criarPublicacaoService(validacao.data);
    return res.status(201).json(novaPublicacao);
  } catch (error: any) {
    console.error("ERRO AO CRIAR PUBLICAÇÂO:", error);
    return res.status(500).json({ message: error.message || "Erro ao criar publicação" });
  }
}

export async function listarPublicacoes(
  req: Request,
  res: Response,
) {
  const {
    limit: limitQuery,
    cursorDate: cursorDateQuery,
    cursorId: cursorIdQuery,
    cidadeId: cidadeIdQuery,
    minhasPublicacoes: minhasPublicacoesQuery,
  } = req.query;

  if (
    limitQuery !== undefined &&
    typeof limitQuery !== "string"
  ) {
    return res.status(400).json({
      message: "O limite deve ser um inteiro entre 1 e 50.",
    });
  }

  const limit =
    limitQuery === undefined ? 10 : Number(limitQuery);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    return res.status(400).json({
      message: "O limite deve ser um inteiro entre 1 e 50.",
    });
  }

  // Validação dos IDs usados no banco.
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  let cidadeId: string | undefined;

  if (cidadeIdQuery !== undefined) {
    if (
      typeof cidadeIdQuery !== "string" ||
      !uuidRegex.test(cidadeIdQuery)
    ) {
      return res.status(400).json({
        message: "O ID da cidade é inválido.",
      });
    }

    cidadeId = cidadeIdQuery;
  }

  if (
    minhasPublicacoesQuery !== undefined &&
    minhasPublicacoesQuery !== "true" &&
    minhasPublicacoesQuery !== "false"
  ) {
    return res.status(400).json({
      message: "minhasPublicacoes deve ser true ou false.",
    });
  }

  const minhasPublicacoes =
    minhasPublicacoesQuery === "true";

  let usuarioId: string | undefined;

  if (minhasPublicacoes) {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Entre na sua conta para ver suas publicações.",
      });
    }

    usuarioId = req.usuario.id;
  }

  // Data e ID precisam ser enviados juntos.
  const temData = cursorDateQuery !== undefined;
  const temId = cursorIdQuery !== undefined;

  if (temData !== temId) {
    return res.status(400).json({
      message: "Informe cursorDate e cursorId juntos.",
    });
  }

  let cursorDate: Date | undefined;
  let cursorId: string | undefined;

  if (temData && temId) {
    if (
      typeof cursorDateQuery !== "string" ||
      typeof cursorIdQuery !== "string" ||
      !uuidRegex.test(cursorIdQuery)
    ) {
      return res.status(400).json({
        message: "Cursor inválido.",
      });
    }

    cursorDate = new Date(cursorDateQuery);

    if (Number.isNaN(cursorDate.getTime())) {
      return res.status(400).json({
        message: "A data do cursor é inválida.",
      });
    }

    cursorId = cursorIdQuery;
  }

  try {
    const resultado = await listarPublicacoesService({
      limit,
      ...(cursorDate !== undefined ? { cursorDate } : {}),
      ...(cursorId !== undefined ? { cursorId } : {}),
      ...(cidadeId !== undefined ? { cidadeId } : {}),
      ...(usuarioId !== undefined ? { usuarioId } : {}),
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao listar publicações:", error);

    return res.status(500).json({
      message: "Não foi possível listar as publicações.",
    });
  }
}

export async function buscarPublicacao(req: Request, res: Response) {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const publicacao = await buscarPublicacaoService(id);
    return res.status(200).json(publicacao);
  } catch (error: any) {
    console.error("ERRO AO LISTAR PUBLICAÇÂO:", error);
    return res.status(500).json({ message: "Erro ao listar publicação" });
  }
}