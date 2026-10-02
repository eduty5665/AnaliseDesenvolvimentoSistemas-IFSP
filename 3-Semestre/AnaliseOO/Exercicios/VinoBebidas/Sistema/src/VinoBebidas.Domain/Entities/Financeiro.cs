using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Domain.Entities;

/// <summary>Conta a pagar ou a receber (energia, água, IPTU, manutenção, folha, fornecedores, vendas...).</summary>
public class LancamentoFinanceiro : Entidade
{
    public TipoLancamento Tipo { get; set; }
    public CategoriaLancamento Categoria { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public DateOnly Competencia { get; set; }
    public DateOnly Vencimento { get; set; }
    public DateOnly? DataPagamento { get; set; }
    public StatusLancamento Status { get; set; } = StatusLancamento.Aberto;
    public int? SetorId { get; set; }
    public Setor? Setor { get; set; }
    public int? FornecedorId { get; set; }
    public Fornecedor? Fornecedor { get; set; }
    public int? CadastroBancarioId { get; set; }
    public CadastroBancario? CadastroBancario { get; set; }
    public int? VendaId { get; set; }
    public int? DocumentoId { get; set; }
    /// <summary>Consumo medido (ex.: kWh da conta de energia, m³ da conta de água).</summary>
    public decimal? ConsumoQuantidade { get; set; }
    public string? ConsumoUnidade { get; set; }
    public string? Observacao { get; set; }

    public bool EstaAtrasado(DateOnly hoje) => Status == StatusLancamento.Aberto && Vencimento < hoje;

    public void Pagar(DateOnly data)
    {
        if (Status != StatusLancamento.Aberto) throw new RegraNegocioException("Somente lançamentos em aberto podem ser baixados.");
        Status = StatusLancamento.Pago;
        DataPagamento = data;
    }

    public void Cancelar()
    {
        if (Status == StatusLancamento.Pago) throw new RegraNegocioException("Lançamento já pago não pode ser cancelado.");
        Status = StatusLancamento.Cancelado;
    }
}

/// <summary>
/// Documento recebido dos setores para digitalização/OCR.
/// Segue o Diagrama de Estado: recebe doc → Bloqueado → (completo) Disponível → análise gerada → Analisado.
/// </summary>
public class Documento : Entidade
{
    public string Nome { get; set; } = string.Empty;
    public string CaminhoArquivo { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public string? Descricao { get; set; }
    public TipoDocumento Tipo { get; set; }
    public int? SetorId { get; set; }
    public Setor? Setor { get; set; }
    public DateTime DataDigitalizacao { get; set; } = DateTime.UtcNow;
    public string? ConteudoExtraido { get; set; }
    public StatusDocumento Status { get; set; } = StatusDocumento.Bloqueado;
    public string? Pendencias { get; set; }
    public int? ResponsavelId { get; set; }
    public Usuario? Responsavel { get; set; }
    public int? LancamentoId { get; set; }

    public bool FoiProcessado => Status == StatusDocumento.Analisado;

    /// <summary>"Verificação de padrão doc": se completo vai para Disponível, senão permanece Bloqueado.</summary>
    public void VerificarPadrao(IReadOnlyCollection<string> pendencias)
    {
        if (Status == StatusDocumento.Analisado) throw new RegraNegocioException("Documento já analisado.");
        if (pendencias.Count == 0)
        {
            Status = StatusDocumento.Disponivel;
            Pendencias = null;
        }
        else
        {
            Status = StatusDocumento.Bloqueado;
            Pendencias = string.Join("; ", pendencias);
        }
    }

    /// <summary>"Análise gerada": só é possível a partir do estado Disponível.</summary>
    public void RegistrarAnalise(int lancamentoId)
    {
        if (Status != StatusDocumento.Disponivel)
            throw new RegraNegocioException("Somente documentos disponíveis (completos) podem gerar análise.");
        LancamentoId = lancamentoId;
        Status = StatusDocumento.Analisado;
    }
}
