import { apiFetch } from "./api";


export async function cadastrarArvore(formData: FormData) {
  return await apiFetch("/arvores", {
    method: "POST",
    body: formData,
  })
}

export async function listarArvores() {
  return await apiFetch("/arvores", {
    method: "GET",
  });
}

export async function listarArvoresCidade(id: string) {
  return await apiFetch(`/arvores/cidade/${id}`, {
    method: "GET",
  });
}

export async function atualizarArvore(id: string, formData: FormData) {
  return await apiFetch(`/arvores/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export async function excluirArvore(id: string) {
  return await apiFetch(`/arvores/${id}`, {
    method: "DELETE",
  });
}