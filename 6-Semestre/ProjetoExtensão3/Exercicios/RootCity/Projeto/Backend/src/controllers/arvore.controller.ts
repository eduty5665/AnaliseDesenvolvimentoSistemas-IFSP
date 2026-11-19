import type { Request, Response } from "express";
import { arvoreSchema } from "../schemas/arvore.schema.js";
import {
  listarArvoresService,
  criarArvoreService,
  atualizarArvoreService,
  excluirArvoreService,
  listarArvoresCidadeService
} from "../services/arvore.service.js";

export async function listarArvores(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      });
    }
    const arvores = await listarArvoresService(req.usuario);
    return res.status(200).json(arvores);
  } catch (error: any) {
    console.error("ERRO AO LISTAR ÁRVORES:", error);
    return res.status(500).json({ message: "Erro ao listar árvores" });
  }
}

export async function listarArvoresCidade(req: Request, res: Response) {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const arvores = await listarArvoresCidadeService(id);
    return res.status(200).json(arvores);
  } catch (error: any) {
    console.error("ERRO AO LISTAR ÁRVORES:", error);
    return res.status(500).json({ message: "Erro ao listar árvores" });
  }
}

export async function criarArvore(req: Request, res: Response) {

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autenticado",
    });
  }

  const validacao = arvoreSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten()
    });
  }

  try {
    const novaArvore = await criarArvoreService(req.usuario, validacao.data, req.file);
    return res.status(201).json(novaArvore);
  } catch (error: any) {
    console.error("ERRO AO CRIAR ÁRVORE:", error);
    return res.status(500).json({ message: error.message || "Erro ao criar árvore" });
  }
}

export async function atualizarArvore(req: Request, res: Response) {
  const { id } = req.params;
  const validacao = arvoreSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten()
    });
  }

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autenticado."
    });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const arvoreAtualizada = await atualizarArvoreService(id, req.usuario, validacao.data, req.file);
    return res.status(200).json(arvoreAtualizada);
  } catch (error: any) {
    console.error("ERRO AO ATUALIZAR ÁRVORE:", error);
    return res.status(500).json({ message: error.message || "Erro ao atualizar árvore" });
  }
}

export async function excluirArvore(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autenticado."
    });
  }

  try {
    await excluirArvoreService(id, req.usuario);
    return res.status(200).json({ message: "Árvore excluída com sucesso" });
  } catch (error: any) {
    console.error("ERRO AO EXCLUIR ÁRVORE:", error);
    return res.status(500).json({ message: error.message || "Erro ao excluir árvore" });
  }
}