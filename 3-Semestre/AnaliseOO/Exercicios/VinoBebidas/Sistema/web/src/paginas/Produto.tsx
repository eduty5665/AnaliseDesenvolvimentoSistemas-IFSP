import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, CalendarClock, Grape, MapPin, Minus, Plus, ShoppingBag, Star, Thermometer, UtensilsCrossed } from 'lucide-react'
import { api } from '../api/cliente'
import type { Vinho } from '../api/tipos'
import { useCarrinho } from '../estado/carrinho'
import { brl, num } from '../componentes/formato'
import { Garrafa } from '../componentes/Garrafa'
import { ErroCarregamento } from './Inicio'

export function Produto() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { adicionar } = useCarrinho()
  const [qtd, setQtd] = useState(1)
  const [adicionado, setAdicionado] = useState(false)
  const q = useQuery({ queryKey: ['vinho', id], queryFn: () => api<Vinho>(`/api/catalogo/${id}`) })

  if (q.isError) return <div className="mx-auto max-w-3xl px-4 py-16"><ErroCarregamento mensagem="Vinho não encontrado." /></div>
  if (!q.data) return <div className="mx-auto max-w-6xl px-4 py-16"><div className="cartao h-[480px] animate-pulse" /></div>

  const v = q.data
  const esgotado = v.disponivel <= 0
  const promo = v.precoPromocional != null && v.precoPromocional < v.precoVenda
  const ficha = [
    { icone: Grape, rotulo: 'Uva', valor: v.uva },
    { icone: MapPin, rotulo: 'Origem', valor: [v.regiao, v.pais].filter(Boolean).join(', ') },
    { icone: CalendarClock, rotulo: 'Safra', valor: v.safra ? String(v.safra) : 'Não safrado' },
    { icone: Thermometer, rotulo: 'Serviço', valor: v.temperaturaServico },
    { icone: UtensilsCrossed, rotulo: 'Harmoniza com', valor: v.harmonizacao },
  ].filter((f) => f.valor)

  const comprar = (irParaCarrinho: boolean) => {
    adicionar(v, qtd)
    if (irParaCarrinho) navegar('/carrinho')
    else {
      setAdicionado(true)
      setTimeout(() => setAdicionado(false), 2200)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/vinhos" className="inline-flex items-center gap-1 text-sm font-medium text-vinho-600 hover:underline"><ArrowLeft size={16} /> Voltar ao catálogo</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.1fr]">
        <div className="cartao grid place-items-center bg-gradient-to-b from-vinho-50 to-white p-10">
          {v.imagemUrl ? <img src={v.imagemUrl} alt={v.nome} className="h-[420px] object-contain" /> : <Garrafa cor={v.corCategoria} categoria={v.categoria} rotulo={v.nome} className="h-[420px] drop-shadow-xl" />}
        </div>
        <div className="surgir">
          <p className="text-sm font-semibold tracking-widest text-vinho-500 uppercase">{v.categoria} · {v.produtor}</p>
          <h1 className="titulo mt-2 text-5xl leading-tight font-bold text-vinho-800">{v.nome}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-tinta-2">
            {v.pontuacao && <span className="flex items-center gap-1 font-semibold text-vinho-700"><Star size={15} className="fill-ouro-500 text-ouro-500" /> {v.pontuacao} pontos</span>}
            <span>{v.volumeMl} ml</span>
            {v.teorAlcoolico && <span>{num(v.teorAlcoolico, 1)}% vol.</span>}
            <span>SKU {v.sku}</span>
          </div>
          {v.descricao && <p className="mt-5 text-lg leading-relaxed text-tinta">{v.descricao}</p>}

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {ficha.map((f) => (
              <div key={f.rotulo} className="flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-vinho-100">
                <f.icone size={18} className="mt-0.5 text-vinho-500" />
                <div><dt className="text-xs font-semibold text-tinta-2 uppercase">{f.rotulo}</dt><dd className="text-sm font-medium">{f.valor}</dd></div>
              </div>
            ))}
          </dl>

          <div className="cartao mt-6 p-5">
            <div className="flex items-end justify-between">
              <div>
                {promo && <p className="text-sm text-tinta-2 line-through">{brl(v.precoVenda)}</p>}
                <p className="text-3xl font-bold text-vinho-800">{brl(v.precoAtual)}</p>
              </div>
              <p className={`text-sm font-medium ${esgotado ? 'text-red-700' : 'text-emerald-700'}`}>
                {esgotado ? 'Esgotado no momento' : `${v.disponivel} disponíveis`}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-vinho-100 bg-white">
                <button className="p-2.5 text-vinho-700" onClick={() => setQtd(Math.max(1, qtd - 1))} aria-label="Diminuir"><Minus size={16} /></button>
                <span className="w-8 text-center font-semibold">{qtd}</span>
                <button className="p-2.5 text-vinho-700" onClick={() => setQtd(Math.min(v.disponivel, qtd + 1))} aria-label="Aumentar"><Plus size={16} /></button>
              </div>
              <button className="btn-primario flex-1" disabled={esgotado} onClick={() => comprar(true)}><ShoppingBag size={18} /> Comprar ou reservar</button>
              <button className="btn-contorno" disabled={esgotado} onClick={() => comprar(false)}>{adicionado ? 'Adicionado ✓' : 'Adicionar'}</button>
            </div>
            <p className="mt-3 text-xs text-tinta-2">No carrinho você escolhe: comprar agora ou reservar por 3 dias, com entrega ou retirada na loja.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
