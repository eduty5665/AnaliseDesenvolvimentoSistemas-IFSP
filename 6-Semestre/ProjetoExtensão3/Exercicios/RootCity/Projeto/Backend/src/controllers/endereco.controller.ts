import type { Request, Response } from "express";
import { Role } from "../generated/prisma/enums.js";
import { enderecoSchema } from "../schemas/endereco.schema.js";
import { alterarStatusEnderecoService, atualizarEnderecoCidadeService, atualizarEnderecoService, criarEnderecoCidadeService, criarEnderecoService, listarEnderecoCidadeService, listarEnderecoService } from "../services/endereco.service.js";

export async function listarEnderecos(req: Request, res: Response) {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                message: "Usuário não autencticado"
            });
        }
        const enderecos = await listarEnderecoService(req.usuario);
        return res.status(200).json(enderecos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao listar endereços " })
    }
}

export async function listarEnderecosCidade(req: Request, res: Response) {
    try {
        if (!req.usuario) {
            return res.status(401).json({
                message: "Usuário não autencticado"
            });
        }

        const { cidadeId } = req.params;

        if (typeof cidadeId !== "string") {
            return res.status(400).json({ message: "ID da cidade inválido" });
        }

        const enderecos = await listarEnderecoCidadeService(req.usuario, cidadeId);

        return res.status(200).json(enderecos);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao listar endereços " })
    }
}

export async function criarEndereco(req: Request, res: Response) {

    const validacao = enderecoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: validacao.error.flatten()
        });
    }

    try {
        if (!req.usuario) {
            return res.status(401).json({
                message: "Usuário não autenticado."
            })
        }
        const endereco = await criarEnderecoService(req.usuario, validacao.data);
        return res.status(200).json(endereco);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar endereço" });
    }
}

export async function criarEnderecoCidade(req: Request, res: Response) {
    const { cidadeId } = req.params;
    const validacao = enderecoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: validacao.error.flatten()
        });
    }

    if (typeof cidadeId !== "string") {
        return res.status(400).json({ message: "ID inválido" });
    }

    try {
        if (!req.usuario) {
            return res.status(401).json({
                message: "Usuário não autenticado."
            })
        }
        const endereco = await criarEnderecoCidadeService(cidadeId, validacao.data);
        return res.status(200).json(endereco);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar endereço" });
    }
}

export async function atualizarEndereco(req: Request, res: Response) {
    const validacao = enderecoSchema.safeParse(req.body);
    const { idEndereco } = req.params;

    if (typeof idEndereco !== 'string') {
        return res.status(400).json({ message: "ID inválido" });
    }

    if (!validacao.success) {
        return res.status(400).json({
            message: "Dados inválidos",
            errors: validacao.error.flatten()
        });
    }

    try {
        if (!req.usuario) {
            return res.status(401).json({
                message: "Usuário não autenticado."
            })
        }

        if(req.usuario.role === Role.GLOBAL){
            const endereco = await atualizarEnderecoCidadeService(req.usuario, idEndereco, validacao.data);
            return res.status(200).json(endereco);
        }
        const endereco = await atualizarEnderecoService(req.usuario, idEndereco, validacao.data);
        return res.status(200).json(endereco);
    } catch (error) {
        return res.status(500).json({ message: `Erro ao atualizar endereço, ${error}` });
    }
}

export async function alterarStatusEndereco(req: Request, res: Response) {
  const { idEndereco } = req.params;

  if (typeof idEndereco !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const enderecoAtivado = await alterarStatusEnderecoService(req.usuario, idEndereco);
    return res.status(200).json(enderecoAtivado)
  } catch (error) {
    return res.status(500).json({ message: "Erro ao ativar cidade" })
  }
}