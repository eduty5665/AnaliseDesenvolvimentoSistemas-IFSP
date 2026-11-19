import z from "zod";

export const cidadeSchema = z.object({
    nome: z.string().min(1, "O nome é obrigatório"),
    uf: z.string().min(2, "O estado é obrigatório"),
    permiteEntrega: z.boolean(),
})