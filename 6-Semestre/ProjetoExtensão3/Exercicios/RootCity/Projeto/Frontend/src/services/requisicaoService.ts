import type { StatusRequisicao } from "../types";
import { apiFetch } from "./api";

export async function cadastrarRequisicao(formData: FormData) {
  return await apiFetch("/requisicao", {
    method: "POST",
    body: formData,
  })
}

export async function atualizarRequisicao(id: string, formData: FormData) {
  return await apiFetch(`/requisicao/${id}`, {
    method: "PUT",
    body: formData,
  })
}

export async function salvarFotoPlantio(id: string, formData: FormData) {
  return await apiFetch(`/requisicao/fotoPlantio/${id}`, {
    method: "PUT",
    body: formData,
  })
}

export async function listarRequisicoes(dataInicio: string, dataFim: string) {
  
  const params = new URLSearchParams({
    dataInicial: dataInicio,
    dataFinal: dataFim,
  });

  return await apiFetch(`/requisicao?${params.toString()}`, {
    method: "GET"
  })
}

export async function listarRequisicoesCidade(id: string, dataInicio: string, dataFim: string) {

  const params = new URLSearchParams({
    dataInicial: dataInicio,
    dataFinal: dataFim,
  });

  return await apiFetch(`/requisicao/cidade/${id}?${params.toString()}`, {
    method: "GET",
  })
}

export async function listarMinhasRequisicoes( dataInicial: string, dataFinal: string){

  const params = new URLSearchParams({
    dataInicial,
    dataFinal,
  }) 

  return await apiFetch(`/requisicao/usuario?${params.toString()}`, {
    method: "GET"
  })
}

export async function buscarUrlComprovante(requisicaoId: string){
  const resposta = await apiFetch(`/requisicao/${requisicaoId}/comprovante`, {
    method: "GET",
  })

  return resposta.url;
}

export async function recusarRequisicao(id: string, observacaoStatus: string) {
  return await apiFetch(`/requisicao/recusar/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      observacaoStatus
    }),
  })
}

export async function agendarPlantio(id:string, dataInicial: Date, dataFinal: Date){
  return await apiFetch(`/requisicao/agendar/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataInicial,
      dataFinal
    })
  })
}

export async function aguardarRetirada(id: string, idEndereco: string){
  return await apiFetch(`/requisicao/retirada/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idEndereco,
    })
  })
}

export async function alterarStatus(id:string, status:StatusRequisicao){
  return await apiFetch(`/requisicao/alterarStatus/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status
    })
  })
}