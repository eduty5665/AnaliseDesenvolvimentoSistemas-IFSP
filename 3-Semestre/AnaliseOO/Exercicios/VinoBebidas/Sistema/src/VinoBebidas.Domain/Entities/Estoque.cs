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
    /// <summary>Endereço no depósito: corredor-prateleira-nível (ex.: "A-03-2"). Ordena a rota de separação.</summary>
    public string? Localizacao { get; set; }
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
    /// <summary>Controle de concorrência otimista: incrementa a cada alteração.</summary>
    public int Versao { get; set; }

    public int Disponivel => Quantidade - Reservado;

    private void Tocar()
    {
        AtualizadoEm = DateTime.UtcNow;
        Versao++;
    }

    public void Entrar(int quantidade)
    {
        GarantirPositivo(quantidade);
        Quantidade += quantidade;
        Tocar();
    }

    public void Retirar(int quantidade, string nomeProduto)
    {
        GarantirPositivo(quantidade);
        if (quantidade > Disponivel)
            throw new RegraNegocioException($"Estoque insuficiente de '{nomeProduto}'. Disponível: {Disponivel}, solicitado: {quantidade}.");
        Quantidade -= quantidade;
        Tocar();
    }

    public void Reservar(int quantidade, string nomeProduto)
    {
        GarantirPositivo(quantidade);
        if (quantidade > Disponivel)
            throw new RegraNegocioException($"Não há '{nomeProduto}' suficiente para reservar. Disponível: {Disponivel}.");
        Reservado += quantidade;
        Tocar();
    }

    public void LiberarReserva(int quantidade)
    {
        Reservado = Math.Max(0, Reservado - quantidade);
        Tocar();
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
        Tocar();
    }

    /// <summary>Inventário: define a quantidade física contada.</summary>
    public int AjustarPara(int novaQuantidade)
    {
        if (novaQuantidade < 0) throw new RegraNegocioException("Quantidade não pode ser negativa.");
        if (novaQuantidade < Reservado)
            throw new RegraNegocioException($"Existem {Reservado} unidades reservadas; a contagem não pode ser menor que isso.");
        var diferenca = novaQuantidade - Quantidade;
        Quantidade = novaQuantidade;
        Tocar();
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
    public int? OrdemSeparacaoId { get; set; }

    // Dados da nota fiscal de entrada
    public string? Serie { get; set; }
    /// <summary>Chave de acesso da NF-e (44 dígitos).</summary>
    public string? ChaveAcesso { get; set; }
    public DateOnly? DataEmissao { get; set; }
    public decimal ValorFrete { get; set; }
    public decimal ValorOutrasDespesas { get; set; }

    /// <summary>Obrigatório nas saídas avulsas.</summary>
    public MotivoSaida? Motivo { get; set; }

    public List<ItemMovimentacao> Itens { get; set; } = [];

    public decimal ValorProdutos => Itens.Sum(i => i.CustoUnitario * Math.Abs(i.Quantidade));
    public decimal ValorTotal => ValorProdutos + ValorFrete + ValorOutrasDespesas;
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

/// <summary>
/// Ordem de Separação (picking): lista o que o estoquista deve retirar das prateleiras.
/// Emitida ao clicar em "Separar" num pedido online ou ao solicitar uma transferência entre depósitos.
/// Transferência: Aberta → Separada → Expedida (em trânsito) → Concluída (recebida no destino).
/// Pedido: Aberta → Separada → Concluída (retirado/entregue).
/// </summary>
public class OrdemSeparacao : Entidade
{
    public TipoOrdemSeparacao Tipo { get; set; }
    public StatusOrdemSeparacao Status { get; set; } = StatusOrdemSeparacao.Aberta;
    public int DepositoOrigemId { get; set; }
    public Deposito? DepositoOrigem { get; set; }
    public int? DepositoDestinoId { get; set; }
    public Deposito? DepositoDestino { get; set; }
    public int? PedidoId { get; set; }
    public int? SolicitanteId { get; set; }
    public Usuario? Solicitante { get; set; }
    public int? SeparadorId { get; set; }
    public Usuario? Separador { get; set; }
    public string? Observacao { get; set; }
    public DateTime? SeparadaEm { get; set; }
    public DateTime? ExpedidaEm { get; set; }
    public DateTime? ConcluidaEm { get; set; }
    public List<ItemOrdemSeparacao> Itens { get; set; } = [];

    public bool EstaAberta => Status is StatusOrdemSeparacao.Aberta or StatusOrdemSeparacao.Separada or StatusOrdemSeparacao.Expedida;

    public void MarcarSeparada(int? separadorId, DateTime agora)
    {
        if (Status != StatusOrdemSeparacao.Aberta)
            throw new RegraNegocioException("Somente ordens em aberto podem ser separadas.");
        foreach (var item in Itens)
        {
            item.QuantidadeSeparada ??= item.Quantidade;
            if (item.QuantidadeSeparada < 0 || item.QuantidadeSeparada > item.Quantidade)
                throw new RegraNegocioException("A quantidade separada deve ficar entre zero e a quantidade solicitada.");
        }
        if (Itens.All(i => i.QuantidadeSeparada == 0))
            throw new RegraNegocioException("Nenhum item foi separado. Cancele a ordem se não houver o que enviar.");
        Status = StatusOrdemSeparacao.Separada;
        SeparadorId = separadorId;
        SeparadaEm = agora;
    }

    public void MarcarExpedida(DateTime agora)
    {
        if (Tipo != TipoOrdemSeparacao.Transferencia) throw new RegraNegocioException("Somente transferências são expedidas.");
        if (Status != StatusOrdemSeparacao.Separada) throw new RegraNegocioException("Separe e confira a ordem antes de expedir.");
        Status = StatusOrdemSeparacao.Expedida;
        ExpedidaEm = agora;
    }

    public void MarcarConcluida(DateTime agora)
    {
        if (Status is StatusOrdemSeparacao.Concluida or StatusOrdemSeparacao.Cancelada)
            throw new RegraNegocioException("Ordem já encerrada.");
        if (Tipo == TipoOrdemSeparacao.Transferencia && Status != StatusOrdemSeparacao.Expedida)
            throw new RegraNegocioException("A transferência precisa ser expedida antes do recebimento.");
        Status = StatusOrdemSeparacao.Concluida;
        SeparadaEm ??= agora;
        ConcluidaEm = agora;
    }

    public void Cancelar(DateTime agora)
    {
        if (Status is StatusOrdemSeparacao.Concluida or StatusOrdemSeparacao.Cancelada)
            throw new RegraNegocioException("Ordem já encerrada.");
        if (Status == StatusOrdemSeparacao.Expedida)
            throw new RegraNegocioException("A mercadoria já saiu do depósito; registre o recebimento no destino.");
        Status = StatusOrdemSeparacao.Cancelada;
        ConcluidaEm = agora;
    }
}

public class ItemOrdemSeparacao
{
    public int Id { get; set; }
    public int OrdemSeparacaoId { get; set; }
    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    /// <summary>Quantidade solicitada.</summary>
    public int Quantidade { get; set; }
    public int? QuantidadeSeparada { get; set; }
    public int? QuantidadeRecebida { get; set; }
    /// <summary>Endereço do produto no momento da emissão.</summary>
    public string? Localizacao { get; set; }
}
