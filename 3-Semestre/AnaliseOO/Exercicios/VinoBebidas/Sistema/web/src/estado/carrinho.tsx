import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Vinho } from '../api/tipos'

export type ItemCarrinho = { vinho: Vinho; quantidade: number }

type Ctx = {
  itens: ItemCarrinho[]
  quantidadeTotal: number
  subtotal: number
  adicionar: (v: Vinho, q?: number) => void
  alterar: (id: number, q: number) => void
  remover: (id: number) => void
  limpar: () => void
}

const CarrinhoCtx = createContext<Ctx | null>(null)
const CHAVE = 'vino.carrinho'

function carregar(): ItemCarrinho[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as ItemCarrinho[]
  } catch {
    return []
  }
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens))
    } catch {
      /* ignora */
    }
  }, [itens])

  const valor = useMemo<Ctx>(() => {
    const limitar = (v: Vinho, q: number) => Math.max(1, Math.min(q, Math.max(1, Math.min(48, v.disponivel))))
    return {
      itens,
      quantidadeTotal: itens.reduce((s, i) => s + i.quantidade, 0),
      subtotal: itens.reduce((s, i) => s + i.quantidade * i.vinho.precoAtual, 0),
      adicionar: (v, q = 1) =>
        setItens((atual) => {
          const existente = atual.find((i) => i.vinho.id === v.id)
          if (existente) return atual.map((i) => (i.vinho.id === v.id ? { vinho: v, quantidade: limitar(v, i.quantidade + q) } : i))
          return [...atual, { vinho: v, quantidade: limitar(v, q) }]
        }),
      alterar: (id, q) => setItens((atual) => atual.map((i) => (i.vinho.id === id ? { ...i, quantidade: limitar(i.vinho, q) } : i))),
      remover: (id) => setItens((atual) => atual.filter((i) => i.vinho.id !== id)),
      limpar: () => setItens([]),
    }
  }, [itens])

  return <CarrinhoCtx.Provider value={valor}>{children}</CarrinhoCtx.Provider>
}

export function useCarrinho() {
  const c = useContext(CarrinhoCtx)
  if (!c) throw new Error('CarrinhoProvider ausente')
  return c
}
