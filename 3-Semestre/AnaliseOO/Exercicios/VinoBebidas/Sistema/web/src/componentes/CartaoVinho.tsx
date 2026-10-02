import { Link } from 'react-router'
import { Plus, Star } from 'lucide-react'
import type { Vinho } from '../api/tipos'
import { useCarrinho } from '../estado/carrinho'
import { brl } from './formato'
import { Garrafa } from './Garrafa'

export function CartaoVinho({ vinho }: { vinho: Vinho }) {
  const { adicionar } = useCarrinho()
  const esgotado = vinho.disponivel <= 0
  const promo = vinho.precoPromocional != null && vinho.precoPromocional < vinho.precoVenda
  return (
    <article className="cartao group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/vinhos/${vinho.id}`} className="relative block bg-gradient-to-b from-vinho-50 to-white px-6 pt-6">
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {vinho.destaque && <span className="rounded-full bg-vinho-700 px-2.5 py-1 text-[11px] font-semibold text-white">Seleção</span>}
          {promo && <span className="rounded-full bg-ouro-500 px-2.5 py-1 text-[11px] font-semibold text-vinho-900">Oferta</span>}
        </div>
        {vinho.pontuacao && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-vinho-700 shadow-sm">
            <Star size={12} className="fill-ouro-500 text-ouro-500" /> {vinho.pontuacao} pts
          </span>
        )}
        {vinho.imagemUrl ? (
          <img src={vinho.imagemUrl} alt={vinho.nome} className="mx-auto h-56 object-contain transition group-hover:scale-105" loading="lazy" />
        ) : (
          <Garrafa cor={vinho.corCategoria} categoria={vinho.categoria} rotulo={vinho.nome} className="mx-auto h-56 transition group-hover:scale-105" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-semibold tracking-wide text-vinho-500 uppercase">
          {vinho.categoria} · {vinho.pais}
        </p>
        <Link to={`/vinhos/${vinho.id}`} className="titulo text-xl leading-tight font-bold text-tinta hover:text-vinho-700">
          {vinho.nome}
        </Link>
        <p className="line-clamp-1 text-sm text-tinta-2">
          {vinho.uva}
          {vinho.safra ? ` · ${vinho.safra}` : ''}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {promo && <p className="text-xs text-tinta-2 line-through">{brl(vinho.precoVenda)}</p>}
            <p className="text-lg font-bold text-vinho-800">{brl(vinho.precoAtual)}</p>
            <p className={`text-xs ${esgotado ? 'text-red-700' : vinho.disponivel < 6 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {esgotado ? 'Esgotado' : vinho.disponivel < 6 ? `Últimas ${vinho.disponivel} unidades` : 'Em estoque'}
            </p>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-full bg-vinho-600 text-white transition hover:bg-vinho-700 disabled:opacity-40"
            onClick={() => adicionar(vinho)}
            disabled={esgotado}
            aria-label={`Adicionar ${vinho.nome} ao carrinho`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
