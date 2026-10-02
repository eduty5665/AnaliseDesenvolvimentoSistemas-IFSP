import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { api } from '../api/cliente'
import type { Facetas, Pagina, Vinho } from '../api/tipos'
import { CartaoVinho } from '../componentes/CartaoVinho'
import { ErroCarregamento } from './Inicio'

const ORDENS = [
  { valor: '', rotulo: 'Relevância' },
  { valor: 'preco', rotulo: 'Menor preço' },
  { valor: 'preco_desc', rotulo: 'Maior preço' },
  { valor: 'pontuacao', rotulo: 'Melhor pontuação' },
  { valor: 'safra', rotulo: 'Safra mais recente' },
  { valor: 'nome', rotulo: 'Nome A–Z' },
]

export function Catalogo() {
  const [params, setParams] = useSearchParams()
  const [busca, setBusca] = useState(params.get('busca') ?? '')
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const facetas = useQuery({ queryKey: ['facetas'], queryFn: () => api<Facetas>('/api/catalogo/facetas') })

  const qs = new URLSearchParams(params)
  if (!qs.get('tamanho')) qs.set('tamanho', '24')
  const lista = useQuery({
    queryKey: ['catalogo', qs.toString()],
    queryFn: () => api<Pagina<Vinho>>(`/api/catalogo?${qs.toString()}`),
    placeholderData: keepPreviousData,
  })

  const definir = (chave: string, valor: string | null) => {
    const novo = new URLSearchParams(params)
    if (valor) novo.set(chave, valor)
    else novo.delete(chave)
    if (chave !== 'pagina') novo.delete('pagina')
    setParams(novo)
  }

  const pagina = Number(params.get('pagina') ?? 1)
  const totalPaginas = lista.data ? Math.ceil(lista.data.total / lista.data.tamanhoPagina) : 1

  const filtros = (
    <div className="space-y-5">
      <div>
        <span className="rotulo">Tipo</span>
        <div className="flex flex-wrap gap-2">
          <Chip ativo={!params.get('categoriaId')} onClick={() => definir('categoriaId', null)}>Todos</Chip>
          {facetas.data?.categorias.map((c) => (
            <Chip key={c.id} ativo={params.get('categoriaId') === String(c.id)} onClick={() => definir('categoriaId', String(c.id))}>
              <span className="h-2 w-2 rounded-full" style={{ background: c.cor }} /> {c.nome}
            </Chip>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="rotulo">País</span>
        <select className="campo" value={params.get('pais') ?? ''} onChange={(e) => definir('pais', e.target.value || null)}>
          <option value="">Todos</option>
          {facetas.data?.paises.map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="rotulo">Uva</span>
        <select className="campo" value={params.get('uva') ?? ''} onChange={(e) => definir('uva', e.target.value || null)}>
          <option value="">Todas</option>
          {facetas.data?.uvas.map((u) => <option key={u}>{u}</option>)}
        </select>
      </label>
      <div>
        <span className="rotulo">Faixa de preço</span>
        <div className="flex gap-2">
          <input className="campo" type="number" min={0} placeholder="Mín." defaultValue={params.get('precoMin') ?? ''}
            onBlur={(e) => definir('precoMin', e.target.value || null)} aria-label="Preço mínimo" />
          <input className="campo" type="number" min={0} placeholder="Máx." defaultValue={params.get('precoMax') ?? ''}
            onBlur={(e) => definir('precoMax', e.target.value || null)} aria-label="Preço máximo" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-vinho-600" checked={params.get('disponiveis') === 'true'} onChange={(e) => definir('disponiveis', e.target.checked ? 'true' : null)} />
        Somente disponíveis
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-vinho-600" checked={params.get('destaques') === 'true'} onChange={(e) => definir('destaques', e.target.checked ? 'true' : null)} />
        Seleção do sommelier
      </label>
      <button className="text-sm font-semibold text-vinho-600 hover:underline" onClick={() => { setBusca(''); setParams(new URLSearchParams()) }}>
        Limpar filtros
      </button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="titulo text-5xl font-bold text-vinho-800">Nossos vinhos</h1>
          <p className="mt-1 text-tinta-2">{lista.data ? `${lista.data.total} rótulos encontrados` : 'Carregando...'}</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <form className="relative flex-1 sm:w-80" onSubmit={(e) => { e.preventDefault(); definir('busca', busca.trim() || null) }}>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-2" />
            <input className="campo pl-10" placeholder="Buscar vinho, uva, produtor..." value={busca} onChange={(e) => setBusca(e.target.value)} />
          </form>
          <select className="campo w-auto" value={params.get('ordem') ?? ''} onChange={(e) => definir('ordem', e.target.value || null)} aria-label="Ordenar">
            {ORDENS.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
          </select>
          <button className="btn-contorno md:hidden" onClick={() => setFiltrosAbertos(!filtrosAbertos)} aria-label="Filtros"><SlidersHorizontal size={16} /></button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className={`${filtrosAbertos ? 'block' : 'hidden'} cartao h-fit p-5 md:block md:sticky md:top-24`}>{filtros}</aside>
        <div className={lista.isPlaceholderData ? 'opacity-60 transition' : 'transition'}>
          {lista.isError && <ErroCarregamento />}
          {lista.data?.itens.length === 0 && <div className="cartao p-10 text-center text-tinta-2">Nenhum vinho com esses filtros.</div>}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {lista.isPending && Array.from({ length: 6 }).map((_, i) => <div key={i} className="cartao h-96 animate-pulse" />)}
            {lista.data?.itens.map((v) => <CartaoVinho key={v.id} vinho={v} />)}
          </div>
          {totalPaginas > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button className="btn-contorno" disabled={pagina <= 1} onClick={() => definir('pagina', String(pagina - 1))}>Anterior</button>
              <span className="text-sm text-tinta-2">Página {pagina} de {totalPaginas}</span>
              <button className="btn-contorno" disabled={pagina >= totalPaginas} onClick={() => definir('pagina', String(pagina + 1))}>Próxima</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${ativo ? 'border-vinho-600 bg-vinho-600 text-white' : 'border-vinho-100 bg-white text-tinta hover:border-vinho-300'}`}>
      {children}
    </button>
  )
}
