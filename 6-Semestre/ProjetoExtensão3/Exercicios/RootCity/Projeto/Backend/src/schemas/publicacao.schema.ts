import z from "zod";

export const publicacaoSchema = z.object({
    idRequisicao: z.string(),
    titulo: z.string().min(1, "O nome é obrigatório"),
    descricao: z.string().optional().default(''),
})