// Mesma API central usada pela loja web e pelo ERP (endpoints públicos de catálogo).

export type Categoria = { id: number; nome: string; cor: string }
export type Vinho = {
  id: number
  sku: string
  nome: string
  descricao?: string | null
  categoria: string
  corCategoria: string
  produtor?: string | null
  pais?: string | null
  regiao?: string | null
  uva?: string | null
  safra?: number | null
  teorAlcoolico?: number | null
  volumeMl: number
  harmonizacao?: string | null
  temperaturaServico?: string | null
  pontuacao?: number | null
  precoVenda: number
  precoPromocional?: number | null
  precoAtual: number
  destaque: boolean
  disponivel: number
}
export type Pagina<T> = { itens: T[]; total: number }
export type Facetas = { categorias: Categoria[]; paises: string[] }

let base = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '')

export const obterServidor = () => base
export const definirServidor = (url: string) => {
  base = url.trim().replace(/\/$/, '')
  if (base && !/^https?:\/\//.test(base)) base = `http://${base}`
}

async function get<T>(caminho: string): Promise<T> {
  if (!base) throw new Error('Informe o endereço do servidor.')
  const controle = new AbortController()
  const tempo = setTimeout(() => controle.abort(), 12000)
  try {
    const r = await fetch(`${base}${caminho}`, { signal: controle.signal, headers: { Accept: 'application/json' } })
    if (!r.ok) throw new Error(`Servidor respondeu ${r.status}`)
    return (await r.json()) as T
  } catch (e) {
    const err = e as Error
    throw new Error(err.name === 'AbortError' ? 'Tempo esgotado ao falar com o servidor.' : err.message)
  } finally {
    clearTimeout(tempo)
  }
}

export const buscarVinhos = (p: { busca?: string; categoriaId?: number | null; ordem?: string }) => {
  const q = new URLSearchParams({ tamanho: '100' })
  if (p.busca) q.set('busca', p.busca)
  if (p.categoriaId) q.set('categoriaId', String(p.categoriaId))
  if (p.ordem) q.set('ordem', p.ordem)
  return get<Pagina<Vinho>>(`/api/catalogo?${q}`)
}
export const buscarFacetas = () => get<Facetas>('/api/catalogo/facetas')

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const brl = (v: number) => fmt.format(v)
