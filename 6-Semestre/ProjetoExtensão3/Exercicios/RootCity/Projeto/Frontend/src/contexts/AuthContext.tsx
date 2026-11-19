import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Usuario } from "../types";
import {
    login as loginService,
    logout as logoutService,
    obterUsuarioLogado
} from "../services/authService";

interface AuthContextType {
    usuario: Usuario | null;
    carregando: boolean;
    login: (email: string, senha: string) => Promise<Usuario>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [carregando, setCarregando] = useState(true);

    // Ao iniciar/dar F5 na aplicação, verifica a sessão através do cookie httpOnly
    useEffect(() => {
        async function carregarSessao() {
            try {
                const resposta = await obterUsuarioLogado();
                setUsuario(resposta.usuario);
            } catch {
                setUsuario(null);
            } finally {
                setCarregando(false);
            }
        }
        carregarSessao();
    }, []);

    async function login(email: string, senha: string): Promise<Usuario> {
        const resposta = await loginService(email, senha);
        setUsuario(resposta.usuario);
        return resposta.usuario;
    }

    async function logout() {
        try {
            await logoutService();
        } catch (e) {
            console.error("Erro ao fazer logout");
        } finally {
            setUsuario(null);
        }
    }

    return (
        <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}