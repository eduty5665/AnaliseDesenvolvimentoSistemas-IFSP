import z from "zod";

export const enderecoSchema = z.object({
    rua: z.string().min(1, "A rua é obrigatória"),
    numero: z.string().min(1, "O número é obrigatório"),
    bairro: z.string().min(1, "O bairro é obrigatório"),
    cep: z.string().optional(),
    pontoReferencia: z.string().optional(),
    idCidade: z.string().optional(),
})