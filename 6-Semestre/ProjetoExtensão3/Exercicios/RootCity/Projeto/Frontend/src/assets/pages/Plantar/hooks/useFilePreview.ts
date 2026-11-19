import { useEffect, useState } from "react";

/**
 * Hook para gerar preview de arquivos de forma segura,
 * garantindo a revogação do ObjectURL ao trocar de arquivo ou desmontar o componente.
 * Evita vazamento de memória (memory leaks) no navegador.
 */
export function useFilePreview(
    file: File | null,
    urlExistente: string | null = null
): string | null {
    const [previewUrl, setPreviewUrl] = useState<string | null>(urlExistente);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(urlExistente);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file, urlExistente]);

    return previewUrl;
}
