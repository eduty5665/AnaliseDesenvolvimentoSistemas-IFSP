import { apiFetch } from "./api";

import type {
    CursorPublicacao,
    RespostaPublicacoes,
} from "../types";

export async function listarPublicacoes(
    limit = 10,
    cursor?: CursorPublicacao | null,
    cidadeId?: string | null,
    minhasPublicacoes = false,
    signal?: AbortSignal,
): Promise<RespostaPublicacoes> {
    const params = new URLSearchParams({
        limit: String(limit),
    });

    if (cursor) {
        params.set("cursorDate", cursor.cursorDate);
        params.set("cursorId", cursor.cursorId);
    }

    if (cidadeId) {
        params.set("cidadeId", cidadeId);
    }

    if (minhasPublicacoes) {
        params.set("minhasPublicacoes", "true");
    }

    return apiFetch(`/blog?${params.toString()}`, {
        method: "GET",
        ...(signal ? { signal } : {}),
    });
}

export async function publicar(idRequisicao: string, titulo: string, descricao: string) {
    return await apiFetch("/blog", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            idRequisicao,
            titulo,
            descricao,
        }),
    })
}

//Verifica se requisição já possui publicação de fot de plantio
export async function verificarPublicacao(idRequisicao: string) {
    return await apiFetch(`/blog/buscarReq/${idRequisicao}`, {
        method: 'GET',
    })
}