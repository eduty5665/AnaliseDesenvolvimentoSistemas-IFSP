export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },

    cidades: {
        todas: ['cidades'] as const,
        ativas: ['cidades', 'ativas'] as const,
        porUsuario: ['cidades', 'usuario'] as const,
    },

    arvores: {
        todas: ['arvores'] as const,
        porCidade: (cidadeId: string) => ['arvores', 'cidade', cidadeId] as const,
    },

    requisicoes: {
        todas: (inicio?: string, fim?: string) => ['requisicoes', { inicio, fim }] as const,
        porCidade: (cidadeId: string, inicio?: string, fim?: string) => ['requisicoes', 'cidade', cidadeId, { inicio, fim }] as const,
        minhas: ['requisicoes', 'minhas'] as const
    },

    publicacoes: {
        infinitas: (filtros: { cidadeFiltro: string; minhasPublicacoes: boolean }) => ['publicacoes', 'feed', filtros] as const,
    },

    usuarios: {
        todos: ['usuarios'] as const,
        porCidade: (cidadeId: string, role?: string) => ['usuarios', 'cidade', cidadeId, role] as const,
        roles: ['usuarios', 'roles'] as const,
    },
    
    relatorios: {
        porCidade: ( inicio: string, fim: string, cidadeId?: string | null,) =>
            ['relatorios', cidadeId, { inicio, fim }] as const,
    },

    enderecos: {
        todos: ['enderecos'] as const,
        porCidade: (cidadeId: string) => ['enderecos', 'cidade', cidadeId] as const,
    }
}