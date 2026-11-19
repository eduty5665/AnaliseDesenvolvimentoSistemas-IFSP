import { apiFetch } from "./api";

export async function listarCidades(){
    return await apiFetch('/cidades', {
        method: "GET",
    })
}

export async function listarCidadesUsuario(){
    return await apiFetch('/cidades/usuario', {
        method: "GET",
    })
}

export async function listarCidadesAtivas(){
    return await apiFetch('/cidades/ativas', {
        method: "GET",
    })
}

export async function cadastrarCidade(nome: string, uf: string, permiteEntrega: boolean){
    return await apiFetch('/cidades', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome,
            uf,
            permiteEntrega
        }),
    })
}

export async function atualizarCidade(id: string, nome: string, uf: string, permiteEntrega: boolean){
    return await apiFetch(`/cidades/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome,
            uf,
            permiteEntrega
        }),
    })
}

export async function ativarCidade(id: string){
    return await apiFetch(`/cidades/ativar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

export async function desativarCidade(id: string){
    return await apiFetch(`/cidades/desativar/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}