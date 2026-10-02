import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { gravarSessao, lerSessao, type TipoArea } from '../api/cliente'
import type { Sessao } from '../api/tipos'

type Ctx = {
  cliente: Sessao | null
  admin: Sessao | null
  entrar: (area: TipoArea, s: Sessao) => void
  sair: (area: TipoArea) => void
}

const SessaoCtx = createContext<Ctx | null>(null)

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState(() => lerSessao('cliente'))
  const [admin, setAdmin] = useState(() => lerSessao('admin'))

  const entrar = useCallback((area: TipoArea, s: Sessao) => {
    gravarSessao(area, s)
    if (area === 'cliente') setCliente(s)
    else setAdmin(s)
  }, [])

  const sair = useCallback((area: TipoArea) => {
    gravarSessao(area, null)
    if (area === 'cliente') setCliente(null)
    else setAdmin(null)
  }, [])

  const valor = useMemo(() => ({ cliente, admin, entrar, sair }), [cliente, admin, entrar, sair])
  return <SessaoCtx.Provider value={valor}>{children}</SessaoCtx.Provider>
}

export function useSessao() {
  const c = useContext(SessaoCtx)
  if (!c) throw new Error('SessaoProvider ausente')
  return c
}

/** Perfis com acesso ao painel (espelha a política "gestao" da API). */
export const PERFIS_PAINEL = ['Administrador', 'Gerente', 'DiretorFinanceiro']
