import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";
import { prisma } from "../lib/prisma.js";
import type { Role } from "../generated/prisma/enums.js";
import { obterUsuarioPorToken } from "../services/auth.service.js";

// Estende a tipagem do Express para reconhecer req.usuario nas próximas rotas
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        nome: string;
        email: string;
        role: Role;
        cidadeId: string | null;
      };
    }
  }
}

// Helper para extrair o token do cookie
function extrairTokenCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.split("; ").find(c => c.startsWith("token="));
  const token = match?.split("=")[1];
  return token || null;
}

// Middleware que exige autenticação + roles específicas
export function verificarRole(rolesPermitidas: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extrairTokenCookie(req);

    if (!token) {
      return res.status(401).json({ message: "Não autenticado. Token ausente." });
    }

    try {
      // 1. Valida o token no Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ message: "Sessão inválida ou expirada." });
      }

      // 2. Busca o usuário e seu role atual no Prisma
      const usuario = await prisma.usuario.findUnique({
        where: { id: user.id },
      });

      if (!usuario) {
        return res.status(401).json({ message: "Usuário não encontrado no sistema." });
      }

      // 3. Valida se o cargo (role) do usuário está entre os permitidos
      if (!rolesPermitidas.includes(usuario.role)) {
        return res.status(403).json({
          message: "Acesso negado. Você não tem permissão para realizar esta ação."
        });
      }

      // 4. Injeta os dados do usuário na requisição para uso posterior se necessário
      req.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        cidadeId: usuario.cidadeId,
      };

      next();
    } catch (err) {
      console.error("Erro no middleware de autenticação/role:", err);
      return res.status(500).json({ message: "Erro interno ao validar permissões." });
    }
  };
}

export async function autenticarOpcional(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = extrairTokenCookie(req);

  // Visitante sem login: continua normalmente.
  if (!token) {
    return next();
  }

  try {
    const usuario = await obterUsuarioPorToken(token);

    req.usuario = usuario;
  } catch {
    // Cookie inválido ou sessão expirada:
    // a rota pública continua acessível.
  }

  return next();
}