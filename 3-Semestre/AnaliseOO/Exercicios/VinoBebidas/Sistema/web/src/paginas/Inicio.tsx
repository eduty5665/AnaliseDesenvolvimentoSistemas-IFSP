import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ArrowRight, Clock, MapPin, Smartphone, Truck } from 'lucide-react'
import { api } from '../api/cliente'
import type { Facetas, Pagina, Vinho } from '../api/tipos'
import { CartaoVinho } from '../componentes/CartaoVinho'
import { Garrafa } from '../componentes/Garrafa'

export function Inicio() {
  const destaques = useQuery({ queryKey: ['destaques'], queryFn: () => api<Pagina<Vinho>>('/api/catalogo?destaques=true&disponiveis=true&tamanho=8') })
  const facetas = useQuery({ queryKey: ['facetas'], queryFn: () => api<Facetas>('/api/catalogo/facetas') })

  return (
    <>
      <section className="relative overflow-hidden bg-vinho-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(158,42,75,.55),transparent_55%),radial-gradient(circle_at_10%_90%,rgba(201,162,39,.18),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="surgir">
            <p className="text-sm font-semibold tracking-[.2em] text-ouro-400 uppercase">Adega online · Catanduva</p>
            <h1 className="titulo mt-4 text-5xl leading-[1.05] font-bold md:text-6xl">Vinhos especiais,<br />do vinhedo à sua mesa.</h1>
            <p className="mt-5 max-w-lg text-lg text-vinho-100/90">
              Rótulos escolhidos por sommeliers. Compre agora ou reserve por {3} dias e retire na loja — ou receba em casa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/vinhos" className="btn-ouro px-6 py-3 text-base">Ver catálogo <ArrowRight size={18} /></Link>
              <Link to="/app" className="btn border border-white/20 px-6 py-3 text-base text-white hover:bg-white/10"><Smartphone size={18} /> Baixar o app</Link>
            </div>
          </div>
          <div className="relative hidden h-80 justify-center md:flex">
            <Garrafa cor="#7b1e3a" categoria="Tinto" className="h-80 -rotate-6 drop-shadow-2xl" />
            <Garrafa cor="#c9a227" categoria="Branco" className="-ml-10 h-72 translate-y-6 drop-shadow-2xl" />
            <Garrafa cor="#b8a06a" categoria="Espumante" className="-ml-10 h-80 rotate-6 drop-shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-8 grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3">
        {[
          { icone: Clock, titulo: 'Reserve e retire', texto: 'Segure seu vinho por 3 dias e pague só na loja.' },
          { icone: Truck, titulo: 'Entrega na região', texto: 'Em até 1 dia útil. Grátis acima de R$ 300.' },
          { icone: MapPin, titulo: 'Duas lojas', texto: 'Centro e Shopping, com adega climatizada.' },
        ].map((b) => (
          <div key={b.titulo} className="cartao relative flex items-start gap-4 p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-vinho-50 text-vinho-600"><b.icone size={20} /></div>
            <div>
              <p className="font-semibold text-tinta">{b.titulo}</p>
              <p className="text-sm text-tinta-2">{b.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {facetas.data && (
        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {facetas.data.categorias.map((c) => (
              <Link key={c.id} to={`/vinhos?categoriaId=${c.id}`} className="flex items-center gap-2 rounded-full border border-vinho-100 bg-white px-4 py-2 text-sm font-medium text-tinta hover:border-vinho-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.cor }} /> {c.nome}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-vinho-500 uppercase">Seleção do sommelier</p>
            <h2 className="titulo text-4xl font-bold text-vinho-800">Destaques da adega</h2>
          </div>
          <Link to="/vinhos" className="hidden text-sm font-semibold text-vinho-600 hover:underline sm:block">Ver todos →</Link>
        </div>
        {destaques.isError && <ErroCarregamento />}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {destaques.isPending && Array.from({ length: 4 }).map((_, i) => <div key={i} className="cartao h-96 animate-pulse" />)}
          {destaques.data?.itens.map((v) => <CartaoVinho key={v.id} vinho={v} />)}
        </div>
      </section>
    </>
  )
}

export function ErroCarregamento({ mensagem }: { mensagem?: string }) {
  return (
    <div className="cartao p-6 text-center text-tinta-2">
      {mensagem ?? 'Não foi possível carregar os vinhos agora.'} Verifique se a API (<code>VinoBebidas.Api</code>) está em execução.
    </div>
  )
}
