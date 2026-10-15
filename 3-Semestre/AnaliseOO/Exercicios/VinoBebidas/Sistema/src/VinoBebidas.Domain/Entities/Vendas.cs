using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Domain.Entities;

/// <summary>Venda concluída (PDV, pedido online finalizado ou consultor). Fonte única dos indicadores.</summary>
public class Venda : Entidade
{
    public DateTime Data { get; set; } = DateTime.UtcNow;
    public CanalVenda Canal { get; set; } = CanalVenda.Loja;
    public StatusVenda Status { get; set; } = StatusVenda.Concluida;
    public int? ClienteId { get; set; }
    public Cliente? Cliente { get; set; }
    public int? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public int DepositoId { get; set; }
    public Deposito? Deposito { get; set; }
    public int? PedidoId { get; set; }
    /// <summary>Sessão de caixa em que a venda foi registrada (vendas do PDV).</summary>
    public int? CaixaSessaoId { get; set; }
    /// <summary>Vendedor/consultor que atendeu (base da comissão); o operador do caixa fica em UsuarioId.</summary>
    public int? VendedorId { get; set; }
    public Usuario? Vendedor { get; set; }
    /// <summary>CPF/CNPJ informado pelo consumidor para constar no cupom.</summary>
    public string? CpfCnpjNota { get; set; }
    /// <summary>Supervisor que liberou desconto acima do limite do operador.</summary>
    public int? DescontoAutorizadoPorId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Desconto { get; set; }
    public decimal Total { get; set; }
    public decimal Troco { get; set; }
    public string? MotivoCancelamento { get; set; }
    public DateTime? CanceladaEm { get; set; }
    public List<ItemVenda> Itens { get; set; } = [];
    public List<PagamentoVenda> Pagamentos { get; set; } = [];

    public void CalcularTotais()
    {
        foreach (var item in Itens) item.CalcularTotal();
        Subtotal = Itens.Sum(i => i.Total);
        if (Desconto < 0 || Desconto > Subtotal)
            throw new RegraNegocioException("Desconto inválido.");
        Total = Subtotal - Desconto;
    }

    /// <summary>Confere pagamentos e calcula troco (troco só é permitido em dinheiro).</summary>
    public void ValidarPagamentos()
    {
        if (Pagamentos.Count == 0) throw new RegraNegocioException("Informe ao menos uma forma de pagamento.");
        if (Pagamentos.Any(p => p.Valor <= 0)) throw new RegraNegocioException("Valores de pagamento devem ser positivos.");
        if (Pagamentos.Any(p => p.Parcelas < 1 || p.Parcelas > 12)) throw new RegraNegocioException("Parcelamento deve ser de 1 a 12 vezes.");
        if (Pagamentos.Any(p => p.Parcelas > 1 && p.Forma != FormaPagamento.CartaoCredito))
            throw new RegraNegocioException("Somente cartão de crédito pode ser parcelado.");
        var pago = Pagamentos.Sum(p => p.Valor);
        if (pago < Total) throw new RegraNegocioException($"Pagamento insuficiente. Falta R$ {Total - pago:N2}.");
        var excedente = pago - Total;
        var dinheiro = Pagamentos.Where(p => p.Forma == FormaPagamento.Dinheiro).Sum(p => p.Valor);
        if (excedente > dinheiro) throw new RegraNegocioException("Troco só pode ser dado sobre pagamento em dinheiro.");
        Troco = excedente;
    }

    public decimal CustoTotal => Itens.Sum(i => i.CustoUnitario * i.Quantidade);

    /// <summary>Desconto total concedido (itens + geral) em % do valor bruto.</summary>
    public decimal PercentualDesconto
    {
        get
        {
            var bruto = Itens.Sum(i => i.PrecoUnitario * i.Quantidade);
            return bruto == 0 ? 0 : Math.Round((Itens.Sum(i => i.Desconto) + Desconto) / bruto * 100, 2);
        }
    }
}

/// <summary>Limite de desconto que cada perfil pode conceder sem senha de supervisor.</summary>
public static class PoliticaDesconto
{
    public static decimal LimitePercentual(PerfilUsuario perfil) => perfil switch
    {
        PerfilUsuario.Administrador => 100,
        PerfilUsuario.Gerente => 30,
        PerfilUsuario.Vendedor => 10,
        PerfilUsuario.Caixa => 5,
        _ => 0
    };

