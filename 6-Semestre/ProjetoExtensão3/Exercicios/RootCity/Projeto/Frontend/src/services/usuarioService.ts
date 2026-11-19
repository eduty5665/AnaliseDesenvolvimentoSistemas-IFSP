import type { Role } from "../types";
import { apiFetch } from "./api";

export async function listarRoles(){
    return await apiFetch('/usuario/roles', {
        method: "GET",
    })
}

export async function atualizarUsuario(id: string, nome: string, email: string, role: Role, telefone?: string, cidadeId?: string){
    return await apiFetch(`/usuario/${id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome, email, role, telefone, cidadeId
        }),
    })
}

export async function listarUsuarios(){
    return await apiFetch('/usuario', {
        method: "GET",
    })
}

export async function listarUsuariosCidade(cidadeId: string, role: Role ){
    return await apiFetch(`/usuario/cidade/${cidadeId}/${role}`, {
        method: "GET",
    })
}

export async function ativarUsuario(id: string){
    return await apiFetch(`/usuario/ativar/${id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

export async function desativarUsuario(id: string){
    return await apiFetch(`/usuario/desativar/${id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

