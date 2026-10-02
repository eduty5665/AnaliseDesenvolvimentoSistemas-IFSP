import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { Fatia, PontoProjecao, PontoSerie } from '../api/tipos'
import { brl, brlCompacto, dataCurta, dataLonga } from '../componentes/formato'

/* Um único matiz de dados (vinho, validado: contraste ≥ 3:1 no fundo claro).
   Projeção = mesma medida → mesmo matiz, tracejado; faixa = mesmo matiz translúcido. */
export const COR_SERIE = '#9e2a4b'
const COR_GRADE = '#ece6e8'
const COR_EIXO = '#8a7f84'

type Linha = { data: string; realizado?: number; previsto?: number; faixa?: [number, number] }

export function montarSerie(serie: PontoSerie[], projecao: PontoProjecao[]): Linha[] {
  const mapa = new Map<string, Linha>()
  for (const p of serie) mapa.set(p.data, { data: p.data, realizado: p.valor })
  for (const p of projecao) {
    const l = mapa.get(p.data) ?? { data: p.data }
    l.previsto = p.previsto
    l.faixa = [p.minimo, p.maximo]
    mapa.set(p.data, l)
  }
  return [...mapa.values()].sort((a, b) => a.data.localeCompare(b.data))
}

function DicaSerie({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const l = payload[0].payload as Linha
  return (
    <div className="rounded-xl border border-vinho-100 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 text-xs font-semibold text-tinta-2">{dataLonga(String(label))}</p>
      {l.realizado != null && (
        <p className="flex items-center gap-2"><span className="h-0.5 w-3" style={{ background: COR_SERIE }} /><strong>{brl(l.realizado)}</strong><span className="text-tinta-2">realizado</span></p>
      )}
      {l.previsto != null && (
        <p className="flex items-center gap-2"><span className="h-0 w-3 border-t-2 border-dashed" style={{ borderColor: COR_SERIE }} /><strong>{brl(l.previsto)}</strong><span className="text-tinta-2">projeção</span></p>
      )}
      {l.faixa && <p className="text-xs text-tinta-2">faixa provável: {brl(l.faixa[0])} – {brl(l.faixa[1])}</p>}
    </div>
  )
}

export function GraficoVendas({ dados, hoje }: { dados: Linha[]; hoje: string }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={dados} margin={{ top: 10, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} stroke={COR_GRADE} />
        <XAxis dataKey="data" tickFormatter={dataCurta} tick={{ fill: COR_EIXO, fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={28} />
        <YAxis tickFormatter={brlCompacto} tick={{ fill: COR_EIXO, fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
        <Tooltip content={DicaSerie} cursor={{ stroke: '#c9b8be', strokeWidth: 1 }} />
        <Area dataKey="faixa" stroke="none" fill={COR_SERIE} fillOpacity={0.12} isAnimationActive={false} activeDot={false} />
        <ReferenceLine x={hoje} stroke="#c9b8be" strokeDasharray="3 3" label={{ value: 'hoje', position: 'insideTopRight', fill: COR_EIXO, fontSize: 11 }} />
        <Line dataKey="realizado" stroke={COR_SERIE} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
        <Line dataKey="previsto" stroke={COR_SERIE} strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function DicaBarra({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-vinho-100 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="text-xs font-semibold text-tinta-2">{String(label ?? payload[0].payload?.nome)}</p>
      <p className="font-bold">{brl(Number(payload[0].value))}</p>
    </div>
  )
}

/** Barras horizontais para comparar magnitudes entre categorias (nomes legíveis, valores rotulados). */
export function BarrasHorizontais({ dados }: { dados: Fatia[] }) {
  const total = dados.reduce((s, d) => s + d.valor, 0)
  const maior = dados[0]?.valor || 1
  return (
    <ul className="space-y-3">
      {dados.map((d) => (
        <li key={d.nome} className="text-sm" title={`${d.nome}: ${brl(d.valor)}`}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-tinta">{d.nome}</span>
            <span className="tabular-nums">
              <strong>{brlCompacto(d.valor)}</strong> <span className="text-xs text-tinta-2">{total ? Math.round((d.valor / total) * 100) : 0}%</span>
            </span>
          </div>
          <div className="mt-1 h-2.5 rounded-r-[4px] bg-vinho-50">
            <div className="h-full rounded-r-[4px]" style={{ width: `${(d.valor / maior) * 100}%`, background: COR_SERIE }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function BarrasVerticais({ dados, altura = 200 }: { dados: Fatia[]; altura?: number }) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap={3}>
        <CartesianGrid vertical={false} stroke={COR_GRADE} />
        <XAxis dataKey="nome" tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={6} />
        <YAxis tickFormatter={brlCompacto} tick={{ fill: COR_EIXO, fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
        <Tooltip content={DicaBarra} cursor={{ fill: 'rgba(158,42,75,.06)' }} />
        <Bar dataKey="valor" fill={COR_SERIE} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
