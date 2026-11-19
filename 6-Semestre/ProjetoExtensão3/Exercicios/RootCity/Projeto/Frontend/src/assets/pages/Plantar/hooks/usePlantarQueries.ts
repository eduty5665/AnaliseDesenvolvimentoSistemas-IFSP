import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../services/queryKeys";
import { listarCidadesAtivas } from "../../../../services/cidadeService";
import { listarArvoresCidade } from "../../../../services/arvoreService";
import {
    atualizarRequisicao,
    cadastrarRequisicao,
} from "../../../../services/requisicaoService";
import type { Arvore, Cidade } from "../../../../types";

export function usePlantarQueries(cidadeId?: string) {
    const queryClient = useQueryClient();

    const cidadesQuery = useQuery<Cidade[]>({
        queryKey: queryKeys.cidades.ativas,
        queryFn: listarCidadesAtivas,
        staleTime: 1000 * 60 * 10, // 10 minutos
    });

    const arvoresQuery = useQuery<Arvore[]>({
        queryKey: queryKeys.arvores.porCidade(cidadeId || ""),
        queryFn: () => listarArvoresCidade(cidadeId!),
        enabled: Boolean(cidadeId),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const cadastrarMutation = useMutation({
        mutationFn: (formData: FormData) => cadastrarRequisicao(formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.requisicoes.minhas,
            });
        },
    });

    const atualizarMutation = useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
            atualizarRequisicao(id, formData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.requisicoes.minhas,
            });
        },
    });

    const invalidarMinhasRequisicoes = async () => {
        await queryClient.invalidateQueries({
            queryKey: queryKeys.requisicoes.minhas,
        });
    };

    return {
        cidades: cidadesQuery.data ?? [],
        carregandoCidades: cidadesQuery.isLoading,
        erroCidades: cidadesQuery.error,
        arvores: arvoresQuery.data ?? [],
        carregandoArvores: arvoresQuery.isLoading,
        cadastrarMutation,
        atualizarMutation,
        invalidarMinhasRequisicoes,
        queryClient,
    };
}
