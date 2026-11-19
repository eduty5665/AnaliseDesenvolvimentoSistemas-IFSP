import z from "zod";
import { Role } from "../generated/prisma/enums.js";

export const usuarioSchema = z.object({
  nome: z.string(),
  email: z.string().email(),
  role: z.enum(Role),
  telefone: z.string().optional().default(''),
  cidadeId: z.string().optional().default(''),
});
