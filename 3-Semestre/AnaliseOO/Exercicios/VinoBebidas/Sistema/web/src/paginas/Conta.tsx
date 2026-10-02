import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useSearchParams } from 'react-router'
import { CheckCircle2, LogOut } from 'lucide-react'
import { api } from '../api/cliente'
import type { Pedido, StatusPedido } from '../api/tipos'
import { useSessao } from '../estado/sessao'
import { brl, dataHora, textoPagamento, textoStatus } from '../componentes/formato'

const ETAPAS_RETIRADA: StatusPedido[] = ['Confirmado', 'EmSeparacao', 'ProntoParaRetirada', 'Concluido']
const ETAPAS_ENTREGA: StatusPedido[] = ['Confirmado', 'EmSeparacao', 'EmRota', 'Concluido']

export function Conta() {
  const { cliente, sair } = useSessao()
  const [params] = useSearchParams()
  const qc = useQueryClient()
  const pedidos = useQuery({
    queryKey: ['meus-pedidos'],
    queryFn: () => api<Pedido[]>('/api/minha-conta/pedidos', { area: 'cliente' }),
    enabled: !!cliente,
    refetchInterval: 30_000,
  })
  const cancelar = useMutation({
    mutationFn: (id: number) => api<Pedido>(`/api/minha-conta/pedidos/${id}/cancelar`, { metodo: 'POST', area: 'cliente' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meus-pedidos'] }),
  })

  if (!cliente) return <Navigate to="/entrar?volta=/conta" replace />
  const novo = params.get('novo')

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-tinta-2">Olá,</p>
          <h1 className="titulo text-4xl font-bold text-vinho-800">{cliente.nome}</h1>
        </div>
        <button className="btn-contorno" onClick={() => sair('cliente')}><LogOut size={16} /> Sair</button>
      </div>

      {novo && (
        <div className="surgir mt-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-200">
          <CheckCircle2 /> Pedido <strong>{novo}</strong> recebido! Acompanhe o andamento abaixo.
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold">Meus pedidos</h2>
      {pedidos.isPending && <div className="cartao mt-4 h-40 animate-pulse" />}
      {cancelar.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{cancelar.error.message}</p>}
      {pedidos.data?.length === 0 && (
        <div className="cartao mt-4 p-8 text-center text-tinta-2">Você ainda não fez pedidos. <Link to="/vinhos" className="font-semibold text-vinho-600">Ver vinhos</Link></div>
      )}
      <div className="mt-4 space-y-4">
        {pedidos.data?.map((p) => {
          const etapas = p.modalidade === 'Entrega' ? ETAPAS_ENTREGA : ETAPAS_RETIRADA
          const atual = etapas.indexOf(p.status)
          const encerrado = ['Cancelado', 'Expirado'].includes(p.status)
          return (
            <article key={p.id} className="cartao p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.numero} · {p.tipo === 'Reserva' ? 'Reserva' : 'Compra'} para {p.modalidade === 'Entrega' ? 'entrega' : `retirada na ${p.deposito}`}</p>
                  <p className="text-sm text-tinta-2">{dataHora(p.data)} · {textoPagamento[p.formaPagamento]}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${encerrado ? 'bg-red-50 text-red-800' : p.status === 'Concluido' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
                  {textoStatus[p.status]}
                </span>
              </div>
              {!encerrado && (
                <ol className="mt-4 grid grid-cols-4 gap-2">
                  {etapas.map((e, i) => (
                    <li key={e} className="text-xs">
                      <div className={`h-1.5 rounded-full ${i <= atual ? 'bg-vinho-600' : 'bg-vinho-100'}`} />
                      <span className={`mt-1 block ${i <= atual ? 'font-semibold text-vinho-700' : 'text-tinta-2'}`}>{textoStatus[e]}</span>
                    </li>
                  ))}
                </ol>
              )}
              <ul className="mt-4 space-y-1 text-sm">
                {p.itens.map((i) => (
                  <li key={i.produtoId} className="flex justify-between"><span>{i.quantidade}× {i.produto}</span><span>{brl(i.total)}</span></li>
                ))}
                {p.taxaEntrega > 0 && <li className="flex justify-between text-tinta-2"><span>Entrega</span><span>{brl(p.taxaEntrega)}</span></li>}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-vinho-50 pt-3">
                <span className="text-sm text-tinta-2">{p.validoAte && !encerrado && p.status !== 'Concluido' ? `Reservado até ${dataHora(p.validoAte)}` : ''}</span>
                <div className="flex items-center gap-4">
                  {['Pendente', 'Confirmado'].includes(p.status) && (
                    <button className="text-sm font-semibold text-red-700 hover:underline" onClick={() => cancelar.mutate(p.id)} disabled={cancelar.isPending}>Cancelar</button>
                  )}
                  <strong className="text-lg text-vinho-800">{brl(p.total)}</strong>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
