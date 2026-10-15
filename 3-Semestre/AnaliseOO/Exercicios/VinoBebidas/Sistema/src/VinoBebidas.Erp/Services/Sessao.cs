using System.Globalization;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Erp.Services;

/// <summary>Sessão do funcionário no circuito Blazor (token guardado criptografado no sessionStorage do navegador).</summary>
public class Sessao(ProtectedSessionStorage armazenamento)
{
    private const string Chave = "vino.sessao";

    public SessaoDto? Atual { get; private set; }
    public bool Carregada { get; private set; }
    public string? Token => Atual is not null && Atual.ExpiraEm > DateTime.UtcNow ? Atual.Token : null;
    public bool Autenticado => Token is not null;
    public PerfilUsuario? Perfil => Enum.TryParse<PerfilUsuario>(Atual?.Perfil, out var p) ? p : null;
    public int? DepositoPadraoId { get; set; }

    public event Action? Mudou;

    public async Task CarregarAsync()
    {
        if (Carregada) return;
        try
        {
            var r = await armazenamento.GetAsync<SessaoDto>(Chave);
            Atual = r.Success ? r.Value : null;
        }
        catch
        {
            Atual = null; // chave de proteção mudou ou storage indisponível
        }
        Carregada = true;
        Mudou?.Invoke();
    }

    public async Task EntrarAsync(SessaoDto sessao)
    {
        if (sessao.Tipo != TiposSessao.Funcionario) throw new ApiException("Use um login de funcionário.", System.Net.HttpStatusCode.Forbidden);
        Atual = sessao;
        Carregada = true;
        try { await armazenamento.SetAsync(Chave, sessao); } catch { /* segue apenas em memória */ }
        Mudou?.Invoke();
    }

    public async Task SairAsync()
    {
        Atual = null;
        try { await armazenamento.DeleteAsync(Chave); } catch { }
        Mudou?.Invoke();
    }

    public bool Pode(params PerfilUsuario[] perfis) =>
        Perfil is { } p && (p == PerfilUsuario.Administrador || perfis.Contains(p));

    // Atalhos de permissão (espelham as políticas da API)
    public bool PodeVender => Pode(PerfilUsuario.Gerente, PerfilUsuario.Caixa, PerfilUsuario.Vendedor);
    public bool PodeEstoque => Pode(PerfilUsuario.Gerente, PerfilUsuario.Estoquista);
    public bool PodeFinanceiro => Pode(PerfilUsuario.Gerente, PerfilUsuario.DiretorFinanceiro, PerfilUsuario.Estagiario);
    public bool PodeGestao => Pode(PerfilUsuario.Gerente, PerfilUsuario.DiretorFinanceiro);
    public bool EhAdmin => Pode();
}

public static class Fmt
{
    public static readonly CultureInfo PtBr = new("pt-BR");

    public static string Moeda(decimal v) => v.ToString("C2", PtBr);
    public static string Moeda(decimal? v) => v is null ? "—" : Moeda(v.Value);
    public static string Num(decimal v, int casas = 0) => v.ToString("N" + casas, PtBr);
    public static string Pct(decimal v) => $"{v.ToString("N1", PtBr)}%";

