import type { Prisma } from "../generated/prisma/client.js";
import { Role, StatusRequisicao, type TipoAtendimento } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import {
  uploadArquivoSupabase,
  obterUrlPublica,
  obterUrlAssinada,
  type ArquivoMulter,
  excluirArquivoSupabase,
} from "./storage.service.js";

export async function criarRequisicaoService(
  usuarioLogado: { id: string; role: Role },
  dados: {
    criadoPorId: string;
    cidadeId: string;
    arvoreId: string;
    nomeBeneficiario: string;
    telefoneBeneficiario: string;
    emailBeneficiario?: string | undefined;
    rua: string;
    numero: string;
    bairro: string;
    cidadeEndereco: string;
    cep: string;
    estado: string;
    pontoReferencia?: string | undefined;
    tipoAtendimento: TipoAtendimento;
  },
  arquivos: {
    fotoLocal?: ArquivoMulter;
    comprovante?: ArquivoMulter;
  }
) {
  let fotoLocalPath: string | null = null;
  let comprovanteResidenciaPath: string | null = null;

  dados.criadoPorId = usuarioLogado.id;

  if (arquivos.fotoLocal) {
    const foto = await uploadArquivoSupabase(
      arquivos.fotoLocal,
      "public_box",
      "locais_plantio",
      true
    );

    fotoLocalPath = foto.path;
  }

  if (arquivos.comprovante) {
    const comprovante = await uploadArquivoSupabase(
      arquivos.comprovante,
      "box",
      "documentos-sensiveis",
      false
    );

    comprovanteResidenciaPath = comprovante.path;
  }

  const arvore = await prisma.arvore.findUnique({
    where: {
      id: dados.arvoreId,
    }
  })

  if (!arvore) {
    throw new Error(`Àrvore não encontrada`);
  }

  if (arvore?.quantidade == 0) {
    throw new Error(`Estoque da árvore ${arvore.nomePopular} está esgotado`);
  }

  const cidade = await prisma.cidade.findUnique({
    where: {
      id: dados.cidadeId,
    }
  })

  if (!cidade?.permiteEntrega && dados.tipoAtendimento === 'PLANTIO_AGENDADO') {
    throw new Error("A cidade selecionada não oferece plantio no local. As mudas estão disponíveis apenas para retirada.");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Cria a requisição
    const requisicao = await tx.requisicao.create({
      data: {
        criadoPorId: dados.criadoPorId,
        cidadeId: dados.cidadeId,
        arvoreId: dados.arvoreId,
        nomeBeneficiario: dados.nomeBeneficiario,
        telefoneBeneficiario: dados.telefoneBeneficiario,
        emailBeneficiario: dados.emailBeneficiario ?? '',

        rua: dados.rua,
        numero: dados.numero,
        bairro: dados.bairro,
        cidadeEndereco: dados.cidadeEndereco,
        cep: dados.cep,
        estado: dados.estado,

        pontoReferencia: dados.pontoReferencia ?? null,

        tipoAtendimento: dados.tipoAtendimento,

        fotoLocalUrl: fotoLocalPath,
        comprovanteResidenciaUrl: comprovanteResidenciaPath,
      },
    });

    // 2. Cria o primeiro histórico dessa requisição
    await tx.historicoRequisicao.create({
      data: {
        requisicaoId: requisicao.id,
        usuarioId: dados.criadoPorId,

        // coloque aqui o status inicial do seu sistema
        statusNovo: StatusRequisicao.SOLICITADO,
        observacao: "Requisição foi recebida com sucesso",
      },
    });

    return requisicao;
  });
}

