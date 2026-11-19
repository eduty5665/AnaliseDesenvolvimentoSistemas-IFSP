import { supabase } from "../lib/supabase.js";
import { prisma } from "../lib/prisma.js";

export async function cadastrarUsuario(
    nome: string,
    email: string,
    senha: string
) {
    const emailExistente = await prisma.usuario.findUnique({
        where: {email: email.toLowerCase()}
    })
    
    if (emailExistente) {
        throw new Error("Este e-mail já está cadastrado.");
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password: senha
    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error("Usuário não criado");
    }

    await prisma.usuario.create({
        data: {
            id: data.user.id,
            nome: nome,
            email: data.user.email!
        }
    });

    return {
        id: data.user.id,
        email: data.user.email
    };
}

export async function autenticarUsuario(
    email: string,
    senha: string
) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password: senha
        });

    if (error) {
        throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error("Usuário não encontrado");
    }

    const usuario = await prisma.usuario.findUnique({
        where: {
            id: data.user.id
        }
    })

    if (!usuario) {
        throw new Error("Usuário não cadastrado no sistema");
    }

    return {
        session: data.session,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            telefone: usuario.telefone,
            role: usuario.role,
            cidadeId: usuario.cidadeId
        }
    }

}

export async function obterUsuarioPorToken(token: string){
    const { data : {user}, error} = await supabase.auth.getUser(token);

    if(error || !user){
        throw new Error("Sessão inválida ou expirada");
    }

    const usuario = await prisma.usuario.findUnique({
        where: {id: user.id}
    })

    if(!usuario){
        throw new Error("Usuário não encontrado")
    }

    return{
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        role: usuario.role,
        cidadeId: usuario.cidadeId
    };
}