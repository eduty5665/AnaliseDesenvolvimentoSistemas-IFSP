// Espelho dos DTOs de VinoBebidas.Contracts (JSON camelCase, enums como texto).

export type Pagina<T> = { itens: T[]; total: number; pagina: number; tamanhoPagina: number }

export type Endereco = {
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
}

export type Sessao = { token: string; expiraEm: string; id: number; nome: string; tipo: 'funcionario' | 'cliente'; perfil?: string | null }

export type Categoria = { id: number; nome: string; descricao?: string | null; ehVinho: boolean; cor: string }

export type Vinho = {
  id: number
  sku: string
  nome: string
  descricao?: string | null
  categoriaId: number
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
  imagemUrl?: string | null
  destaque: boolean
  disponivel: number
}

export type Facetas = { categorias: Categoria[]; paises: string[]; uvas: string[]; precoMinimo: number; precoMaximo: number }

export type Loja = { id: number; nome: string; endereco?: string | null }

export type TipoPedido = 'Reserva' | 'Compra'
export type Modalidade = 'Retirada' | 'Entrega'
export type FormaPagamento = 'Dinheiro' | 'Pix' | 'CartaoCredito' | 'CartaoDebito' | 'Boleto' | 'PagamentoNaEntrega'
export type StatusPedido = 'Pendente' | 'Confirmado' | 'EmSeparacao' | 'ProntoParaRetirada' | 'EmRota' | 'Concluido' | 'Cancelado' | 'Expirado'
export type CanalVenda = 'Loja' | 'Online' | 'Consultor'

export type CriarPedido = {
  tipo: TipoPedido
  modalidade: Modalidade
  formaPagamento: FormaPagamento
  itens: { produtoId: number; quantidade: number }[]
  depositoRetiradaId?: number | null
  enderecoEntrega?: Endereco | null
  observacao?: string | null
}

export type Pedido = {
  id: number
  numero: string
  data: string
  cliente: string
  tipo: TipoPedido
  modalidade: Modalidade
  status: StatusPedido
  deposito: string
  formaPagamento: FormaPagamento
  enderecoEntrega?: string | null
  taxaEntrega: number
  subtotal: number
  total: number
  validoAte?: string | null
  itens: { produtoId: number; produto: string; quantidade: number; precoUnitario: number; total: number }[]
  proximosStatus: StatusPedido[]
}

export type Cliente = {
  id: number
  nome: string
  email?: string | null
  telefone?: string | null
  dataNascimento?: string | null
  endereco: Endereco
}

export type Frete = { taxa: number; prazoDias: number; descricao: string }

// ── Painel ──
export type Kpis = {
  faturamentoHoje: number
  vendasHoje: number
  faturamentoMes: number
  faturamentoMesAnteriorMesmoPeriodo: number
  variacaoMesPercentual: number
  ticketMedioMes: number
  margemBrutaMesPercentual: number
  itensVendidosMes: number
  previsaoFechamentoMes: number
  valorEmEstoque: number
  clientesAtivos: number
  pedidosPendentes: number
}
export type PontoSerie = { data: string; valor: number; quantidade: number }
export type PontoProjecao = { data: string; previsto: number; minimo: number; maximo: number }
export type Projecao = {
  metodo: string
  pontos: PontoProjecao[]
  totalPrevisto: number
  totalUltimoPeriodoIgual: number
  crescimentoPercentual: number
  erroMedioPercentual: number
}
export type Fatia = { nome: string; valor: number; cor?: string | null }
export type RankingProduto = { produtoId: number; nome: string; categoria: string; quantidade: number; faturamento: number; margem: number }
export type Cobertura = {
  produtoId: number
  nome: string
  disponivel: number
  estoqueMinimo: number
  mediaDiaria: number
  diasCobertura?: number | null
  dataRupturaPrevista?: string | null
  sugestaoCompra: number
}
export type AlertaFinanceiro = { lancamentoId: number; descricao: string; tipo: 'Receita' | 'Despesa'; valor: number; vencimento: string; diasParaVencer: number; atrasado: boolean }
export type VendaResumo = { id: number; numero: string; data: string; canal: CanalVenda; status: string; cliente?: string | null; itens: number; total: number }
export type Painel = {
  geradoEm: string
  periodoDias: number
  kpis: Kpis
  serieDiaria: PontoSerie[]
  projecao: Projecao
  porCategoria: Fatia[]
  porCanal: Fatia[]
  porDiaSemana: Fatia[]
  porHora: Fatia[]
  topProdutos: RankingProduto[]
  estoqueCritico: Cobertura[]
  alertasFinanceiros: AlertaFinanceiro[]
  ultimasVendas: VendaResumo[]
}
export type EventoPainel = { tipo: string; descricao: string; valor?: number | null; quando: string }
