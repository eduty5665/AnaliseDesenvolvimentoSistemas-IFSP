
export const formatarCep = (valor: string): string => {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    return numeros.replace(/^(\d{5})(\d)/, "$1-$2");
};

export const formatarTelefone = (valor: string): string => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 10) {
        return numeros
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numeros
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
};

export const formatarData = (data: string | null | undefined) => {
    if (!data) return "Não informado";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        return "Data inválida";
    }

    return dataConvertida.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

export const formatarDataAgendamento = (
    valor: string | null | undefined
) => {
    if (!valor) return "Não informado";

    const data = valor.slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return "Data inválida";
    }

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
};

export const formatarTipoAtendimento = (tipo: string) => {
    switch (tipo) {
        case "PLANTIO_AGENDADO":
            return "Plantio agendado";

        case "RETIRADA_LOCAL":
            return "Retirada no local";

        default:
            return tipo.replaceAll("_", " ");
    }
};

export const formatarStatus = (status: string) => {
    switch (status) {
        case "SOLICITADO":
            return "Solicitado";

        case "APROVADO":
            return "Aprovado";

        case "RECUSADO":
            return "Recusado";

        case "CONCLUIDO":
            return "Concluído";

        case "AGUARDANDO_RETIRADA":
            return "Aguardando retirada";

        case "AGENDADO_PLANTIO":
            return "Plantio agendado";

        default:
            return status;
    }
};