    public static bool PodeAutorizar(PerfilUsuario perfil) => perfil is PerfilUsuario.Administrador or PerfilUsuario.Gerente;
}

public class ItemVenda
{
    public int Id { get; set; }
    public int VendaId { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Desconto { get; set; }
    /// <summary>Custo no momento da venda (para margem e CMV).</summary>
    public decimal CustoUnitario { get; set; }
    public decimal Total { get; set; }

    public void CalcularTotal()
    {
        if (Quantidade <= 0) throw new RegraNegocioException("Quantidade do item deve ser maior que zero.");
        var bruto = PrecoUnitario * Quantidade;
        if (Desconto < 0 || Desconto > bruto) throw new RegraNegocioException("Desconto do item inválido.");
        Total = bruto - Desconto;
    }
}

public class PagamentoVenda
{
    public int Id { get; set; }
    public int VendaId { get; set; }
    public FormaPagamento Forma { get; set; }
    public decimal Valor { get; set; }
    /// <summary>Número de parcelas (cartão de crédito).</summary>
    public int Parcelas { get; set; } = 1;
    /// <summary>NSU/autorização do comprovante da maquininha (TEF não integrado).</summary>
    public string? Nsu { get; set; }
}

/// <summary>Pedido feito pela loja online: reserva ou compra, com retirada ou entrega.</summary>
public class Pedido : Entidade
{
    public const int DiasValidadeReserva = 3;

    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }
    public TipoPedido Tipo { get; set; }
    public ModalidadeEntrega Modalidade { get; set; }
    public StatusPedido Status { get; set; } = StatusPedido.Pendente;
    public int DepositoId { get; set; }
    public Deposito? Deposito { get; set; }
    public FormaPagamento FormaPagamento { get; set; }
    public string? EnderecoEntrega { get; set; }
    public decimal TaxaEntrega { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
    public DateTime? ValidoAte { get; set; }
    public string? Observacao { get; set; }
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    public int? VendaId { get; set; }
    /// <summary>Ordem de Separação emitida quando o pedido entrou em separação.</summary>
    public int? OrdemSeparacaoId { get; set; }
    public List<ItemPedido> Itens { get; set; } = [];

    public bool EstaAberto => Status is not (StatusPedido.Concluido or StatusPedido.Cancelado or StatusPedido.Expirado);

    private static readonly Dictionary<StatusPedido, StatusPedido[]> Transicoes = new()
    {
        [StatusPedido.Pendente] = [StatusPedido.Confirmado, StatusPedido.Cancelado, StatusPedido.Expirado],
        [StatusPedido.Confirmado] = [StatusPedido.EmSeparacao, StatusPedido.Cancelado, StatusPedido.Expirado],
        [StatusPedido.EmSeparacao] = [StatusPedido.ProntoParaRetirada, StatusPedido.EmRota, StatusPedido.Cancelado],
        [StatusPedido.ProntoParaRetirada] = [StatusPedido.Concluido, StatusPedido.Cancelado, StatusPedido.Expirado],
        [StatusPedido.EmRota] = [StatusPedido.Concluido, StatusPedido.Cancelado],
    };

    public static IReadOnlyList<StatusPedido> ProximosStatus(StatusPedido atual, ModalidadeEntrega modalidade) =>
        Transicoes.TryGetValue(atual, out var proximos)
            ? proximos.Where(s => !(s == StatusPedido.EmRota && modalidade == ModalidadeEntrega.Retirada)
                               && !(s == StatusPedido.ProntoParaRetirada && modalidade == ModalidadeEntrega.Entrega)).ToList()
            : [];

    public void AlterarStatus(StatusPedido novo)
    {
        if (!ProximosStatus(Status, Modalidade).Contains(novo))
            throw new RegraNegocioException($"Não é possível mudar o pedido de {Status} para {novo}.");
        Status = novo;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void CalcularTotais()
    {
        if (Itens.Count == 0) throw new RegraNegocioException("O pedido precisa ter ao menos um item.");
        Subtotal = Itens.Sum(i => i.PrecoUnitario * i.Quantidade);
        Total = Subtotal + TaxaEntrega;
    }
}

public class ItemPedido
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}
