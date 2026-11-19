import type { Request } from "express";
import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export async function listarRolesService(usuario: { role: Role }) {
  if (usuario.role === Role.GLOBAL) {
    return Object.values(Role);
  }

  if (usuario.role === Role.ADMIN_LOCAL) {
    return [Role.FUNCIONARIO];
  }

  return [];
}

export async function listarUsuariosService(usuarioLogado: { role: Role, cidadeId: string | null }) {

  const include = {
    cidade: {
      select: {
        id: true,
        nome: true,
        uf: true,
      },
    },
  };

  if (usuarioLogado.role === Role.GLOBAL) {
    return await prisma.usuario.findMany({
      orderBy: {
        criadoEm: 'desc'
      },
      include,
    })
  }

  if (usuarioLogado.role === Role.ADMIN_LOCAL) {
    const cidadeId = usuarioLogado.cidadeId
    return await prisma.usuario.findMany({
      where: { cidadeId },
      orderBy: {
        criadoEm: 'desc'
      },
      include,
    })
  }

  return [];
}

export async function listarUsuariosCidadeService(usuarioLogado: { role: Role }, cidadeId: string, roleFiltro: Role) {
  if (usuarioLogado.role !== Role.GLOBAL) {
    throw new Error("Ação não permitida");
  }

  const cidadePreenchida = cidadeId !== "N";

  const rolesPermitidos: Role[] = cidadePreenchida
    ? [Role.FUNCIONARIO, Role.ADMIN_LOCAL]
    : [Role.GLOBAL, Role.CIDADAO];

  if (!rolesPermitidos.includes(roleFiltro)) {
    return [];
  }

  return await prisma.usuario.findMany({
    where: {
      ...(cidadePreenchida && { cidadeId }),
      role: roleFiltro,
    },
    orderBy: {
      criadoEm: 'desc'
    },
    include: {
      cidade: {
        select: {
          id: true,
          nome: true,
          uf: true,
        },
      },
    },
  });
}

export async function atualizarUsuarioService(usuarioLogado: Request['usuario'], id: string, dados: { nome: string, email: string, role: Role, telefone?: string, cidadeId?: string }) {
  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  if (usuarioLogado.role !== Role.GLOBAL && dados.role !== Role.FUNCIONARIO) {
    throw new Error("Ação não permitida");
  }

  if (usuarioLogado.role === Role.ADMIN_LOCAL && usuarioLogado.cidadeId !== dados.cidadeId) {
    throw new Error("Cidade inválida");
  }

  return await prisma.usuario.update({
    where: { id },
    data: {
      nome: dados.nome,
      email: dados.email,
      role: dados.role,
      telefone: dados.telefone || '',
      cidadeId: dados.cidadeId || null,
    }
  })
}

export async function desativarUsuarioService(usuarioLogado: Request['usuario'], id: string) {

  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });

  if (!usuarioExistente) {
    throw new Error("Usuário não encontrado");
  }

  if (usuarioLogado.role !== Role.GLOBAL && (usuarioExistente.cidadeId !== usuarioLogado.cidadeId)) {
    throw new Error("Ação não permitida");
  }

  return await prisma.usuario.update({
    where: { id },
    data: {
      ativo: false,
    }
  });
}

export async function ativarUsuarioService(usuarioLogado: Request['usuario'], id: string) {

  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });

  if (!usuarioExistente) {
    throw new Error("Usário não encontrado");
  }

  if (usuarioLogado.role !== Role.GLOBAL && (usuarioExistente.cidadeId !== usuarioLogado.cidadeId)) {
    throw new Error("Ação não permitida");
  }

  return await prisma.usuario.update({
    where: { id },
    data: {
      ativo: true,
    }
  });
}