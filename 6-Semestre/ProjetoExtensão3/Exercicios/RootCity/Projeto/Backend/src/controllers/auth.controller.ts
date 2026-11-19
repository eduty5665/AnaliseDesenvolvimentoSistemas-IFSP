import type { Request, Response } from "express";
import { cadastroSchema, loginSchema } from "../schemas/auth.schema.js";
import { autenticarUsuario, cadastrarUsuario, obterUsuarioPorToken } from "../services/auth.service.js";

// Helper para extrair o cookie mesmo sem a lib cookie-parser
function extrairTokenCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.split("; ").find(c => c.startsWith("token="));
  const token = match?.split("=")[1];
  return token || null;
}

export async function cadastrar(
  req: Request,
  res: Response
) {
  const dados = cadastroSchema.safeParse(req.body);

  if (!dados.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: dados.error.flatten()
    });
  }

  try {
    const resultado = await cadastrarUsuario(
      dados.data.nome,
      dados.data.email,
      dados.data.senha
    );

    return res.status(201).json(resultado);

  } catch (error) {

    return res.status(500).json({
      message: error instanceof Error
        ? error.message
        : "Erro interno do servidor"
    });
  }
}


export async function login(
  req: Request,
  res: Response
) {
  //verifica se são dados válidos com zod (em schemas)
  const dados = loginSchema.safeParse(req.body);

  if (!dados.success) {
    //Bad request (400)
    return res.status(400).json({
      message: "Dados inválidos",
      errors: dados.error.flatten()
    });
  }

  try {
    const resultado = await autenticarUsuario(
      dados.data.email,
      dados.data.senha
    );

    // Grava o cookie httpOnly seguro no navegador
    res.cookie("token", resultado.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Só envia cookie em https em produção
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    //Success(200)
    return res.status(200).json({ usuario: resultado.usuario });

  } catch (error: any) {
    console.error("ERRO NO LOGIN:", error);
    return res.status(401).json({
      message: "Email ou senha incorretos"
    });
  }
}

// Retorna o usuário logado com base no cookie enviado
export async function me(req: Request, res: Response) {
  const token = extrairTokenCookie(req);

  if (!token) {
    return res.status(401).json({ message: "Não autenticado" })
  }

  try {
    const usuario = await obterUsuarioPorToken(token);
    return res.status(200).json({ usuario });
  } catch (error) {
    return res.status(401).json({ message: "Sessão inválida. É necessário fazer login!" })
  }
}

//Faz logout limpando cookie
export async function logout(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })
  return res.status(200).json({ message: "Logout realizado com sucesso" });
}