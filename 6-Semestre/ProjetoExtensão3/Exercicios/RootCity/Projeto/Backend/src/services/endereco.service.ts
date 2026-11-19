import type { Request } from "express";
import { Role } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

export async function listarEnderecoService(usuarioLogado: { role: Role, cidadeId: string | null }) {

    if (usuarioLogado.role === Role.GLOBAL) {
        return await prisma.endereco.findMany({
            orderBy: {
                criadoEm: 'desc'
            },
        })
    }

    if (usuarioLogado.role === Role.ADMIN_LOCAL) {
        const cidadeId = usuarioLogado.cidadeId || ""
        return await prisma.endereco.findMany({
            where: { 
                cidadeId,
                ativo: true,
            },
            orderBy: {
                criadoEm: 'desc'
            },
        })
    }

    return [];
}

export async function listarEnderecoCidadeService(usuarioLogado: { role: Role }, cidadeId: string) {
    if (usuarioLogado.role !== Role.GLOBAL) {
        throw new Error("Ação não permitida");
    }

    const cidadePreenchida = cidadeId !== "N";

    return await prisma.endereco.findMany({
        where: {
            ...(cidadePreenchida && { cidadeId, ativo: true}),
        },
        orderBy: {
            criadoEm: 'desc'
        },
    });
}

export async function criarEnderecoService(usuarioLogado: Request['usuario'], dados: { rua: string, numero: string, bairro: string, cep?: string | undefined, pontoReferencia?: string | undefined }) {
    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    if (!usuarioLogado.cidadeId) {
        throw new Error("Ação não permitida");
    }

    return await prisma.endereco.create({
        data: {
            cidadeId: usuarioLogado.cidadeId,
            rua: dados.rua,
            numero: dados.numero,
            bairro: dados.bairro,
            cep: dados.cep || '',
            pontoReferencia: dados.pontoReferencia || null,
        }
    })
}

export async function criarEnderecoCidadeService(cidadeId: string, dados: { rua: string, numero: string, bairro: string, cep?: string | undefined, pontoReferencia?: string | undefined }) {
    if (!cidadeId) {
        throw new Error("ID da cidade não informado");
    }

    return await prisma.endereco.create({
        data: {
            cidadeId: cidadeId,
            rua: dados.rua,
            numero: dados.numero,
            bairro: dados.bairro,
            cep: dados.cep || '',
            pontoReferencia: dados.pontoReferencia || null,
        }
    })
}

export async function atualizarEnderecoService(usuarioLogado: Request['usuario'], idEndereco: string, dados: { rua: string, numero: string, bairro: string, cep?: string | undefined, pontoReferencia?: string | undefined }) {
    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    if (!usuarioLogado.cidadeId) {
        throw new Error("Ação não permitida");
    }

    return await prisma.endereco.update({
        where: {
            id: idEndereco,
            cidadeId: usuarioLogado.cidadeId
        },
        data: {
            rua: dados.rua,
            numero: dados.numero,
            bairro: dados.bairro,
            cep: dados.cep || '',
            pontoReferencia: dados.pontoReferencia || null,
        }
    })
}

export async function atualizarEnderecoCidadeService(usuarioLogado: Request['usuario'], idEndereco: string, dados: { idCidade?: string | undefined, rua: string, numero: string, bairro: string, cep?: string | undefined, pontoReferencia?: string | undefined }) {
    if (!usuarioLogado) {
        throw new Error("Usuário não autenticado");
    }

    if (!dados.idCidade) {
        throw new Error("ID da cidade não informado");
    }

    return await prisma.endereco.update({
        where: {
            id: idEndereco,
            cidadeId: dados.idCidade
        },
        data: {
            rua: dados.rua,
            numero: dados.numero,
            bairro: dados.bairro,
            cep: dados.cep || '',
            pontoReferencia: dados.pontoReferencia || null,
        }
    })
}

export async function alterarStatusEnderecoService(usuarioLogado: Request['usuario'], id: string) {

  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  const enderecoExistente = await prisma.endereco.findUnique({ where: { id } });

  if (!enderecoExistente) {
    throw new Error("Endereço não encontrado");
  }

  if ((usuarioLogado.cidadeId !== enderecoExistente.cidadeId) && usuarioLogado.role !== Role.GLOBAL){
    throw new Error("Ação não permitida");
  }

  return await prisma.endereco.update({
    where: { id },
    data: {
      ativo: !enderecoExistente.ativo,
    }
  });
}