export async function atualizarRequisicaoService(
  id: string,
  usuarioLogado: { id: string; role: Role },
  dados: {
    criadoPorId: string;
    cidadeId: string;
    arvoreId: string;
    nomeBeneficiario: string;
    telefoneBeneficiario: string;
    emailBeneficiario?: string | undefined;
    rua: string;
    numero: string;
    bairro: string;
    cidadeEndereco: string;
    cep: string;
    estado: string;
    pontoReferencia?: string | undefined;
    tipoAtendimento: TipoAtendimento;
  },
  arquivos: {
    fotoLocal?: ArquivoMulter;
    comprovante?: ArquivoMulter;
  }
) {

  dados.criadoPorId = usuarioLogado.id;

  //BUSCAR REQUISIÇÃO ATUAL
  const requisicaoAtual = await prisma.requisicao.findUnique({
    where: { id },
  });

  if (!requisicaoAtual) {
    throw new Error("Requisição não encontrada");
  }

  if (requisicaoAtual.criadoPorId !== usuarioLogado.id) {
    throw new Error("Ação não permitida");
  }

  //MANTER OS ARQUIVOS EXISTENTES POR PADRÃO
  let fotoLocalPath =
    requisicaoAtual.fotoLocalUrl;

  let comprovanteResidenciaPath =
    requisicaoAtual.comprovanteResidenciaUrl;

  /*
   * Guardamos os arquivos antigos.
   *
   * Eles só serão excluídos depois que o novo upload
   * for concluído com sucesso.
   */

  const fotoLocalAntiga =
    requisicaoAtual.fotoLocalUrl;

  const comprovanteAntigo =
    requisicaoAtual.comprovanteResidenciaUrl;

  // NOVA FOTO

  if (arquivos.fotoLocal) {

    const foto = await uploadArquivoSupabase(
      arquivos.fotoLocal,
      "public_box",
      "locais_plantio",
      true
    );

    fotoLocalPath = foto.path;
  }

  //NOVO COMPROVANTE

  if (arquivos.comprovante) {

    const comprovante = await uploadArquivoSupabase(
      arquivos.comprovante,
      "box",
      "documentos-sensiveis",
      false
    );

    comprovanteResidenciaPath =
      comprovante.path;
  }

  const requisicaoAtualizada =
    await prisma.requisicao.update({
      where: { id },

      data: {
        criadoPorId: dados.criadoPorId,
        cidadeId: dados.cidadeId,
        arvoreId: dados.arvoreId,

        nomeBeneficiario: dados.nomeBeneficiario,
        telefoneBeneficiario: dados.telefoneBeneficiario,
        emailBeneficiario: dados.emailBeneficiario ?? '',

        rua: dados.rua,
        numero: dados.numero,
        bairro: dados.bairro,
        cidadeEndereco: dados.cidadeEndereco,
        cep: dados.cep,
        estado: dados.estado,
        status: StatusRequisicao.SOLICITADO,

        pontoReferencia: dados.pontoReferencia ?? null,

        tipoAtendimento: dados.tipoAtendimento,

        fotoLocalUrl: fotoLocalPath,

        comprovanteResidenciaUrl: comprovanteResidenciaPath,
      },
    });

  await prisma.historicoRequisicao.create({
    data: {
      requisicaoId: requisicaoAtualizada.id,
      usuarioId: usuarioLogado.id,
      statusAnterior: requisicaoAtual.status,
      statusNovo: requisicaoAtualizada.status,
      observacao: "Requisição atualizada com sucesso",
    }
  })

  //Só excluímos se um NOVO arquivo foi enviado.
  if (
    arquivos.fotoLocal &&
    fotoLocalAntiga
  ) {
    await excluirArquivoSupabase(
      "public_box",
      fotoLocalAntiga
    );
  }

  if (
    arquivos.comprovante &&
    comprovanteAntigo
  ) {
    await excluirArquivoSupabase(
      "box",
      comprovanteAntigo
    );
  }

  return requisicaoAtualizada;
}

export const atualizarFotoPlantioService = async (id: string, usuarioLogado: { id: string, role: Role }, arquivos: { fotoPlantio?: ArquivoMulter }) => {
  const requisicao = await prisma.requisicao.findUnique({
    where: { id },
  });

  if (!requisicao) {
    throw new Error("Requisição não encontrada");
  }

  if (usuarioLogado.role === Role.CIDADAO && requisicao.criadoPorId !== usuarioLogado.id) {
    throw new Error("Ação não permitida");
  }

  let fotoPlantioPath = requisicao.fotoPlantioUrl;

  const fotoPlantioAntiga = fotoPlantioPath;

  if (arquivos.fotoPlantio) {
    const foto = await uploadArquivoSupabase(
      arquivos.fotoPlantio,
      "public_box",
      "fotos_plantio",
      true
    );

    fotoPlantioPath = foto.path;
  }

  const requisicaoAtualizada = await prisma.requisicao.update({
    where: { id },
    data: {
      fotoPlantioUrl: fotoPlantioPath,
    },
  });

  //Só excluímos se uma NOVA foto foi enviada.
  if (
    arquivos.fotoPlantio &&
    fotoPlantioAntiga
  ) {
    await excluirArquivoSupabase(
      "public_box",
      fotoPlantioAntiga
    );
  }

  return await adicionarUrlsArquivos(requisicaoAtualizada);
}

