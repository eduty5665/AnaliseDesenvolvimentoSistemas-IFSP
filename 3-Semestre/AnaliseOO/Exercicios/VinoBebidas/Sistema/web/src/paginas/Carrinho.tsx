import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CalendarClock, Minus, Plus, ShoppingBag, Store, Trash2, Truck } from 'lucide-react'
import { api, ErroApi } from '../api/cliente'
import type { Cliente, CriarPedido, Endereco, FormaPagamento, Frete, Loja, Modalidade, Pedido, TipoPedido } from '../api/tipos'
import { useCarrinho } from '../estado/carrinho'
import { useSessao } from '../estado/sessao'
import { brl, textoPagamento } from '../componentes/formato'
import { Garrafa } from '../componentes/Garrafa'

export function Carrinho() {
  const { itens, subtotal, alterar, remover, limpar } = useCarrinho()
  const { cliente } = useSessao()
  const navegar = useNavigate()
  const qc = useQueryClient()

  const [tipo, setTipo] = useState<TipoPedido>('Compra')
  const [modalidade, setModalidade] = useState<Modalidade>('Retirada')
  const [lojaId, setLojaId] = useState<number | null>(null)
  const [pagamento, setPagamento] = useState<FormaPagamento>('Pix')
  const [endereco, setEndereco] = useState<Endereco>({ cidade: 'Catanduva', uf: 'SP' })
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const lojas = useQuery({ queryKey: ['lojas'], queryFn: () => api<Loja[]>('/api/catalogo/lojas') })
  const conta = useQuery({ queryKey: ['minha-conta'], queryFn: () => api<Cliente>('/api/minha-conta', { area: 'cliente' }), enabled: !!cliente })
  const frete = useQuery({
    queryKey: ['frete', subtotal],
    queryFn: () => api<Frete>(`/api/catalogo/frete?subtotal=${subtotal.toFixed(2)}`),
    enabled: modalidade === 'Entrega' && subtotal > 0,
  })

  useEffect(() => {
    if (lojaId == null && lojas.data?.length) setLojaId(lojas.data[0].id)
  }, [lojas.data, lojaId])
  useEffect(() => {
    if (conta.data?.endereco?.logradouro) setEndereco(conta.data.endereco)
  }, [conta.data])
  useEffect(() => {
    if (tipo === 'Reserva') setModalidade('Retirada')
  }, [tipo])

  const taxa = modalidade === 'Entrega' ? (frete.data?.taxa ?? 0) : 0
  const total = subtotal + taxa

  const finalizar = useMutation({
    mutationFn: (req: CriarPedido) => api<Pedido>('/api/minha-conta/pedidos', { metodo: 'POST', corpo: req, area: 'cliente' }),
    onSuccess: (p) => {
      limpar()
      qc.invalidateQueries({ queryKey: ['meus-pedidos'] })
      qc.invalidateQueries({ queryKey: ['catalogo'] })
      navegar(`/conta?novo=${p.numero}`)
    },
    onError: (e) => {
      if (e instanceof ErroApi && e.status === 401) navegar('/entrar?volta=/carrinho')
      setErro(e.message)
    },
  })

  const enviar = () => {
    setErro(null)
    if (!cliente) {
      navegar('/entrar?volta=/carrinho')
      return
    }
    finalizar.mutate({
      tipo,
      modalidade,
      formaPagamento: tipo === 'Reserva' ? 'PagamentoNaEntrega' : pagamento,
      itens: itens.map((i) => ({ produtoId: i.vinho.id, quantidade: i.quantidade })),
      depositoRetiradaId: modalidade === 'Retirada' ? lojaId : null,
      enderecoEntrega: modalidade === 'Entrega' ? endereco : null,
      observacao: observacao || null,
    })
  }

  if (itens.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto text-vinho-300" size={48} />
        <h1 className="titulo mt-4 text-4xl font-bold text-vinho-800">Seu carrinho está vazio</h1>
        <p className="mt-2 text-tinta-2">Que tal escolher um vinho para hoje?</p>
        <Link to="/vinhos" className="btn-primario mt-6">Ver vinhos</Link>
      </div>
    )

  const opcao = (ativo: boolean) =>
    `flex flex-1 items-start gap-3 rounded-2xl border p-4 text-left transition ${ativo ? 'border-vinho-600 bg-vinho-50 ring-1 ring-vinho-600' : 'border-vinho-100 bg-white hover:border-vinho-300'}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="titulo text-5xl font-bold text-vinho-800">Carrinho</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="cartao divide-y divide-vinho-50">
            {itens.map(({ vinho, quantidade }) => (
              <div key={vinho.id} className="flex items-center gap-4 p-4">
                <Garrafa cor={vinho.corCategoria} categoria={vinho.categoria} className="h-20 w-10 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link to={`/vinhos/${vinho.id}`} className="titulo text-lg leading-tight font-bold hover:text-vinho-700">{vinho.nome}</Link>
                  <p className="text-sm text-tinta-2">{brl(vinho.precoAtual)} · {vinho.categoria}</p>
                </div>
                <div className="flex items-center rounded-full border border-vinho-100">
                  <button className="p-2" onClick={() => alterar(vinho.id, quantidade - 1)} aria-label="Diminuir"><Minus size={14} /></button>
                  <span className="w-7 text-center text-sm font-semibold">{quantidade}</span>
                  <button className="p-2" onClick={() => alterar(vinho.id, quantidade + 1)} aria-label="Aumentar"><Plus size={14} /></button>
                </div>
                <p className="w-24 text-right font-semibold">{brl(vinho.precoAtual * quantidade)}</p>
                <button className="p-2 text-tinta-2 hover:text-red-700" onClick={() => remover(vinho.id)} aria-label="Remover"><Trash2 size={16} /></button>
              </div>
            ))}
          </section>

          <section className="cartao p-5">
            <h2 className="font-semibold">1. Comprar ou reservar?</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <button className={opcao(tipo === 'Compra')} onClick={() => setTipo('Compra')}>
                <ShoppingBag className="mt-0.5 text-vinho-600" size={20} />
                <span><strong className="block">Comprar agora</strong><span className="text-sm text-tinta-2">Pague online (Pix ou cartão) ou na entrega.</span></span>
              </button>
              <button className={opcao(tipo === 'Reserva')} onClick={() => setTipo('Reserva')}>
                <CalendarClock className="mt-0.5 text-vinho-600" size={20} />
                <span><strong className="block">Reservar por 3 dias</strong><span className="text-sm text-tinta-2">Separamos para você. Pague ao retirar na loja.</span></span>
              </button>
            </div>

            <h2 className="mt-6 font-semibold">2. Como quer receber?</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <button className={opcao(modalidade === 'Retirada')} onClick={() => setModalidade('Retirada')}>
                <Store className="mt-0.5 text-vinho-600" size={20} />
                <span><strong className="block">Retirar na loja</strong><span className="text-sm text-tinta-2">Sem custo · pronto em algumas horas</span></span>
              </button>
              <button className={opcao(modalidade === 'Entrega')} onClick={() => tipo === 'Compra' && setModalidade('Entrega')} disabled={tipo === 'Reserva'}>
                <Truck className="mt-0.5 text-vinho-600" size={20} />
                <span><strong className="block">Entrega</strong><span className="text-sm text-tinta-2">{tipo === 'Reserva' ? 'Indisponível para reservas' : frete.data?.descricao ?? 'Em até 1 dia útil na região'}</span></span>
              </button>
            </div>

            {modalidade === 'Retirada' ? (
              <label className="mt-4 block">
                <span className="rotulo">Loja</span>
                <select className="campo" value={lojaId ?? ''} onChange={(e) => setLojaId(Number(e.target.value))}>
                  {lojas.data?.map((l) => <option key={l.id} value={l.id}>{l.nome} — {l.endereco}</option>)}
                </select>
              </label>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-6">
                <Campo classe="sm:col-span-2" rotulo="CEP" valor={endereco.cep} mudar={(cep) => setEndereco({ ...endereco, cep })} />
                <Campo classe="sm:col-span-4" rotulo="Rua" valor={endereco.logradouro} mudar={(logradouro) => setEndereco({ ...endereco, logradouro })} />
                <Campo classe="sm:col-span-2" rotulo="Número" valor={endereco.numero} mudar={(numero) => setEndereco({ ...endereco, numero })} />
                <Campo classe="sm:col-span-4" rotulo="Complemento" valor={endereco.complemento} mudar={(complemento) => setEndereco({ ...endereco, complemento })} />
                <Campo classe="sm:col-span-3" rotulo="Bairro" valor={endereco.bairro} mudar={(bairro) => setEndereco({ ...endereco, bairro })} />
                <Campo classe="sm:col-span-2" rotulo="Cidade" valor={endereco.cidade} mudar={(cidade) => setEndereco({ ...endereco, cidade })} />
                <Campo classe="sm:col-span-1" rotulo="UF" valor={endereco.uf} mudar={(uf) => setEndereco({ ...endereco, uf })} />
              </div>
            )}

            {tipo === 'Compra' && (
              <>
                <h2 className="mt-6 font-semibold">3. Pagamento</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['Pix', 'CartaoCredito', 'CartaoDebito', 'PagamentoNaEntrega'] as FormaPagamento[]).map((f) => (
                    <button key={f} onClick={() => setPagamento(f)}
                      className={`rounded-full border px-4 py-2 text-sm ${pagamento === f ? 'border-vinho-600 bg-vinho-600 text-white' : 'border-vinho-100 bg-white'}`}>
                      {textoPagamento[f]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-tinta-2">Ambiente acadêmico: o pagamento online é simulado como aprovado.</p>
              </>
            )}
            <label className="mt-5 block">
              <span className="rotulo">Observação (opcional)</span>
              <input className="campo" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: embalar para presente" />
            </label>
          </section>
        </div>

        <aside className="cartao h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold">Resumo</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-tinta-2">Subtotal</dt><dd>{brl(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-tinta-2">{modalidade === 'Entrega' ? 'Entrega' : 'Retirada'}</dt><dd>{taxa === 0 ? 'Grátis' : brl(taxa)}</dd></div>
            <div className="flex justify-between border-t border-vinho-100 pt-3 text-lg font-bold text-vinho-800"><dt>Total</dt><dd>{brl(total)}</dd></div>
          </dl>
          {erro && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
          <button className="btn-primario mt-5 w-full py-3 text-base" onClick={enviar} disabled={finalizar.isPending}>
            {finalizar.isPending ? 'Enviando...' : !cliente ? 'Entrar para finalizar' : tipo === 'Reserva' ? 'Confirmar reserva' : 'Finalizar compra'}
          </button>
          {!cliente && <p className="mt-3 text-center text-xs text-tinta-2">É preciso ter conta (maiores de 18 anos).</p>}
        </aside>
      </div>
    </div>
  )
}

function Campo({ rotulo, valor, mudar, classe }: { rotulo: string; valor?: string | null; mudar: (v: string) => void; classe?: string }) {
  return (
    <label className={`block ${classe ?? ''}`}>
      <span className="rotulo">{rotulo}</span>
      <input className="campo" value={valor ?? ''} onChange={(e) => mudar(e.target.value)} />
    </label>
  )
}
