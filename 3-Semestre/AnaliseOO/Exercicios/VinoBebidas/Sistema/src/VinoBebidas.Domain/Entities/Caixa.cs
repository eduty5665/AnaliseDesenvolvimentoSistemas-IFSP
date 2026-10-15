using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Domain.Entities;

/// <summary>
/// Sessão de caixa do PDV: o operador abre com um fundo de troco, registra vendas, sangrias e suprimentos
/// e fecha conferindo o dinheiro contado na gaveta contra o esperado.
/// </summary>
public class CaixaSessao : Entidade
{
    public int DepositoId { get; set; }
    public Deposito? Deposito { get; set; }
    public int OperadorId { get; set; }
    public Usuario? Operador { get; set; }
    public StatusCaixa Status { get; set; } = StatusCaixa.Aberto;
    public DateTime AbertoEm { get; set; } = DateTime.UtcNow;
    public DateTime? FechadoEm { get; set; }
    /// <summary>Fundo de troco informado na abertura.</summary>
    public decimal ValorAbertura { get; set; }
    /// <summary>Dinheiro que deveria estar na gaveta no fechamento (calculado).</summary>
    public decimal? ValorEsperado { get; set; }
    /// <summary>Dinheiro contado pelo operador no fechamento.</summary>
    public decimal? ValorContado { get; set; }
    public string? Observacao { get; set; }
    public List<MovimentoCaixa> Movimentos { get; set; } = [];

    public decimal? Diferenca => ValorContado - ValorEsperado;

    public MovimentoCaixa Movimentar(TipoMovimentoCaixa tipo, decimal valor, string motivo, int? usuarioId, DateTime agora)
    {
        if (Status != StatusCaixa.Aberto) throw new RegraNegocioException("O caixa está fechado.");
        if (valor <= 0) throw new RegraNegocioException("Informe um valor maior que zero.");
        if (string.IsNullOrWhiteSpace(motivo)) throw new RegraNegocioException("Informe o motivo.");
        var mov = new MovimentoCaixa { Tipo = tipo, Valor = valor, Motivo = motivo.Trim(), UsuarioId = usuarioId, CriadoEm = agora };
        Movimentos.Add(mov);
        return mov;
    }

    public void Fechar(decimal esperadoEmDinheiro, decimal contado, string? observacao, DateTime agora)
    {
        if (Status != StatusCaixa.Aberto) throw new RegraNegocioException("O caixa já está fechado.");
        if (contado < 0) throw new RegraNegocioException("Valor contado inválido.");
        Status = StatusCaixa.Fechado;
        FechadoEm = agora;
        ValorEsperado = esperadoEmDinheiro;
        ValorContado = contado;
        Observacao = observacao?.Trim();
    }
}

public class MovimentoCaixa
{
    public int Id { get; set; }
    public int CaixaSessaoId { get; set; }
    public TipoMovimentoCaixa Tipo { get; set; }
    public decimal Valor { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public int? UsuarioId { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
