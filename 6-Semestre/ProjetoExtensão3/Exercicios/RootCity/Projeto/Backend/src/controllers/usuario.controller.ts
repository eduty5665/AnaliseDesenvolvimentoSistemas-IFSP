import type { Request, Response } from "express";
import { ativarUsuarioService, atualizarUsuarioService, desativarUsuarioService, listarRolesService, listarUsuariosCidadeService, listarUsuariosService } from "../services/usuario.service.js";
import { usuarioSchema } from "../schemas/usuario.schema.js";
import { Role } from "../generated/prisma/enums.js";

export async function listarRoles(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      });
    }
    const roles = await listarRolesService(req.usuario);
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar tipos" });
  }
}

export async function listarUsuarios(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }
    const usuarios = await listarUsuariosService(req.usuario);
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar usuários " })
  }
}

export async function listarUsuariosCidade(req: Request, res: Response) {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }
    const { cidadeId, role } = req.params;

    if (typeof cidadeId !== "string") {
      return res.status(400).json({ message: "ID da cidade inválido" });
    }

    if (!role) {
      return res.status(400).json({
        message: "Tipo de usuário não informado",
      });
    }

    if (!Object.values(Role).includes(role as Role)) {
      return res.status(400).json({
        message: "Tipo de usuário inválido",
      });
    }

    const roleFiltro = role as Role;

    const usuarios = await listarUsuariosCidadeService(req.usuario, cidadeId, roleFiltro);
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar usuários " })
  }
}

export async function atualizarUsuario(req: Request, res: Response) {
  const { id } = req.params;
  const validacao = usuarioSchema.safeParse(req.body);

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
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autenticado."
      })
    }
    const usuario = await atualizarUsuarioService(req.usuario, id, validacao.data);
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
}

export async function ativarUsuario(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const cidadeAtivada = await ativarUsuarioService(req.usuario, id);
    return res.status(200).json(cidadeAtivada)
  } catch (error) {
    return res.status(500).json({ message: "Erro ao ativar usuário" })
  }
}

export async function desativarUsuario(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID inválido" });
  }

  try {
    const cidadeDesativada = await desativarUsuarioService(req.usuario, id);
    return res.status(200).json(cidadeDesativada)
  } catch (error) {
    return res.status(500).json({ message: `Erro ao desativar usuário, ${error}` })
  }
}