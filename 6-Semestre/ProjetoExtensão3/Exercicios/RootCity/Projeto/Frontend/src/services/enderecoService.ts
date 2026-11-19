import { apiFetch } from "./api"

export async function listarEnderecoCidade(cidadeId: string){
    return await apiFetch(`/endereco/cidade/${cidadeId}`, {
        method: "GET",
    })
}

export async function listarEndereco(){
    return await apiFetch(`/endereco`, {
        method: "GET",
    })
}

export async function criarEndereco(rua: string, numero: string, bairro: string, cep?: string, pontoReferencia?: string){
    return await apiFetch(`/endereco`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            rua, numero, bairro, cep, pontoReferencia
        }),
    })
}

export async function criarEnderecoCidade(cidadeId: string, rua: string, numero: string, bairro: string, cep?: string, pontoReferencia?: string){
    return await apiFetch(`/endereco/cidade/${cidadeId}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            rua, numero, bairro, cep, pontoReferencia
        }),
    })
}

export async function atualizarEndereco(idEndereco: string, rua: string, numero: string, bairro: string, cep?: string, pontoReferencia?: string){
    return await apiFetch(`/endereco/${idEndereco}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            rua, numero, bairro, cep, pontoReferencia
        }),
    })
}

export async function atualizarEnderecoCidade(idEndereco: string, idCidade: string, rua: string, numero: string, bairro: string, cep?: string, pontoReferencia?: string){
    return await apiFetch(`/endereco/cidade/${idEndereco}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            idCidade, rua, numero, bairro, cep, pontoReferencia
        }),
    })
}

export async function alterarStatusEndereco(idEndereco: string){
    return await apiFetch(`/endereco/status/${idEndereco}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}