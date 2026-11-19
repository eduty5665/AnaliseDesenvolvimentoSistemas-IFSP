import {
  Role,
  StatusRequisicao,
  TipoAtendimento,
  Prisma,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

export const dadosRelatorioService = async (
  usuarioLogado: {
    id: string;
    cidadeId: string | null;
    role: Role;
  },
  dataInicial: string,
  dataFinal: string,
  cidadeIdFiltro?: string
) => {
  // 1. Período
  const inicio = new Date(`${dataInicial}T00:00:00.000Z`);
  const fim = new Date(`${dataFinal}T00:00:00.000Z`);

  fim.setUTCDate(fim.getUTCDate() + 1);

  if (
    Number.isNaN(inicio.getTime()) ||
    Number.isNaN(fim.getTime()) ||
    inicio >= fim
  ) {
    throw new Error("Período inválido");
  }

  // 2. Permissões
  if (
    usuarioLogado.role !== Role.GLOBAL &&
    usuarioLogado.role !== Role.ADMIN_LOCAL &&
    usuarioLogado.role !== Role.FUNCIONARIO
  ) {
    throw new Error("Sem permissão");
  }

  if (
    usuarioLogado.role !== Role.GLOBAL &&
    !usuarioLogado.cidadeId
  ) {
    throw new Error("Cidade não encontrada");
  }

  const cidadeId = usuarioLogado.role === Role.GLOBAL
    ? cidadeIdFiltro
    : usuarioLogado.cidadeId!;

  if (!cidadeId) {
    return
  }

  // 3. Filtros reutilizáveis
  const periodo = {
    gte: inicio,
    lt: fim,
  };

  const whereRequisicao: Prisma.RequisicaoWhereInput = {
    cidadeId,
    criadoEm: periodo,
  };

  // 4. Consultas
  const [
    requisicoes,
    totalUsuarios,
    totalArvores,
    totalRequisicoes,
    totalPublicacoes,
    requisicoesPorStatus,
    requisicoesPorAtendimento,
    bairrosConhecidos,
    requisicoesPorBairro,
  ] = await prisma.$transaction([
    prisma.requisicao.findMany({
      where: whereRequisicao,
      orderBy: {
        criadoEm: "desc",
      },
      include: {
        cidade: {
          select: {
            id: true,
            nome: true,
            uf: true,
          },
        },
        criadoPor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        arvore: {
          select: {
            id: true,
            nomePopular: true,
          },
        },
      },
    }),

    prisma.usuario.count({
      where: {
        cidadeId,
        criadoEm: periodo,
      },
    }),

    prisma.arvore.count({
      where: {
        cidadeId,
        criadoEm: periodo,
      },
    }),

    prisma.requisicao.count({
      where: whereRequisicao,
    }),

    prisma.publicacao.count({
      where: {
        criadoEm: periodo,
        requisicao: {
          cidadeId,
        },
      },
    }),

    prisma.requisicao.groupBy({
      by: ["status"],
      where: whereRequisicao,
      _count: {
        _all: true,
      },
    }),

    prisma.requisicao.groupBy({
      by: ["tipoAtendimento"],
      where: whereRequisicao,
      _count: {
        _all: true,
      },
    }),

    prisma.requisicao.groupBy({
      by: ["bairro"],
      where: {
        cidadeId,
        bairro: {
          not: "",
        },
      },
      _count: {
        _all: true,
      },
    }),

    prisma.requisicao.groupBy({
      by: ["bairro", "status"],
      where: {
        ...whereRequisicao,
        bairro: {
          not: "",
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  // 5. Contagem de cada status
  const status = Object.fromEntries(
    Object.values(StatusRequisicao).map((s) => [s, 0])
  ) as Record<StatusRequisicao, number>;

  requisicoesPorStatus.forEach((item) => {
    status[item.status] = item._count._all;
  });

  // 6. Contagem por tipo de atendimento
  const atendimentos = Object.fromEntries(
    Object.values(TipoAtendimento).map((t) => [t, 0])
  ) as Record<TipoAtendimento, number>;

  requisicoesPorAtendimento.forEach((item) => {
    atendimentos[item.tipoAtendimento] = item._count._all;
  });

  type BairroStatus = {
    bairro: string;
    quantidade: number;
    status: Record<StatusRequisicao, number>;
  };

  const bairrosMap = new Map<string, BairroStatus>();

  // Inicializa todos os bairros conhecidos
  bairrosConhecidos.forEach((item) => {
    bairrosMap.set(item.bairro, {
      bairro: item.bairro,
      quantidade: 0,
      status: Object.fromEntries(
        Object.values(StatusRequisicao).map(
          (status) => [status, 0]
        )
      ) as Record<StatusRequisicao, number>,
    });
  });

  // Preenche a quantidade de cada status por bairro
  requisicoesPorBairro.forEach((item) => {
    const bairro = bairrosMap.get(item.bairro);

    if (!bairro) return;

    const quantidade = item._count._all;

    bairro.status[item.status as StatusRequisicao] = quantidade;
    bairro.quantidade += quantidade;
  });

  // Ordena pela quantidade total de requisições
  const bairros = [...bairrosMap.values()].sort(
    (a, b) => b.quantidade - a.quantidade
  );

  // 7. Retorno
  return {
    periodo: {
      dataInicial,
      dataFinal,
    },

    indicadores: {
      totalUsuarios,
      totalArvores,
      totalRequisicoes,
      totalPublicacoes,
    },

    requisicoesPorStatus: status,

    requisicoesPorAtendimento: atendimentos,

    requisicoesPorBairro: bairros,

    requisicoes,
  };
};