import z from "zod";

export const arvoreSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório"),
    descricao: z.string().optional().default(''),
    quantidade: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val) && val >= 0, "Quantidade inválida"),
    cidadeId: z.string(),
})