async function adicionarUrlsArquivos(requisicao: any) {
  const fotoLocalUrl = requisicao.fotoLocalUrl ? obterUrlPublica("public_box", requisicao.fotoLocalUrl) : null;

  const comprovanteResidenciaUrl = requisicao.comprovanteResidenciaUrl
    ? await obterUrlAssinada("box", requisicao.comprovanteResidenciaUrl, 300)
    : null;

  const fotoPlantioUrl = requisicao.fotoPlantioUrl ? obterUrlPublica("public_box", requisicao.fotoPlantioUrl) : null;

  return {
    ...requisicao,
    fotoLocalUrl,
    comprovanteResidenciaUrl,
    fotoPlantioUrl,
  };
}

export async function gerarUrlComprovanteService(
  requisicaoId: string,
  usuarioLogado: {
    id: string;
    cidadeId: string | null;
    role: Role;
  }
): Promise<string> {
  const requisicao = await prisma.requisicao.findUnique({
    where: { id: requisicaoId },
    select: {
      id: true,
      cidadeId: true,
      comprovanteResidenciaUrl: true,
    },
  });

  if (!requisicao) {
    throw new Error("Requisição não encontrada");
  }

  // Somente o perfil GLOBAL pode acessar requisições de qualquer cidade.
  // Os demais perfis administrativos precisam pertencer à cidade da requisição.
  const podeAcessar =
    usuarioLogado.role === Role.GLOBAL ||
    (
      (
        usuarioLogado.role === Role.ADMIN_LOCAL ||
        usuarioLogado.role === Role.FUNCIONARIO
      ) &&
      !!usuarioLogado.cidadeId &&
      usuarioLogado.cidadeId === requisicao.cidadeId
    );

  if (!podeAcessar) {
    throw new Error("Acesso não permitido");
  }

  if (!requisicao.comprovanteResidenciaUrl) {
    throw new Error("Comprovante não encontrado");
  }

  return obterUrlAssinada(
    "box",
    requisicao.comprovanteResidenciaUrl,
    300
  );
}

export const listarReqService = async (usuarioLogado: { id: string, cidadeId: string | null, role: Role, email: string }, dataInicial: string, datafinal: string) => {

  const include = {
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
      }
    },
    arvore: {
      select: {
        id: true,
        nomePopular: true,
      },
    },
    endereco: {
      select: {
        id: true,
        rua: true,
        bairro: true,
        numero: true,
        cep: true,
        pontoReferencia: true
      }
    }
  };

  if (usuarioLogado.role === Role.ADMIN_LOCAL || usuarioLogado.role === Role.FUNCIONARIO) {

    if (!usuarioLogado.cidadeId) {
      throw new Error("Cidade não encontrada");
    }

    const cidadeId = usuarioLogado.cidadeId
    const inicio = new Date(`${dataInicial}T00:00:00.000Z`);
    const fim = new Date(`${datafinal}T23:59:59.999Z`);

    const requisicoes = await prisma.requisicao.findMany({
      where: {
        cidadeId,
        criadoEm: {
          gte: inicio,
          lte: fim,
        }
      },
      orderBy: {
        criadoEm: 'asc'
      },
      include,
    });

    return await Promise.all(
      requisicoes.map(adicionarUrlsArquivos)
    );
  }

  return [];
}

export const listarReqCidadeService = async (cidadeId: string, usuarioLogado: { id: string, cidadeId: string | null, role: Role, email: string }, dataInicial: string, datafinal: string) => {

  const include = {
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
      }
    },
    arvore: {
      select: {
        id: true,
        nomePopular: true,
      },
    },
    endereco: {
      select: {
        id: true,
        rua: true,
        bairro: true,
        numero: true,
        cep: true,
        pontoReferencia: true
      }
    }
  };

  if (usuarioLogado.role === Role.GLOBAL) {
    const inicio = new Date(`${dataInicial}T00:00:00.000Z`);
    const fim = new Date(`${datafinal}T23:59:59.999Z`);

    const requisicoes = await prisma.requisicao.findMany({
      where: {
        cidadeId: cidadeId,
        criadoEm: {
          gte: inicio,
          lte: fim,
        }
      },
      orderBy: {
        criadoEm: 'asc'
      },
      include,
    });

    return await Promise.all(
      requisicoes.map(adicionarUrlsArquivos)
    );
  }

  return [];
}

