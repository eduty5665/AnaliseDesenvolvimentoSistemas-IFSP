import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, LogOut, PackageX, Radio, Store } from 'lucide-react'
import { api, ErroApi } from '../api/cliente'
import type { EventoPainel, Painel as PainelDto } from '../api/tipos'
import { PERFIS_PAINEL, useSessao } from '../estado/sessao'
import { brl, dataCurta, dataHora, dataLonga, hora, inteiro, num, pct } from '../componentes/formato'
import { BarrasHorizontais, BarrasVerticais, COR_SERIE, GraficoVendas, montarSerie } from './Graficos'
import { useAoVivo } from './aoVivo'

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
  { dias: 90, rotulo: '90 dias' },
  { dias: 180, rotulo: '180 dias' },
]

export function Painel() {
  const { admin, sair } = useSessao()
  const [dias, setDias] = useState(90)
  const [eventos, setEventos] = useState<(EventoPainel & { id: number })[]>([])
  const seq = useRef(0)
  const qc = useQueryClient()

  const painel = useQuery({
    queryKey: ['painel', dias],
    queryFn: () => api<PainelDto>(`/api/painel?dias=${dias}&horizonte=30`, { area: 'admin' }),
    placeholderData: keepPreviousData,
    refetchInterval: 5 * 60_000,
    enabled: !!admin,
  })

  // Evento ao vivo: entra no feed e o painel é recalculado (com pequena espera para agrupar rajadas)
  const timer = useRef<number | undefined>(undefined)
  const aoEvento = useCallback(
    (e: EventoPainel) => {
      setEventos((atual) => [{ ...e, id: ++seq.current }, ...atual].slice(0, 30))
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => qc.invalidateQueries({ queryKey: ['painel'] }), 1200)
    },
    [qc],
  )
  const conexao = useAoVivo(aoEvento)

  if (!admin || !PERFIS_PAINEL.includes(admin.perfil ?? '')) return <Navigate to="/admin/entrar" replace />
  if (painel.error instanceof ErroApi && painel.error.status === 401) return <Navigate to="/admin/entrar" replace />

  const d = painel.data
  const k = d?.kpis
  const hoje = d?.projecao.pontos[0]?.data ?? ''

  return (
    <div className="min-h-screen bg-[#f6f2f3]">
      <header className="sticky top-0 z-20 border-b border-vinho-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <span className="titulo text-xl font-bold text-vinho-800">Painel Vino</span>
          </Link>
          <StatusConexao estado={conexao} />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-tinta-2 sm:inline">{admin.nome}</span>
            <button className="btn-contorno px-3 py-1.5" onClick={() => sair('admin')}><LogOut size={15} /> Sair</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Filtros: uma linha, acima de tudo, escopo = painel inteiro */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex rounded-full bg-white p-1 ring-1 ring-vinho-100">
            {PERIODOS.map((p) => (
              <button key={p.dias} onClick={() => setDias(p.dias)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${dias === p.dias ? 'bg-vinho-700 text-white' : 'text-tinta-2 hover:text-vinho-700'}`}>
                {p.rotulo}
              </button>
            ))}
          </div>
          {d && <span className="text-xs text-tinta-2">Atualizado às {hora(d.geradoEm)}{painel.isFetching ? ' · recalculando…' : ''}</span>}
        </div>

        {painel.isError && !d && (
          <div className="cartao p-6 text-red-800">{painel.error.message}</div>
        )}

        <div className={`transition-opacity ${painel.isPlaceholderData || painel.isFetching ? 'opacity-70' : ''}`}>
          {/* KPIs */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Kpi titulo="Faturamento hoje" valor={k ? brl(k.faturamentoHoje) : '—'} rodape={k ? `${k.vendasHoje} vendas` : ''} />
            <Kpi titulo="Faturamento no mês" valor={k ? brl(k.faturamentoMes) : '—'}
              variacao={k?.variacaoMesPercentual} rodape="vs. mesmo período do mês anterior" />
            <Kpi titulo="Previsão de fechamento" valor={k ? brl(k.previsaoFechamentoMes) : '—'} rodape="realizado + projeção até o fim do mês" destaque />
            <Kpi titulo="Ticket médio" valor={k ? brl(k.ticketMedioMes) : '—'} rodape={k ? `${inteiro(k.itensVendidosMes)} garrafas no mês` : ''} />
            <Kpi titulo="Margem bruta" valor={k ? pct(k.margemBrutaMesPercentual) : '—'} rodape="sobre o custo médio" />
            <Kpi titulo="Pedidos online abertos" valor={k ? String(k.pedidosPendentes) : '—'} rodape="reservas e compras" />
            <Kpi titulo="Estoque a custo" valor={k ? brl(k.valorEmEstoque) : '—'} rodape={k ? `${k.clientesAtivos} clientes ativos (90d)` : ''} />
          </section>

          {/* Série + projeção */}
          <section className="cartao mt-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-tinta">Faturamento diário e projeção dos próximos 30 dias</h2>
                {d && (
                  <p className="mt-1 text-sm text-tinta-2">
                    Previsto para 30 dias: <strong className="text-tinta">{brl(d.projecao.totalPrevisto)}</strong>{' '}
                    <span className={d.projecao.crescimentoPercentual >= 0 ? 'text-emerald-700' : 'text-red-700'}>
                      ({d.projecao.crescimentoPercentual >= 0 ? '+' : ''}{pct(d.projecao.crescimentoPercentual)} vs. últimos 30 dias)
                    </span>
                  </p>
                )}
              </div>
              <ul className="flex flex-wrap items-center gap-4 text-xs text-tinta-2">
                <li className="flex items-center gap-1.5"><span className="h-0.5 w-5" style={{ background: COR_SERIE }} /> Realizado</li>
                <li className="flex items-center gap-1.5"><span className="w-5 border-t-2 border-dashed" style={{ borderColor: COR_SERIE }} /> Projeção</li>
                <li className="flex items-center gap-1.5"><span className="h-3 w-5 rounded-sm" style={{ background: COR_SERIE, opacity: 0.15 }} /> Faixa provável (80%)</li>
              </ul>
            </div>
            <div className="mt-4">
              {d ? <GraficoVendas dados={montarSerie(d.serieDiaria, d.projecao.pontos)} hoje={hoje} /> : <div className="h-80 animate-pulse rounded-xl bg-vinho-50" />}
            </div>
            {d && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-tinta-2 hover:text-vinho-700">
                  Método: {d.projecao.metodo} · erro médio {num(d.projecao.erroMedioPercentual, 1)}% · ver tabela
                </summary>
                <div className="mt-3 max-h-72 overflow-auto rounded-xl ring-1 ring-vinho-100">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-vinho-50 text-tinta-2"><tr><th className="px-3 py-2">Data</th><th className="px-3 py-2 text-right">Realizado</th><th className="px-3 py-2 text-right">Projeção</th><th className="px-3 py-2 text-right">Faixa</th></tr></thead>
                    <tbody>
                      {montarSerie(d.serieDiaria, d.projecao.pontos).map((l) => (
                        <tr key={l.data} className="border-t border-vinho-50">
                          <td className="px-3 py-1.5">{dataLonga(l.data)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{l.realizado != null ? brl(l.realizado) : ''}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{l.previsto != null ? brl(l.previsto) : ''}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{l.faixa ? `${brl(l.faixa[0])} – ${brl(l.faixa[1])}` : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </section>

          {/* Recortes */}
          <section className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="cartao p-5">
              <h2 className="mb-4 font-semibold">Faturamento por tipo</h2>
              {d && <BarrasHorizontais dados={d.porCategoria} />}
            </div>
            <div className="cartao p-5">
              <h2 className="mb-4 font-semibold">Faturamento por canal</h2>
              {d && <BarrasHorizontais dados={d.porCanal} />}
              <p className="mt-4 text-xs text-tinta-2">Loja = PDV no balcão · Online = pedidos do site concluídos · Consultor = vendas assistidas.</p>
            </div>
            <div className="cartao p-5">
              <h2 className="font-semibold">Média por dia da semana</h2>
              <p className="mb-2 text-xs text-tinta-2">Use para escalar equipe e reposição.</p>
              {d && <BarrasVerticais dados={d.porDiaSemana} />}
            </div>
            <div className="cartao p-5">
              <h2 className="font-semibold">Faturamento por horário</h2>
              <p className="mb-2 text-xs text-tinta-2">Soma do período selecionado.</p>
              {d && <BarrasVerticais dados={d.porHora} />}
            </div>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <div className="cartao overflow-x-auto p-5">
              <h2 className="mb-3 font-semibold">Produtos mais vendidos</h2>
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-tinta-2 uppercase">
                  <tr><th className="pb-2">Produto</th><th className="pb-2 text-right">Garrafas</th><th className="pb-2 pl-4">Faturamento</th><th className="hidden pb-2 text-right sm:table-cell">Margem</th></tr>
                </thead>
                <tbody>
                  {d?.topProdutos.map((p) => (
                    <tr key={p.produtoId} className="border-t border-vinho-50">
                      <td className="py-2 pr-3"><span className="font-medium">{p.nome}</span><span className="block text-xs text-tinta-2">{p.categoria}</span></td>
                      <td className="py-2 text-right tabular-nums">{inteiro(p.quantidade)}</td>
                      <td className="py-2 pl-4 sm:w-[38%]">
                        <div className="flex items-center gap-2">
                          <div className="hidden h-2.5 flex-1 rounded-r-[4px] bg-vinho-50 sm:block">
                            <div className="h-full rounded-r-[4px]" style={{ width: `${(p.faturamento / (d.topProdutos[0]?.faturamento || 1)) * 100}%`, background: COR_SERIE }} />
                          </div>
                          <span className="w-24 text-right tabular-nums">{brl(p.faturamento)}</span>
                        </div>
                      </td>
                      <td className="hidden py-2 text-right tabular-nums sm:table-cell">{pct(p.margem)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cartao overflow-x-auto p-5">
              <h2 className="flex items-center gap-2 font-semibold"><PackageX size={18} className="text-vinho-600" /> Risco de ruptura</h2>
              <p className="mb-3 text-xs text-tinta-2">Quando cada vinho acaba no ritmo dos últimos 30 dias, e quanto comprar para cobrir mais 30.</p>
              {d?.estoqueCritico.length === 0 && <p className="text-sm text-tinta-2">Nenhum item crítico.</p>}
              <table className="w-full text-sm">
                <tbody>
                  {d?.estoqueCritico.map((c) => (
                    <tr key={c.produtoId} className="border-t border-vinho-50">
                      <td className="py-2 pr-2"><span className="font-medium">{c.nome}</span><span className="block text-xs text-tinta-2">{c.disponivel} disp. · {num(c.mediaDiaria, 1)}/dia</span></td>
                      <td className="py-2 text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          c.diasCobertura == null ? (c.disponivel <= 0 ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900')
                          : c.diasCobertura < 7 ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-900'}`}>
                          <AlertTriangle size={12} />
                          {c.diasCobertura == null ? (c.disponivel <= 0 ? 'Zerado' : 'Abaixo do mínimo') : `${num(c.diasCobertura, 0)} dias`}
                        </span>
                        {c.dataRupturaPrevista && <span className="block text-xs text-tinta-2">acaba ~{dataCurta(c.dataRupturaPrevista)}</span>}
                      </td>
                      <td className="py-2 pl-3 text-right text-xs text-tinta-2">comprar<strong className="block text-sm text-tinta">{c.sugestaoCompra}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="cartao p-5">
              <h2 className="mb-3 font-semibold">Contas a vencer (7 dias)</h2>
              {d?.alertasFinanceiros.length === 0 && <p className="text-sm text-tinta-2">Nada vencendo.</p>}
              <ul className="divide-y divide-vinho-50 text-sm">
                {d?.alertasFinanceiros.map((a) => (
                  <li key={a.lancamentoId} className="flex items-center justify-between gap-3 py-2">
                    <div>
                      <p className="font-medium">{a.descricao}</p>
                      <p className={`text-xs ${a.atrasado ? 'font-semibold text-red-700' : 'text-tinta-2'}`}>
                        {a.atrasado ? `⚠ atrasada há ${-a.diasParaVencer} dia(s)` : a.diasParaVencer === 0 ? 'vence hoje' : `vence em ${a.diasParaVencer} dia(s)`} · {a.tipo === 'Receita' ? 'a receber' : 'a pagar'}
                      </p>
                    </div>
                    <strong className="tabular-nums">{brl(a.valor)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cartao p-5">
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><Radio size={16} className="text-vinho-600" /> Movimento ao vivo</h2>
              <ul className="max-h-80 divide-y divide-vinho-50 overflow-y-auto text-sm">
                {eventos.map((e) => (
                  <li key={e.id} className="surgir flex items-center justify-between gap-3 bg-vinho-50/40 py-2">
                    <span><span className="text-xs text-tinta-2">{hora(e.quando)}</span> · {e.descricao}</span>
                    {e.valor != null && <strong className="tabular-nums">{brl(e.valor)}</strong>}
                  </li>
                ))}
                {d?.ultimasVendas.map((v) => (
                  <li key={`v${v.id}`} className="flex items-center justify-between gap-3 py-2">
                    <span className="flex items-center gap-2">
                      <Store size={14} className="text-tinta-2" />
                      <span><span className="text-xs text-tinta-2">{dataHora(v.data)}</span> · {v.numero} · {v.canal}{v.cliente ? ` · ${v.cliente}` : ''}</span>
                    </span>
                    <strong className="tabular-nums">{brl(v.total)}</strong>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-tinta-2">Faça uma venda no PDV do ERP e veja ela chegar aqui sem recarregar a página.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function Kpi({ titulo, valor, rodape, variacao, destaque }: { titulo: string; valor: string; rodape?: string; variacao?: number; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${destaque ? 'bg-vinho-800 text-white ring-vinho-800' : 'bg-white ring-vinho-100'}`}>
      <p className={`text-xs font-semibold ${destaque ? 'text-vinho-100' : 'text-tinta-2'}`}>{titulo}</p>
      <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">{valor}</p>
      {variacao != null && (
        <p className={`mt-0.5 flex items-center text-xs font-semibold ${variacao >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {variacao >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{pct(Math.abs(variacao))}
        </p>
      )}
      <p className={`mt-0.5 text-xs ${destaque ? 'text-vinho-100' : 'text-tinta-2'}`}>{rodape}</p>
    </div>
  )
}

function StatusConexao({ estado }: { estado: string }) {
  const mapa: Record<string, { cor: string; texto: string }> = {
    'ao-vivo': { cor: 'bg-emerald-500', texto: 'Ao vivo' },
    conectando: { cor: 'bg-amber-400', texto: 'Conectando…' },
    reconectando: { cor: 'bg-amber-400', texto: 'Reconectando…' },
    offline: { cor: 'bg-gray-400', texto: 'Offline (atualiza a cada 5 min)' },
  }
  const s = mapa[estado] ?? mapa.offline
  return (
    <span className="flex items-center gap-2 rounded-full bg-vinho-50 px-3 py-1 text-xs font-semibold text-vinho-800">
      <span className="relative flex h-2.5 w-2.5">
        {estado === 'ao-vivo' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.cor} opacity-60`} />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.cor}`} />
      </span>
      {s.texto}
    </span>
  )
}
