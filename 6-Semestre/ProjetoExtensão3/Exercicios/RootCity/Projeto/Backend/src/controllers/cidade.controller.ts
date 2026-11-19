import type { Request, Response } from "express";
import { ativarCidadeService, atualizarCidadeService, criarCidadeService, desativarCidadeService, listarCidadesAtivasService, listarCidadesService, listarCidadesUsuarioService } from "../services/cidade.service.js";
import { cidadeSchema } from "../schemas/cidade.schema.js";

export async function listarCidades(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      });
    }
    const cidades = await listarCidadesService(req.usuario);
    return res.status(200).json(cidades);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar cidades" });
  }
}

export async function listarCidadesUsuario(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      });
    }
    const cidades = await listarCidadesUsuarioService(req.usuario);
    return res.status(200).json(cidades);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar cidades" });
  }
}

export async function listarCidadesAtivas(req: Request, res: Response) {
  try {
    const cidades = await listarCidadesAtivasService();
    return res.status(200).json(cidades);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar cidades" });
  }
}

export async function criarCidade(req: Request, res: Response) {
  const validacao = cidadeSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten()
    });
  }

  try {
    const novaCidade = await criarCidadeService(validacao.data);
    return res.status(201).json(novaCidade);
  } catch (error: any) {
    console.error("ERRO AO CRIAR ÁRVORE:", error);
    return res.status(500).json({ message: error.message || "Erro ao criar árvore" });
  }
}

export async function atualizarCidade(req: Request, res: Response) {
  const { id } = req.params;
  const validacao = cidadeSchema.safeParse(req.body);

  if (!validacao.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten()
    });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const cidadeAtualizada = await atualizarCidadeService(id, validacao.data);
    return res.status(200).json(cidadeAtualizada);
  } catch (error: any) {
    console.error("ERRO AO ATUALIZAR CIDADE:", error);
    return res.status(500).json({ message: error.message || "Erro ao atualizar cidade" });
  }
}

export async function ativarCidade(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const cidadeAtivada = await ativarCidadeService(id);
    return res.status(200).json(cidadeAtivada)
  } catch (error) {
    return res.status(500).json({ message: "Erro ao ativar cidade" })
  }
}

export async function desativarCidade(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const cidadeDesativada = await desativarCidadeService(id);
    return res.status(200).json(cidadeDesativada)
  } catch (error) {
    return res.status(500).json({ message: "Erro ao desativar cidade" })
  }
}