export const listarReqUsuarioService = async (usuarioLogado: { id: string }, dataInicial: string, dataFinal: string) => {

  if (!usuarioLogado.id) {
    throw new Error("Usuário não autenticado");
  }

  const inicio = new Date(`${dataInicial}T00:00:00.000Z`);
  const fim = new Date(`${dataFinal}T23:59:59.999Z`);

  const include = {
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
      }
    },
    arvore: {
      select: {
        id: true,
        nomePopular: true,
      },
    },
    historico: {
      select: {
        id: true,
        statusAnterior: true,
        statusNovo: true,
        observacao: true,
        criadoEm: true,
      }
    },
    endereco: {
      select: {
        id: true,
        rua: true,
        bairro: true,
        numero: true,
        cep: true,
        pontoReferencia: true
      }
    }
  };

  const requisicoes = await prisma.requisicao.findMany({
    where: {
      criadoPorId: usuarioLogado.id,
      criadoEm: {
        gte: inicio,
        lte: fim,
      }
    },
    orderBy: {
      criadoEm: 'desc'
    },
    include,
  });

  return await Promise.all(
    requisicoes.map(adicionarUrlsArquivos)
  );

}

export const recusarRequisicaoService = async (requisicaoId: string, observacaoStatus: string, usuarioLogado: { id: string, cidadeId: string | null, role: Role }) => {
  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }


  //BUSCAR REQUISIÇÃO ATUAL
  const requisicaoAtual = await prisma.requisicao.findUnique({
    where: { id: requisicaoId },
  });

  if (!requisicaoAtual) {
    throw new Error("Requisição não encontrada");
  }

  if (usuarioLogado.role !== Role.GLOBAL && typeof usuarioLogado.cidadeId !== requisicaoAtual.cidadeId) {
    throw new Error("Ação não permitida");
  }

  await prisma.requisicao.update({
    where: { id: requisicaoId },
    data: {
      status: StatusRequisicao.RECUSADO,
      observacaoStatus: observacaoStatus
    }
  })

  await prisma.historicoRequisicao.create({
    data: {
      requisicaoId: requisicaoAtual.id,
      usuarioId: usuarioLogado.id,
      statusAnterior: requisicaoAtual.status,
      statusNovo: StatusRequisicao.RECUSADO,
      observacao: "Requisição recusada com sucesso",
    }
  })
}

export const agendarRequisicaoService = async (requisicaoId: string, dataInicial: Date, dataFinal: Date, usuarioLogado: { id: string, cidadeId: string | null, role: Role }) => {
  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  //BUSCAR REQUISIÇÃO ATUAL
  const include = {
    cidade: {
      select: {
        id: true,
        permiteEntrega: true,
      },
    },
  };

  const requisicaoAtual = await prisma.requisicao.findUnique({
    where: { id: requisicaoId },
    include
  });

  if (!requisicaoAtual) {
    throw new Error("Requisição não encontrada");
  }

  if (usuarioLogado.role !== Role.GLOBAL && typeof usuarioLogado.cidadeId !== requisicaoAtual.cidadeId) {
    throw new Error("Ação não permitida");
  }

  if (!requisicaoAtual.cidade.permiteEntrega) {
    throw new Error("A cidade selecionada não oferece plantio no local. As mudas estão disponíveis apenas para retirada.");
  }

  await prisma.requisicao.update({
    where: { id: requisicaoId },
    data: {
      status: StatusRequisicao.AGENDADO_PLANTIO,
      dataInicial: dataInicial,
      dataFinal: dataFinal
    }
  })

  await prisma.historicoRequisicao.create({
    data: {
      requisicaoId: requisicaoAtual.id,
      usuarioId: usuarioLogado.id,
      statusAnterior: requisicaoAtual.status,
      statusNovo: StatusRequisicao.AGENDADO_PLANTIO,
      observacao: "Requisição agendada com sucesso",
    }
  })
}

