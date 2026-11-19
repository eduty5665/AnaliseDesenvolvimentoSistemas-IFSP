
export interface EnderecoViaCep {
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export const buscarCep = async (
    cep: string,
    signal?: AbortSignal
): Promise<EnderecoViaCep> => {

    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
        throw new Error("CEP inválido.");
    }

    const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
        { signal }
    );

    if (!resposta.ok) {
        throw new Error("Erro ao consultar o CEP.");
    }

    const dados: EnderecoViaCep = await resposta.json();

    if (dados.erro) {
        throw new Error("CEP não encontrado.");
    }

    return dados;
};
