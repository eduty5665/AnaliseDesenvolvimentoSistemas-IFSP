namespace VinoBebidas.Domain.Enums;

/// <summary>Perfis de acesso dos funcionários (RF01).</summary>
public enum PerfilUsuario
{
    Administrador = 1,
    Gerente = 2,
    DiretorFinanceiro = 3,
    Vendedor = 4,
    Caixa = 5,
    Estoquista = 6,
    Estagiario = 7
}

public enum TipoDeposito
{
    Loja = 1,
    CentroDistribuicao = 2,
    Adega = 3
}

public enum TipoMovimentacao
{
    Entrada = 1,
    Saida = 2,
    Transferencia = 3,
    Ajuste = 4,
    Venda = 5,
    CancelamentoVenda = 6,
    /// <summary>Chegada no destino de uma transferência expedida por Ordem de Separação.</summary>
    RecebimentoTransferencia = 7
}

/// <summary>Motivo obrigatório das saídas avulsas (auditoria de perdas).</summary>
public enum MotivoSaida
{
    Quebra = 1,
    Avaria = 2,
    Vencimento = 3,
    Degustacao = 4,
    Brinde = 5,
    UsoInterno = 6,
    DevolucaoFornecedor = 7,
    Outro = 99
}

public enum TipoOrdemSeparacao
{
    PedidoOnline = 1,
    Transferencia = 2
}

public enum StatusOrdemSeparacao
{
    /// <summary>Emitida, aguardando o estoquista separar.</summary>
    Aberta = 1,
    /// <summary>Itens separados e conferidos.</summary>
    Separada = 2,
    /// <summary>Transferência saiu da origem e está em trânsito.</summary>
    Expedida = 3,
    Concluida = 4,
    Cancelada = 5
}

public enum StatusCaixa
{
    Aberto = 1,
    Fechado = 2
}

public enum TipoMovimentoCaixa
{
    /// <summary>Entrada de dinheiro no caixa (reforço de troco).</summary>
    Suprimento = 1,
    /// <summary>Retirada de dinheiro do caixa (depósito, cofre).</summary>
    Sangria = 2
}

public enum StatusVenda
{
    Concluida = 1,
    Cancelada = 2
}

public enum CanalVenda
{
    Loja = 1,
    Online = 2,
    Consultor = 3
}

public enum FormaPagamento
{
    Dinheiro = 1,
    Pix = 2,
    CartaoCredito = 3,
    CartaoDebito = 4,
    Boleto = 5,
    PagamentoNaEntrega = 6
}

public enum TipoPedido
{
    /// <summary>Cliente segura o produto por alguns dias e paga na retirada.</summary>
    Reserva = 1,
    /// <summary>Cliente compra (paga) pelo site.</summary>
    Compra = 2
}

public enum ModalidadeEntrega
{
    Retirada = 1,
    Entrega = 2
}

public enum StatusPedido
{
    Pendente = 1,
    Confirmado = 2,
    EmSeparacao = 3,
    ProntoParaRetirada = 4,
    EmRota = 5,
    Concluido = 6,
    Cancelado = 7,
    Expirado = 8
}

public enum TipoLancamento
{
    Receita = 1,
    Despesa = 2
}

public enum StatusLancamento
{
    Aberto = 1,
    Pago = 2,
    Cancelado = 3
}

public enum CategoriaLancamento
{
    Venda = 1,
    CompraMercadoria = 2,
    EnergiaEletrica = 3,
    Agua = 4,
    IPTU = 5,
    Manutencao = 6,
    FolhaPagamento = 7,
    Impostos = 8,
    Aluguel = 9,
    Frete = 10,
    Marketing = 11,
    Outros = 99
}

/// <summary>Tipo de documento recebido dos setores (classe "Tipo" do diagrama).</summary>
public enum TipoDocumento
{
    Despesa = 1,
    Venda = 2,
    Compra = 3
}

/// <summary>Estados do Diagrama de Estado do documento.</summary>
public enum StatusDocumento
{
    Bloqueado = 1,
    Disponivel = 2,
    Analisado = 3
}