export const aguardarRetiradaService = async (requisicaoId: string, idEndereco: string, usuarioLogado: { id: string, cidadeId: string | null, role: Role }) => {
  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  //BUSCAR REQUISIÇÃO ATUAL
  const requisicaoAtual = await prisma.requisicao.findUnique({
    where: { id: requisicaoId },
  });

  if (!requisicaoAtual) {
    throw new Error("Requisição não encontrada");
  }

  if (usuarioLogado.role !== Role.GLOBAL && usuarioLogado.cidadeId !== requisicaoAtual.cidadeId) {
    throw new Error("Ação não permitida");
  }

  await prisma.requisicao.update({
    where: { id: requisicaoId },
    data: {
      status: StatusRequisicao.AGUARDANDO_RETIRADA,
      enderecoId: idEndereco
    }
  })

  await prisma.historicoRequisicao.create({
    data: {
      requisicaoId: requisicaoAtual.id,
      usuarioId: usuarioLogado.id,
      statusAnterior: requisicaoAtual.status,
      statusNovo: StatusRequisicao.AGUARDANDO_RETIRADA,
      observacao: "Requisição aguardando retirada",
    }
  })
}

//Não altera para recusado ou agendado para plantio
export const alterarRequisicaoService = async (requisicaoId: string, status: StatusRequisicao, usuarioLogado: { id: string, cidadeId: string | null, role: Role }) => {
  if (!usuarioLogado) {
    throw new Error("Usuário não autenticado");
  }

  //BUSCAR REQUISIÇÃO ATUAL
  const requisicaoAtual = await prisma.requisicao.findUnique({
    where: { id: requisicaoId },
  });

  if (!requisicaoAtual) {
    throw new Error("Requisição não encontrada");
  }

  if (usuarioLogado.role !== Role.GLOBAL && usuarioLogado.cidadeId !== requisicaoAtual.cidadeId) {
    throw new Error("Ação não permitida");
  }

  const arvore = await prisma.arvore.findUnique({
    where: {
      id: requisicaoAtual.arvoreId,
    }
  })

  if (!arvore) {
    throw new Error(`Àrvore não encontrada`);
  }

  if (arvore?.quantidade == 0 && requisicaoAtual.status == StatusRequisicao.SOLICITADO) {
    throw new Error(`Estoque da árvore ${arvore.nomePopular} está esgotado`);
  }

  return await prisma.$transaction(async (tx) => {

    const statusAnterior = requisicaoAtual.status;

    // Só debita quando inicia o processamento.
    if (
      statusAnterior === StatusRequisicao.SOLICITADO &&
      status !== StatusRequisicao.SOLICITADO
    ) {
      await debitarEstoqueArvore(
        tx,
        requisicaoAtual.arvoreId
      );
    }

    // Só devolve se a requisição voltar para SOLICITADO.
    if (
      statusAnterior !== StatusRequisicao.SOLICITADO &&
      status === StatusRequisicao.SOLICITADO
    ) {
      await devolverEstoqueArvore(
        tx,
        requisicaoAtual.arvoreId
      );
    }

    const requisicaoAtualizada = await tx.requisicao.update({
      where: { id: requisicaoId },
      data: {
        status
      }
    })

    await tx.historicoRequisicao.create({
      data: {
        requisicaoId: requisicaoAtual.id,
        usuarioId: usuarioLogado.id,
        statusAnterior: requisicaoAtual.status,
        statusNovo: status,
        observacao: "Requisição atualizada com sucesso",
      }
    })

    return requisicaoAtualizada;

  })
}

async function debitarEstoqueArvore(
  tx: Prisma.TransactionClient,
  arvoreId: string
) {
  const resultado = await tx.arvore.updateMany({
    where: {
      id: arvoreId,
      quantidade: {
        gt: 0,
      },
    },
    data: {
      quantidade: {
        decrement: 1,
      },
    },
  });

  if (resultado.count === 0) {
    throw new Error("Estoque da árvore esgotado");
  }
}

async function devolverEstoqueArvore(
  tx: Prisma.TransactionClient,
  arvoreId: string
) {
  await tx.arvore.update({
    where: {
      id: arvoreId,
    },
    data: {
      quantidade: {
        increment: 1,
      },
    },
  });
}