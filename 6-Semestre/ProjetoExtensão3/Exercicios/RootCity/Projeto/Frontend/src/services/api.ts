import { finalizarLoading, iniciarLoading } from "./loadingService";

const API_URL = import.meta.env.VITE_API_URL;

interface ApiOptions extends RequestInit {
    silent?: boolean; // Nova flag opcional
}

export async function apiFetch(
    endpoint: string,
    options?: ApiOptions
) {
    const isFormData = options?.body instanceof FormData;
    const method = options?.method?.toUpperCase() || "GET";
    const isSilent = options?.silent ?? (method === "GET");

    const headers: Record<string, string> = {
        ...((options?.headers as Record<string, string>) || {})
    };

    if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }

    if (!isSilent) {
        iniciarLoading();
    }

    try {
        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                credentials: "include",
                headers,
            }
        );

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            throw new Error(
                data?.message || "Erro na requisição"
            );
        }

        return data;

    } finally {
        if(!isSilent){
            finalizarLoading();
        }
    }
}