    private static readonly TimeZoneInfo Fuso = ResolverFuso();
    private static TimeZoneInfo ResolverFuso()
    {
        foreach (var id in new[] { "America/Sao_Paulo", "E. South America Standard Time" })
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); } catch { }
        return TimeZoneInfo.Local;
    }

    public static DateTime Local(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), Fuso);
    public static string DataHora(DateTime utc) => Local(utc).ToString("dd/MM/yyyy HH:mm", PtBr);
    public static string Data(DateOnly d) => d.ToString("dd/MM/yyyy", PtBr);
    public static string Data(DateOnly? d) => d is null ? "—" : Data(d.Value);
    public static string Hora(DateTime utc) => Local(utc).ToString("HH:mm", PtBr);

    public static string CpfCnpj(string? d) => d switch
    {
        { Length: 11 } => $"{d[..3]}.{d[3..6]}.{d[6..9]}-{d[9..]}",
        { Length: 14 } => $"{d[..2]}.{d[2..5]}.{d[5..8]}/{d[8..12]}-{d[12..]}",
        null or "" => "—",
        _ => d
    };

    /// <summary>CSV com ponto e vírgula e decimais com vírgula (abre direto no Excel em português).</summary>
    public static string Csv(IEnumerable<string> cabecalho, IEnumerable<IEnumerable<object?>> linhas)
    {
        static string Celula(object? v)
        {
            var t = v switch
            {
                null => "",
                decimal d => d.ToString("0.##", PtBr),
                DateOnly d => d.ToString("dd/MM/yyyy", PtBr),
                DateTime d => Local(d).ToString("dd/MM/yyyy HH:mm", PtBr),
                Enum e => Texto(e),
                _ => v.ToString() ?? ""
            };
            return t.Contains(';') || t.Contains('"') || t.Contains('\n') ? $"\"{t.Replace("\"", "\"\"")}\"" : t;
        }
        var sb = new System.Text.StringBuilder();
        sb.AppendLine(string.Join(';', cabecalho));
        foreach (var l in linhas) sb.AppendLine(string.Join(';', l.Select(Celula)));
        return sb.ToString();
    }
    public static DateOnly Hoje => DateOnly.FromDateTime(Local(DateTime.UtcNow));

    public static string Texto(Enum valor) => valor switch
    {
        TipoMovimentacao.Entrada => "Entrada",
        TipoMovimentacao.Saida => "Saída",
        TipoMovimentacao.Transferencia => "Transferência",
        TipoMovimentacao.Ajuste => "Ajuste (inventário)",
        TipoMovimentacao.Venda => "Venda",
        TipoMovimentacao.CancelamentoVenda => "Cancelamento de venda",
        TipoMovimentacao.RecebimentoTransferencia => "Recebimento de transferência",
        MotivoSaida.Quebra => "Quebra",
        MotivoSaida.Avaria => "Avaria",
        MotivoSaida.Vencimento => "Vencimento",
        MotivoSaida.Degustacao => "Degustação",
        MotivoSaida.Brinde => "Brinde",
        MotivoSaida.UsoInterno => "Uso interno",
        MotivoSaida.DevolucaoFornecedor => "Devolução ao fornecedor",
        MotivoSaida.Outro => "Outro",
        TipoOrdemSeparacao.PedidoOnline => "Pedido online",
        TipoOrdemSeparacao.Transferencia => "Transferência",
        StatusOrdemSeparacao.Aberta => "Aguardando separação",
        StatusOrdemSeparacao.Separada => "Separada",
        StatusOrdemSeparacao.Expedida => "Em trânsito",
        StatusOrdemSeparacao.Concluida => "Concluída",
        StatusOrdemSeparacao.Cancelada => "Cancelada",
        StatusCaixa.Aberto => "Aberto",
        StatusCaixa.Fechado => "Fechado",
        TipoMovimentoCaixa.Sangria => "Sangria",
        TipoMovimentoCaixa.Suprimento => "Suprimento",
        FormaPagamento.Dinheiro => "Dinheiro",
        FormaPagamento.Pix => "Pix",
        FormaPagamento.CartaoCredito => "Crédito",
        FormaPagamento.CartaoDebito => "Débito",
        FormaPagamento.Boleto => "Boleto",
        FormaPagamento.PagamentoNaEntrega => "Na entrega/retirada",
        StatusPedido.Pendente => "Pendente",
        StatusPedido.Confirmado => "Confirmado",
        StatusPedido.EmSeparacao => "Em separação",
        StatusPedido.ProntoParaRetirada => "Pronto p/ retirada",
        StatusPedido.EmRota => "Em rota",
        StatusPedido.Concluido => "Concluído",
        StatusPedido.Cancelado => "Cancelado",
        StatusPedido.Expirado => "Expirado",
        StatusVenda.Concluida => "Concluída",
        StatusVenda.Cancelada => "Cancelada",
        TipoPedido.Reserva => "Reserva",
        TipoPedido.Compra => "Compra",
        ModalidadeEntrega.Retirada => "Retirada",
        ModalidadeEntrega.Entrega => "Entrega",
        TipoDeposito.Loja => "Loja",
        TipoDeposito.CentroDistribuicao => "Centro de distribuição",
        TipoDeposito.Adega => "Adega",
        PerfilUsuario.Administrador => "Administrador",
        PerfilUsuario.Gerente => "Gerente",
        PerfilUsuario.DiretorFinanceiro => "Diretor financeiro",
        PerfilUsuario.Vendedor => "Vendedor/consultor",
        PerfilUsuario.Caixa => "Caixa",
        PerfilUsuario.Estoquista => "Estoquista",
        PerfilUsuario.Estagiario => "Estagiário",
        StatusLancamento.Aberto => "Em aberto",
        StatusLancamento.Pago => "Pago",
        StatusLancamento.Cancelado => "Cancelado",
        TipoLancamento.Receita => "Receita",
        TipoLancamento.Despesa => "Despesa",
        CategoriaLancamento.Venda => "Vendas",
        CategoriaLancamento.CompraMercadoria => "Compra de mercadoria",
        CategoriaLancamento.EnergiaEletrica => "Energia elétrica",
        CategoriaLancamento.Agua => "Água",
        CategoriaLancamento.IPTU => "IPTU",
        CategoriaLancamento.Manutencao => "Manutenção",
        CategoriaLancamento.FolhaPagamento => "Folha de pagamento",
        CategoriaLancamento.Impostos => "Impostos",
        CategoriaLancamento.Aluguel => "Aluguel",
        CategoriaLancamento.Frete => "Frete",
        CategoriaLancamento.Marketing => "Marketing",
        CategoriaLancamento.Outros => "Outros",
        StatusDocumento.Bloqueado => "Bloqueado",
        StatusDocumento.Disponivel => "Disponível",
        StatusDocumento.Analisado => "Analisado",
        TipoDocumento.Despesa => "Despesa",
        TipoDocumento.Venda => "Venda",
        TipoDocumento.Compra => "Compra",
        CanalVenda.Loja => "Loja",
        CanalVenda.Online => "Online",
        CanalVenda.Consultor => "Consultor",
        _ => valor.ToString()
    };

    public static string ClasseStatus(Enum valor) => valor switch
    {
        StatusPedido.Concluido or StatusVenda.Concluida or StatusLancamento.Pago or StatusDocumento.Analisado or StatusOrdemSeparacao.Concluida or StatusCaixa.Aberto => "ok",
        StatusPedido.Cancelado or StatusPedido.Expirado or StatusVenda.Cancelada or StatusLancamento.Cancelado or StatusDocumento.Bloqueado or StatusOrdemSeparacao.Cancelada => "erro",
        StatusPedido.ProntoParaRetirada or StatusPedido.EmRota or StatusDocumento.Disponivel or StatusOrdemSeparacao.Separada or StatusOrdemSeparacao.Expedida => "info",
        StatusCaixa.Fechado => "neutro",
        _ => "alerta"
    };
}

