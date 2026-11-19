import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { obterUrlPublica } from "./storage.service.js";

interface ListarPublicacoesParams {
  limit: number;
  cursorDate?: Date;
  cursorId?: string;
  cidadeId?: string;
  usuarioId?: string;
}

export async function listarPublicacoesService({
  limit,
  cursorDate,
  cursorId,
  cidadeId,
  usuarioId,
}: ListarPublicacoesParams) {
  const filtros: Prisma.PublicacaoWhereInput[] = [];

  // Filtra pela cidade vinculada à requisição.
  if (cidadeId !== undefined) {
    filtros.push({
      requisicao: {
        is: {
          cidadeId,
        },
      },
    });
  }

  // Filtra pelo criador da requisição.
  if (usuarioId !== undefined) {
    filtros.push({
      requisicao: {
        is: {
          criadoPorId: usuarioId,
        },
      },
    });
  }

  // Mantém a paginação dentro do conjunto filtrado.
  if (cursorDate !== undefined && cursorId !== undefined) {
    filtros.push({
      OR: [
        {
          criadoEm: {
            lt: cursorDate,
          },
        },
        {
          criadoEm: cursorDate,
          id: {
            lt: cursorId,
          },
        },
      ],
    });
  }

  const where: Prisma.PublicacaoWhereInput =
    filtros.length > 0
      ? { AND: filtros }
      : {};

  const items = await prisma.publicacao.findMany({
    where,

    orderBy: [
      { criadoEm: "desc" },
      { id: "desc" },
    ],

    take: limit + 1,

    select: {
      id: true,
      requisicaoId: true,
      titulo: true,
      descricao: true,
      criadoEm: true,

      requisicao: {
        select: {
          nomeBeneficiario: true,
          fotoPlantioUrl: true,
        },
      },
    },
  });

  // O registro extra indica se há mais resultados
  // para os mesmos filtros.
  const hasMore = items.length > limit;

  const publicacoes = items
    .slice(0, limit)
    .map((publicacao) => ({
      ...publicacao,

      requisicao: publicacao.requisicao
        ? {
          ...publicacao.requisicao,

          fotoPlantioUrl:
            publicacao.requisicao.fotoPlantioUrl
              ? obterUrlPublica(
                "public_box",
                publicacao.requisicao.fotoPlantioUrl,
              )
              : null,
        }
        : null,
    }));

  const ultima = publicacoes.at(-1);

  return {
    items: publicacoes,
    hasMore,

    nextCursor:
      hasMore && ultima
        ? {
          cursorDate: ultima.criadoEm.toISOString(),
          cursorId: ultima.id,
        }
        : null,
  };
}

export async function criarPublicacaoService(
  dados: {
    idRequisicao: string;
    titulo: string;
    descricao?: string;
  },
) {

  const publicacaoExistente = await prisma.publicacao.findUnique({
    where: { requisicaoId: dados.idRequisicao }
  })

  if (publicacaoExistente) {
    throw new Error('Publicação já realizada');
  }

  return await prisma.publicacao.create({
    data: {
      requisicaoId: dados.idRequisicao,
      titulo: dados.titulo,
      descricao: dados.descricao ?? null,
    },
  });
}

export async function buscarPublicacaoService(requisicaoId: string) {
  return await prisma.publicacao.findUnique({
    where: {
      requisicaoId: requisicaoId,
    },
  });
}