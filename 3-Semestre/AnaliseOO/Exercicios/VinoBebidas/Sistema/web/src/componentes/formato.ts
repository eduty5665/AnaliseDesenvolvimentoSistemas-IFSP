const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const moedaCompacta = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })
const numero = new Intl.NumberFormat('pt-BR')

export const brl = (v: number) => moeda.format(v)
export const brlCompacto = (v: number) => moedaCompacta.format(v)
export const num = (v: number, casas = 0) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas }).format(v)
export const inteiro = (v: number) => numero.format(v)
export const pct = (v: number) => `${num(v, 1)}%`

/** DateOnly vem como "2026-09-29" — tratar como data local, sem fuso. */
export const dataCurta = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
export const dataLonga = (iso: string) => {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
export const dataHora = (iso: string) =>
  new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
export const hora = (iso: string) =>
  new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export const textoStatus: Record<string, string> = {
  Pendente: 'Aguardando',
  Confirmado: 'Confirmado',
  EmSeparacao: 'Em separação',
  ProntoParaRetirada: 'Pronto para retirada',
  EmRota: 'Saiu para entrega',
  Concluido: 'Concluído',
  Cancelado: 'Cancelado',
  Expirado: 'Reserva expirada',
}
export const textoPagamento: Record<string, string> = {
  Dinheiro: 'Dinheiro',
  Pix: 'Pix',
  CartaoCredito: 'Cartão de crédito',
  CartaoDebito: 'Cartão de débito',
  Boleto: 'Boleto',
  PagamentoNaEntrega: 'Pagar na retirada/entrega',
}
