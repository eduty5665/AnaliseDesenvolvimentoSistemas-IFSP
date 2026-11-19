import type { Request, Response } from "express";
import { dadosRelatorioService } from "../services/relatorio.service.js";


export const buscarDadosRelatorio = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        message: "Usuário não autencticado"
      });
    }
    
    const { dataInicial, dataFinal, cidadeId } = req.query;

    if (typeof dataInicial !== 'string' || typeof dataFinal !== 'string') {
      return res.status(400).json({ message: "Datas inválidas" });
    }

    if(cidadeId && typeof cidadeId !== 'string'){
        return res.status(400).json({ message: "Id da cidade inválido" });
    }

    const dados = await dadosRelatorioService(req.usuario, dataInicial, dataFinal, cidadeId);
    return res.status(200).json(dados);
  } catch (error) {
    return res.status(500).json({ message: `Erro ao buscar dados ${error}` })
  }
}