/// <summary>Mensagens rápidas (toasts) exibidas no canto da tela.</summary>
public class Avisos
{
    public record Aviso(Guid Id, string Texto, bool Erro);
    public List<Aviso> Lista { get; } = [];
    public event Action? Mudou;

    public void Sucesso(string texto) => Adicionar(texto, false);
    public void Erro(string texto) => Adicionar(texto, true);

    private async void Adicionar(string texto, bool erro)
    {
        var a = new Aviso(Guid.NewGuid(), texto, erro);
        Lista.Add(a);
        Mudou?.Invoke();
        await Task.Delay(erro ? 6000 : 3500);
        Lista.Remove(a);
        Mudou?.Invoke();
    }
}

/// <summary>Dados da empresa para cabeçalhos de cupom e documentos (carregados uma vez por sessão).</summary>
public class DadosEmpresa(ApiClient api)
{
    private EmpresaDto? _empresa;

    public async Task<EmpresaDto> ObterAsync()
    {
        if (_empresa is not null) return _empresa;
        try { _empresa = await api.GetAsync<EmpresaDto>("api/empresa"); }
        catch (ApiException) { return new EmpresaDto("Vino Bebidas", "Vino Bebidas", "", null, null, "Catanduva", null, null); }
        return _empresa;
    }
}
