using VinoBebidas.Domain.Common;

namespace VinoBebidas.Domain.Entities;

public class Categoria : Entidade
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    /// <summary>Somente categorias de vinho aparecem na loja online e no app de catálogo.</summary>
    public bool EhVinho { get; set; }
    /// <summary>Cor usada nos gráficos e nas ilustrações de garrafa (hex).</summary>
    public string Cor { get; set; } = "#7b2d3b";
    /// <summary>Bebida alcoólica: o PDV exige conferência de maioridade.</summary>
    public bool Alcoolico { get; set; } = true;
    /// <summary>Carga tributária aproximada (%) exibida no cupom (Lei 12.741/2012).</summary>
    public decimal TributosAproximados { get; set; }
}

public class Produto : Entidade
{
    public string Sku { get; set; } = string.Empty;
    public string? CodigoBarras { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    // Ficha técnica (vinhos)
    public string? Produtor { get; set; }
    public string? Pais { get; set; }
    public string? Regiao { get; set; }
    public string? Uva { get; set; }
    public int? Safra { get; set; }
    public decimal? TeorAlcoolico { get; set; }
    public int VolumeMl { get; set; } = 750;
    public string? Harmonizacao { get; set; }
    public string? TemperaturaServico { get; set; }
    public int? Pontuacao { get; set; }

    // Comercial
    public decimal PrecoCusto { get; set; }
    public decimal PrecoVenda { get; set; }
    public decimal? PrecoPromocional { get; set; }
    public int EstoqueMinimo { get; set; }
    public string? ImagemUrl { get; set; }
    public bool Ativo { get; set; } = true;
    /// <summary>Vinho especial exibido na loja online e no app.</summary>
    public bool VisivelLoja { get; set; }
    public bool Destaque { get; set; }

    public List<SaldoEstoque> Saldos { get; set; } = [];

    public decimal PrecoAtual => PrecoPromocional is > 0 && PrecoPromocional < PrecoVenda ? PrecoPromocional.Value : PrecoVenda;

    public decimal MargemPercentual => PrecoAtual == 0 ? 0 : Math.Round((PrecoAtual - PrecoCusto) / PrecoAtual * 100, 1);
}
