import z from "zod";
import { TipoAtendimento } from "../generated/prisma/enums.js";

export const requisicaoSchema = z.object({
    criadoPorId: z.string(),
    cidadeId: z.string(),
    arvoreId: z.string(),
    nomeBeneficiario: z.string(),
    telefoneBeneficiario: z.string(),
    emailBeneficiario: z.string().optional(),

    tipoAtendimento: z
        .enum(["RETIRADA_LOCAL", "PLANTIO_AGENDADO"])
        .transform((valor) =>
            valor === "RETIRADA_LOCAL"
                ? TipoAtendimento.RETIRADA_LOCAL
                : TipoAtendimento.PLANTIO_AGENDADO
        ),

    rua: z.string().min(1, "A rua é obrigatória"),
    numero: z.string().min(1, "O número é obrigatório"),
    bairro: z.string().min(1, "O bairro é obrigatório"),
    cidadeEndereco: z.string().min(1, "A cidade é obrigatória"),
    cep: z.string().min(8, "CEP inválido"),
    estado: z.string().length(2, "O estado deve possuir 2 caracteres"),
    pontoReferencia: z.string().optional(),
    observacaoStatus: z.string().optional(),
})