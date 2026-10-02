using Microsoft.EntityFrameworkCore;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Endpoints;

/// <summary>Endpoints públicos usados pela loja online e pelo app de catálogo.</summary>
public static class CatalogoEndpoints
{
    public static void MapCatalogo(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/catalogo").WithTags("Catálogo público");

        g.MapGet("/", async (CatalogoService s, string? busca, int? categoriaId, string? pais, string? uva, decimal? precoMin,
                decimal? precoMax, bool? disponiveis, bool? destaques, string? ordem, int? pagina, int? tamanho, CancellationToken ct) =>
            Results.Ok(await s.ListarAsync(new FiltroCatalogo(busca, categoriaId, pais, uva, precoMin, precoMax,
                disponiveis ?? false, destaques ?? false, ordem, pagina ?? 1, tamanho ?? 24), ct)))
            .WithSummary("Lista vinhos especiais com filtros e paginação");

        g.MapGet("/facetas", async (CatalogoService s, CancellationToken ct) => Results.Ok(await s.FacetasAsync(ct)));

        g.MapGet("/{id:int}", async (int id, CatalogoService s, CancellationToken ct) =>
            await s.ObterAsync(id, ct) is { } item ? Results.Ok(item) : Results.NotFound());

        g.MapGet("/lojas", async (AppDbContext db, CancellationToken ct) =>
            Results.Ok(await db.Depositos.AsNoTracking().Where(d => d.Ativo && d.PermiteRetirada)
                .OrderBy(d => d.Nome).Select(d => new { d.Id, d.Nome, d.Endereco }).ToListAsync(ct)))
            .WithSummary("Lojas disponíveis para retirada");

        g.MapGet("/frete", (decimal subtotal, string? cep, PedidoService s) => Results.Ok(s.CotarEntrega(subtotal, cep)));

        app.MapGet("/api/app/info", (IConfiguration config) => Results.Ok(new
        {
            UrlDownload = config["AppMobile:UrlDownload"],
            Versao = config["AppMobile:Versao"] ?? "1.0.0",
            Empresa = config["Empresa:Nome"] ?? "Vino Bebidas"
        })).WithTags("Catálogo público").WithSummary("Link de download do app (usado no QR code)");
    }
}
