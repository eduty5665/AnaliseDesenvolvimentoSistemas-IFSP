using System.Security.Claims;
using VinoBebidas.Api.Auth;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Endpoints;

/// <summary>Módulo financeiro (documentação da Entrega Final): contas, alertas, resumo, documentos/OCR e painel BI.</summary>
public static class FinanceiroEndpoints
{
    public static void MapFinanceiro(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/financeiro").WithTags("Financeiro").RequireAuthorization(Politicas.Financeiro);

        g.MapGet("/lancamentos", async (FinanceiroService s, TipoLancamento? tipo, StatusLancamento? status, CategoriaLancamento? categoria,
                int? setorId, DateOnly? de, DateOnly? ate, bool? atrasados, bool? incluirVendas, int? pagina, int? tamanho, CancellationToken ct) =>
            Results.Ok(await s.ListarAsync(tipo, status, categoria, setorId, de, ate, atrasados ?? false, incluirVendas ?? false,
                pagina ?? 1, tamanho ?? 100, ct)))
            .WithSummary("Contas a pagar e a receber (filtros por período, tipo, setor)");

        g.MapPost("/lancamentos", async (LancamentoSalvarRequest r, FinanceiroService s, CancellationToken ct) =>
            Results.Ok(await s.SalvarAsync(null, r, ct)));

        g.MapPut("/lancamentos/{id:int}", async (int id, LancamentoSalvarRequest r, FinanceiroService s, CancellationToken ct) =>
            Results.Ok(await s.SalvarAsync(id, r, ct)));

        g.MapPost("/lancamentos/{id:int}/pagar", async (int id, PagarLancamentoRequest r, FinanceiroService s, CancellationToken ct) =>
            Results.Ok(await s.PagarAsync(id, r.DataPagamento, ct)));

        g.MapPost("/lancamentos/{id:int}/cancelar", async (int id, FinanceiroService s, CancellationToken ct) =>
            Results.Ok(await s.CancelarAsync(id, ct)));

        g.MapGet("/alertas", async (FinanceiroService s, int? dias, CancellationToken ct) =>
            Results.Ok(await s.AlertasAsync(dias ?? 7, ct)))
            .WithSummary("Vencimentos próximos e contas atrasadas (RF06)");

        g.MapGet("/resumo", async (FinanceiroService s, int? ano, int? mes, CancellationToken ct) =>
            Results.Ok(await s.ResumoAsync(ano, mes, ct)));

        // ── Documentos / OCR ──
        var d = app.MapGroup("/api/documentos").WithTags("Documentos (OCR)").RequireAuthorization(Politicas.Financeiro);

        d.MapPost("/", async (IFormFile arquivo, [Microsoft.AspNetCore.Mvc.FromForm] TipoDocumento tipo, [Microsoft.AspNetCore.Mvc.FromForm] int? setorId,
                [Microsoft.AspNetCore.Mvc.FromForm] string? descricao, DocumentoService s, ClaimsPrincipal user, CancellationToken ct) =>
            {
                await using var stream = arquivo.OpenReadStream();
                return Results.Ok(await s.ReceberAsync(stream, arquivo.FileName, arquivo.ContentType, tipo, setorId, descricao, user.FuncionarioId(), ct));
            })
            .DisableAntiforgery()
            .WithSummary("Recebe documento digitalizado (PDF/imagem/TXT) e executa o OCR");

        d.MapGet("/", async (DocumentoService s, StatusDocumento? status, CancellationToken ct) => Results.Ok(await s.ListarAsync(status, ct)));

        d.MapGet("/{id:int}", async (int id, DocumentoService s, CancellationToken ct) =>
            await s.ObterAsync(id, ct) is { } doc ? Results.Ok(doc) : Results.NotFound());

        d.MapGet("/{id:int}/arquivo", async (int id, DocumentoService s, CancellationToken ct) =>
            await s.AbrirArquivoAsync(id, ct) is { } a ? Results.File(a.Conteudo, a.ContentType, a.Nome) : Results.NotFound())
            .WithSummary("Baixa o arquivo original (caso de uso BaixarDoc)");

        d.MapPost("/{id:int}/verificar", async (int id, VerificarDocumentoRequest r, DocumentoService s, CancellationToken ct) =>
            Results.Ok(await s.VerificarAsync(id, r, ct)))
            .WithSummary("Verificação de padrão: completo → Disponível → análise gerada (lançamento)");

        // ── Painel / BI ──
        app.MapGet("/api/painel", async (AnalyticsService s, int? dias, int? horizonte, CancellationToken ct) =>
                Results.Ok(await s.DashboardAsync(dias ?? 90, horizonte ?? 30, ct)))
            .WithTags("Painel").RequireAuthorization(Politicas.Gestao)
            .WithSummary("KPIs, séries, rankings, cobertura de estoque e projeção de vendas");
    }
}
