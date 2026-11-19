import { prisma } from "../lib/prisma.js";
import { Role } from "../generated/prisma/enums.js";
import {
  excluirArquivoSupabase,
  uploadArquivoSupabase,
  type ArquivoMulter,
} from "./storage.service.js";

export async function listarArvoresService(
  usuarioLogado: {
    role: Role;
    cidadeId: string | null;
  }
) {
  if (usuarioLogado.role === Role.GLOBAL) {
    return await prisma.arvore.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    });
  }

  if (
    usuarioLogado.role === Role.ADMIN_LOCAL ||
    usuarioLogado.role === Role.FUNCIONARIO
  ) {
    const cidadeId = usuarioLogado.cidadeId;

    return await prisma.arvore.findMany({
      where: {
        cidadeId,
      },
      orderBy: {
        criadoEm: "desc",
      },
    });
  }

  return [];
}

export async function listarArvoresCidadeService(cidadeId: string) {
  return await prisma.arvore.findMany({
    where: {
      cidadeId,
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}

export async function criarArvoreService(
  usuarioLogado: {
    cidadeId: string | null,
    role: Role
  },
  dados: {
    nome: string;
    descricao?: string;
    quantidade: number;
    cidadeId: string;
  },
  file?: ArquivoMulter
) {
  let imagemUrl: string | null = null;

  if (usuarioLogado.cidadeId !== dados.cidadeId) {
    throw new Error(`Ação não permitida`);
  }

  if (file) {
    const imagem = await uploadArquivoSupabase(
      file,
      "public_box",
      "arvores",
      true
    );

    imagemUrl = imagem.path;
  }

  return await prisma.arvore.create({
    data: {
      nomePopular: dados.nome,
      descricao: dados.descricao ?? null,
      quantidade: dados.quantidade,
      cidadeId: dados.cidadeId,
      imagemUrl,
    },
  });
}

export async function atualizarArvoreService(
  id: string,
  usuarioLogado: {
    role: Role;
    cidadeId: string | null;
  },
  dados: {
    nome: string;
    descricao?: string;
    quantidade: number;
    cidadeId: string;
  },
  file?: ArquivoMulter
) {
  const arvoreExistente = await prisma.arvore.findUnique({
    where: {
      id,
    },
  });


  if (!arvoreExistente) {
    throw new Error("Árvore não encontrada");
  }

  //Evita que um usuário de outra cidade descubra o id de outra
  const cidadeId =
    usuarioLogado.role === Role.GLOBAL
      ? dados.cidadeId
      : arvoreExistente.cidadeId;

  if (
    usuarioLogado.role === Role.ADMIN_LOCAL ||
    usuarioLogado.role === Role.FUNCIONARIO
  ) {
    if (
      !usuarioLogado.cidadeId ||
      arvoreExistente.cidadeId !== usuarioLogado.cidadeId
    ) {
      throw new Error("Você não tem permissão para editar esta árvore");
    }
  }

  let imagemPath = arvoreExistente.imagemUrl;

  if (file) {
    const imagem = await uploadArquivoSupabase(
      file,
      "public_box",
      "arvores",
      true
    );

    // Primeiro fez upload da nova.
    // Depois remove a antiga.
    if (arvoreExistente.imagemUrl) {
      await excluirArquivoSupabase(
        "public_box",
        arvoreExistente.imagemUrl
      );
    }

    imagemPath = imagem.path;
  }

  return await prisma.arvore.update({
    where: {
      id,
    },
    data: {
      nomePopular: dados.nome,
      descricao: dados.descricao ?? null,
      quantidade: dados.quantidade,
      cidadeId,
      imagemUrl: imagemPath,
    },
  });
}

export async function excluirArvoreService(id: string, usuarioLogado: { role: Role; cidadeId: string | null; }) {
  const arvoreExistente = await prisma.arvore.findUnique({
    where: {
      id,
    },
  });

  if (!arvoreExistente) {
    throw new Error("Árvore não encontrada");
  }

  if (
    usuarioLogado.role === Role.ADMIN_LOCAL ||
    usuarioLogado.role === Role.FUNCIONARIO
  ) {
    if (
      !usuarioLogado.cidadeId ||
      arvoreExistente.cidadeId !== usuarioLogado.cidadeId
    ) {
      throw new Error("Você não tem permissão para excluir esta árvore");
    }
  }

  if (arvoreExistente.imagemUrl) {
    await excluirArquivoSupabase(
      "public_box",
      arvoreExistente.imagemUrl
    );
  }

  return await prisma.arvore.delete({
    where: {
      id,
    },
  });
}