import { apiFetch } from "./api";

export async function buscarDadosCidade(dataInicio: string, dataFim: string, idCidade?: string) {
  
  const paramsObj: Record<string, string> = {
    dataInicial: dataInicio,
    dataFinal: dataFim,
  };

  // 2. Adiciona o idCidade apenas se ele existir
  if (idCidade) {
    paramsObj.cidadeId = idCidade;
  }

  const params = new URLSearchParams(paramsObj);

  return await apiFetch(`/relatorio?${params.toString()}`, {
    method: "GET"
  })
}