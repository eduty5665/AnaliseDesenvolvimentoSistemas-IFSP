import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export async function listarCidadesService(usuario: {role: Role; cidadeId: string | null}) {

  const includeCount = {
    _count: {
      select: {
        usuarios: true,
        requisicoes: true,
        arvores: true,
      },
    },
  };

  if (usuario.role === Role.GLOBAL) {
    return await prisma.cidade.findMany({
      orderBy: {
        criadoEm: "desc"
      },
      include: includeCount,
    });
  }

  return [];
}

export async function listarCidadesUsuarioService(usuario: {role: Role; cidadeId: string | null}) {

  const includeCount = {
    _count: {
      select: {
        usuarios: true,
        requisicoes: true,
        arvores: true,
      },
    },
  };

  
  if (usuario.role === Role.GLOBAL) {
    return await prisma.cidade.findMany({
      orderBy: {
        criadoEm: "desc"
      },
      include: includeCount,
    });
  }
  
  if (!usuario.cidadeId) {
    return [];
  }
  
  return await prisma.cidade.findMany({
    where: {
      id: usuario.cidadeId
    },
    include: includeCount,
  });
}

//método usado por usuários comuns
export async function listarCidadesAtivasService(){
  return await prisma.cidade.findMany({
    where: {
      ativa: true
    },
    orderBy: {
      criadoEm: "desc"
    }
  })
}

export async function criarCidadeService(dados: { nome: string; uf: string; permiteEntrega: boolean}) {

  return await prisma.cidade.create({
    data: {
      nome: dados.nome,
      uf: dados.uf,
      permiteEntrega: dados.permiteEntrega,
      ativa: true,
    }
  });
}

export async function atualizarCidadeService(id: string, dados: { nome: string; uf: string; permiteEntrega: boolean}) {
  const cidadeExistente = await prisma.cidade.findUnique({ where: { id } });
  if (!cidadeExistente) {
    throw new Error("Cidade não encontrada");
  }

  return await prisma.cidade.update({
    where: { id },
    data: {
      nome: dados.nome,
      uf: dados.uf,
      permiteEntrega: dados.permiteEntrega,
    }
  });
}

export async function desativarCidadeService(id: string){
  const cidadeExistente = await prisma.cidade.findUnique({where: {id}});
  if(!cidadeExistente){
    throw new Error("Cidade não encontrada");
  }

  return await prisma.cidade.update({
    where: {id},
    data: {
      ativa: false,
    }
  });
}

export async function ativarCidadeService(id: string){
  const cidadeExistente = await prisma.cidade.findUnique({where: {id}});
  if(!cidadeExistente){
    throw new Error("Cidade não encontrada");
  }

  return await prisma.cidade.update({
    where: {id},
    data: {
      ativa: true,
    }
  });
}