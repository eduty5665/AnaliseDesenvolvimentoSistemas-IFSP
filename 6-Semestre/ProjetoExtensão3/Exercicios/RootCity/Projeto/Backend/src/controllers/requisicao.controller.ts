import type { Request, Response } from "express";
import { requisicaoSchema } from "../schemas/requisicao.schema.js";
import { agendarRequisicaoService, aguardarRetiradaService, alterarRequisicaoService, atualizarFotoPlantioService, atualizarRequisicaoService, criarRequisicaoService, gerarUrlComprovanteService, listarReqCidadeService, listarReqService, listarReqUsuarioService, recusarRequisicaoService } from "../services/requisicao.service.js";
import type { ArquivoMulter } from "../services/storage.service.js";

export async function criarRequisicao(req: Request, res: Response) {
  const validacao = requisicaoSchema.safeParse(req.body);

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autencticado"
    });
  }

  if (!validacao.success) {
    console.dir(validacao.error.flatten(), {
      depth: null,
    });

    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten(),
    });
  }

  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const fotoLocal = files?.fotoLocal?.[0];
    const comprovante = files?.comprovante?.[0];

    if (!fotoLocal) {
      return res.status(400).json({
        message: "A foto do local é obrigatória.",
      });
    }

    if (!comprovante) {
      return res.status(400).json({
        message: "O comprovante de residência é obrigatório.",
      });
    }

    const novaRequisicao = await criarRequisicaoService(
      req.usuario,
      validacao.data,
      {
        fotoLocal,
        comprovante,
      }
    );

    return res.status(201).json(novaRequisicao);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Erro ao criar requisição" });
  }
}

export async function atualizarRequisicao(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da requisição inválido" });
  }

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autencticado"
    });
  }

  const validacao = requisicaoSchema.safeParse(req.body);

  if (!validacao.success) {
    console.dir(validacao.error.flatten(), {
      depth: null,
    });

    return res.status(400).json({
      message: "Dados inválidos",
      errors: validacao.error.flatten(),
    });
  }

  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const fotoLocal = files?.fotoLocal?.[0];
    const comprovante = files?.comprovante?.[0];

    const arquivos: {
      fotoLocal?: ArquivoMulter;
      comprovante?: ArquivoMulter;
    } = {};

    if (fotoLocal) {
      arquivos.fotoLocal = fotoLocal;
    }

    if (comprovante) {
      arquivos.comprovante = comprovante;
    }

    const requisicao = await atualizarRequisicaoService(
      id,
      req.usuario,
      validacao.data,
      arquivos
    );

    return res.status(201).json(requisicao);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Erro ao atualizar requisição" });
  }
}

export async function atualizarFotoPlantio(req: Request, res: Response) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da requisição inválido" });
  }

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autencticado"
    });
  }

  try {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const fotoPlantio = files?.fotoPlantio?.[0];

    const arquivos: {
      fotoPlantio?: ArquivoMulter;
    } = {};

    if (fotoPlantio) {
      arquivos.fotoPlantio = fotoPlantio;
    }

    const requisicao = await atualizarFotoPlantioService(
      id,
      req.usuario,
      arquivos
    );

    return res.status(201).json(requisicao);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Erro ao atualizar requisição" });
  }
}

export const buscarRequisicoes = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }

    const { dataInicial, dataFinal } = req.query;

    if (typeof dataInicial !== 'string' || typeof dataFinal !== 'string') {
      return res.status(400).json({ message: "Datas inválidas" });
    }

    const requisicoes = await listarReqService(req.usuario, dataInicial, dataFinal);
    return res.status(200).json(requisicoes);
  } catch (error) {
    return res.status(500).json({ message: `Erro ao listar requisições ${error}` })
  }
}

export const buscarRequisicoesPorCidade = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { dataInicial, dataFinal } = req.query;

  if (typeof dataInicial !== 'string' || typeof dataFinal !== 'string') {
    return res.status(400).json({ message: "Datas inválidas" });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da cidade inválido" });
  }

  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }
    const requisicoes = await listarReqCidadeService(id, req.usuario, dataInicial, dataFinal);
    return res.status(200).json(requisicoes);

  } catch (error) {
    return res.status(500).json({ message: `Erro ao listar requisições ${error}` })
  }
}

export const buscarRequisicoesPorUsuario = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }

    const { dataInicial, dataFinal } = req.query;

    if (
      typeof dataInicial !== "string" ||
      typeof dataFinal !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dataInicial) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dataFinal) ||
      dataInicial > dataFinal
    ) {
      return res.status(400).json({
        message: "Informe um período de datas válido",
      });
    }

    const requisicoes = await listarReqUsuarioService(req.usuario, dataInicial, dataFinal);
    return res.status(200).json(requisicoes);

  } catch (error) {
    return res.status(500).json({ message: `Erro ao listar requisições ${error}` })
  }
}


export async function buscarUrlComprovante(
  req: Request,
  res: Response
) {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "ID da requisição inválido",
    });
  }

  if (!req.usuario) {
    return res.status(401).json({
      message: "Usuário não autenticado",
    });
  }

  try {
    const url = await gerarUrlComprovanteService(
      id,
      req.usuario
    );

    return res.status(200).json({ url });
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : "Erro ao gerar URL do comprovante";

    if (mensagem === "Requisição não encontrada") {
      return res.status(404).json({ message: mensagem });
    }

    if (mensagem === "Comprovante não encontrado") {
      return res.status(404).json({ message: mensagem });
    }

    if (mensagem === "Acesso não permitido") {
      return res.status(403).json({ message: mensagem });
    }

    console.error("Erro ao gerar URL do comprovante:", error);

    return res.status(500).json({
      message: "Erro ao gerar URL do comprovante",
    });
  }
}

export const recusarRequisicao = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da requisição inválido" });
  }

  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }

    await recusarRequisicaoService(id, req.body.observacaoStatus, req.usuario);

    return res.status(200).json({
      message: "Situação da Requisição foi atualizado com sucesso",
    });

  } catch (error) {
    return res.status(500).json({ message: `Erro ao mudar situação da requisição ${error}` })
  }
}

export const agendarPlantio = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da requisição inválido" });
  }

  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }

    await agendarRequisicaoService(id, req.body.dataInicial, req.body.dataFinal, req.usuario);

    return res.status(200).json({
      message: "Plantio foi agendado com sucesso",
    });

  } catch (error) {
    return res.status(500).json({ message: `Erro ao mudar situação da requisição ${error}` })
  }
}

export const aguardarRetirada = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da requisição inválido" });
  }

  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }

    await aguardarRetiradaService(id, req.body.idEndereco, req.usuario);

    return res.status(200).json({
      message: "Aguardando retirada",
    });

  } catch (error) {
    return res.status(500).json({ message: `Erro ao mudar situação da requisição ${error}` })
  }
}

export const alterarStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID da requisição inválido" });
  }

  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }

    await alterarRequisicaoService(id, req.body.status, req.usuario);

    return res.status(200).json({
      message: "A situação da requisição foi alterada com sucesso",
    });

  } catch (error) {
    return res.status(500).json({ message: `Erro ao mudar situação da requisição ${error}` })
  }
}