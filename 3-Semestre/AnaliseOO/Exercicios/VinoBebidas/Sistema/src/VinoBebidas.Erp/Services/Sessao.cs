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
    public static DateOnly Hoje => DateOnly.FromDateTime(Local(DateTime.UtcNow));

    public static string Texto(Enum valor) => valor switch
    {
        TipoMovimentacao.Entrada => "Entrada",
        TipoMovimentacao.Saida => "Saída",
        TipoMovimentacao.Transferencia => "Transferência",
        TipoMovimentacao.Ajuste => "Ajuste (inventário)",
        TipoMovimentacao.Venda => "Venda",
        TipoMovimentacao.CancelamentoVenda => "Cancelamento de venda",
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
        StatusPedido.Concluido or StatusVenda.Concluida or StatusLancamento.Pago or StatusDocumento.Analisado => "ok",
        StatusPedido.Cancelado or StatusPedido.Expirado or StatusVenda.Cancelada or StatusLancamento.Cancelado or StatusDocumento.Bloqueado => "erro",
        StatusPedido.ProntoParaRetirada or StatusPedido.EmRota or StatusDocumento.Disponivel => "info",
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
