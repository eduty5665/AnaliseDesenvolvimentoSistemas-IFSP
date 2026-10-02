using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Domain.Entities;

public class Deposito : Entidade
{
    public string Nome { get; set; } = string.Empty;
    public TipoDeposito Tipo { get; set; }
    public string? Endereco { get; set; }
    /// <summary>Clientes podem retirar pedidos online aqui.</summary>
    public bool PermiteRetirada { get; set; }
    /// <summary>Depósito que atende os pedidos online (reservas e compras).</summary>
    public bool AtendeOnline { get; set; }
    public bool Ativo { get; set; } = true;
}

/// <summary>Saldo de um produto em um depósito. Toda alteração passa pelos métodos abaixo.</summary>
public class SaldoEstoque
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public int DepositoId { get; set; }
    public Deposito? Deposito { get; set; }
    public int Quantidade { get; set; }
    public int Reservado { get; set; }
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public int Disponivel => Quantidade - Reservado;

    public void Entrar(int quantidade)
    {
        GarantirPositivo(quantidade);
        Quantidade += quantidade;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Retirar(int quantidade, string nomeProduto)
    {
        GarantirPositivo(quantidade);
        if (quantidade > Disponivel)
            throw new RegraNegocioException($"Estoque insuficiente de '{nomeProduto}'. Disponível: {Disponivel}, solicitado: {quantidade}.");
        Quantidade -= quantidade;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void Reservar(int quantidade, string nomeProduto)
    {
        GarantirPositivo(quantidade);
        if (quantidade > Disponivel)
            throw new RegraNegocioException($"Não há '{nomeProduto}' suficiente para reservar. Disponível: {Disponivel}.");
        Reservado += quantidade;
        AtualizadoEm = DateTime.UtcNow;
    }

    public void LiberarReserva(int quantidade)
    {
        Reservado = Math.Max(0, Reservado - quantidade);
        AtualizadoEm = DateTime.UtcNow;
    }

    /// <summary>Converte reserva em saída efetiva (pedido entregue/retirado).</summary>
    public void BaixarReserva(int quantidade)
    {
        GarantirPositivo(quantidade);
        var daReserva = Math.Min(quantidade, Reservado);
        Reservado -= daReserva;
        Quantidade -= quantidade;
        if (Quantidade < 0)
            throw new RegraNegocioException("Baixa de reserva deixaria o estoque negativo.");
        AtualizadoEm = DateTime.UtcNow;
    }

    /// <summary>Inventário: define a quantidade física contada.</summary>
    public int AjustarPara(int novaQuantidade)
    {
        if (novaQuantidade < 0) throw new RegraNegocioException("Quantidade não pode ser negativa.");
        if (novaQuantidade < Reservado)
            throw new RegraNegocioException($"Existem {Reservado} unidades reservadas; a contagem não pode ser menor que isso.");
        var diferenca = novaQuantidade - Quantidade;
        Quantidade = novaQuantidade;
        AtualizadoEm = DateTime.UtcNow;
        return diferenca;
    }

    private static void GarantirPositivo(int quantidade)
    {
        if (quantidade <= 0) throw new RegraNegocioException("A quantidade deve ser maior que zero.");
    }
}

/// <summary>Cabeçalho de uma movimentação (kardex): entrada de NF, saída, transferência, ajuste, venda.</summary>
public class Movimentacao : Entidade
{
    public TipoMovimentacao Tipo { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;
    public int? DepositoOrigemId { get; set; }
    public Deposito? DepositoOrigem { get; set; }
    public int? DepositoDestinoId { get; set; }
    public Deposito? DepositoDestino { get; set; }
    public int? FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }
    public string? NumeroDocumento { get; set; }
    public string? Observacao { get; set; }
    public int? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public int? VendaId { get; set; }
    public List<ItemMovimentacao> Itens { get; set; } = [];

    public decimal ValorTotal => Itens.Sum(i => i.CustoUnitario * Math.Abs(i.Quantidade));
}

public class ItemMovimentacao
{
    public int Id { get; set; }
    public int MovimentacaoId { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    /// <summary>Em ajustes pode ser negativa (perda/quebra).</summary>
    public int Quantidade { get; set; }
    public decimal CustoUnitario { get; set; }
}
