using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using VinoBebidas.Api.Auth;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Endpoints;

/// <summary>Produtos, categorias, depósitos, estoque e vendas do PDV.</summary>
public static class ErpEndpoints
{
    public static void MapErp(this IEndpointRouteBuilder app)
    {
        MapProdutos(app);
        MapEstoque(app);
        MapVendas(app);
    }

    private static void MapProdutos(IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/produtos").WithTags("Produtos").RequireAuthorization(Politicas.Funcionario);

        g.MapGet("/", async (ProdutoService s, string? busca, int? categoriaId, bool? ativo, bool? visivelLoja, int? pagina, int? tamanho, CancellationToken ct) =>
            Results.Ok(await s.ListarAsync(busca, categoriaId, ativo, visivelLoja, pagina ?? 1, tamanho ?? 50, ct)));

        g.MapGet("/{id:int}", async (int id, ProdutoService s, CancellationToken ct) =>
            await s.ObterAsync(id, ct) is { } p ? Results.Ok(p) : Results.NotFound());

        g.MapGet("/codigo/{codigo}", async (string codigo, ProdutoService s, CancellationToken ct) =>
            await s.BuscarPorCodigoAsync(codigo, ct) is { } p ? Results.Ok(p) : Results.NotFound(new ErroDto("Produto não encontrado")))
            .WithSummary("Busca por código de barras ou SKU (leitor do PDV)");

        g.MapPost("/", async (ProdutoSalvarRequest r, ProdutoService s, CancellationToken ct) =>
            Results.Ok(await s.SalvarAsync(null, r, ct))).RequireAuthorization(Politicas.Estoque);

        g.MapPut("/{id:int}", async (int id, ProdutoSalvarRequest r, ProdutoService s, CancellationToken ct) =>
            Results.Ok(await s.SalvarAsync(id, r, ct))).RequireAuthorization(Politicas.Estoque);

        var c = app.MapGroup("/api/categorias").WithTags("Produtos");
        c.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            Results.Ok((await db.Categorias.AsNoTracking().OrderBy(x => x.Nome).ToListAsync(ct)).Select(x => x.ToDto())));
        c.MapPost("/", async (CategoriaSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var cat = new Categoria();
            Aplicar(cat, r);
            db.Categorias.Add(cat);
            await db.SaveChangesAsync(ct);
            return Results.Ok(cat.ToDto());
        }).RequireAuthorization(Politicas.Estoque);
        c.MapPut("/{id:int}", async (int id, CategoriaSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var cat = await db.Categorias.FindAsync([id], ct) ?? throw new NaoEncontradoException("Categoria não encontrada.");
            Aplicar(cat, r);
            await db.SaveChangesAsync(ct);
            return Results.Ok(cat.ToDto());
        }).RequireAuthorization(Politicas.Estoque);

        static void Aplicar(Categoria cat, CategoriaSalvarRequest r)
        {
            if (string.IsNullOrWhiteSpace(r.Nome)) throw new RegraNegocioException("Informe o nome da categoria.");
            cat.Nome = r.Nome.Trim();
            cat.Descricao = r.Descricao;
            cat.EhVinho = r.EhVinho;
            if (!string.IsNullOrWhiteSpace(r.Cor)) cat.Cor = r.Cor;
        }
    }

    private static void MapEstoque(IEndpointRouteBuilder app)
    {
        var d = app.MapGroup("/api/depositos").WithTags("Estoque").RequireAuthorization(Politicas.Funcionario);
        d.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            Results.Ok((await db.Depositos.AsNoTracking().OrderBy(x => x.Nome).ToListAsync(ct)).Select(x => x.ToDto())));
        d.MapPost("/", async (DepositoSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var dep = new Deposito();
            Aplicar(dep, r);
            db.Depositos.Add(dep);
            await db.SaveChangesAsync(ct);
            return Results.Ok(dep.ToDto());
        }).RequireAuthorization(Politicas.Gestao);
        d.MapPut("/{id:int}", async (int id, DepositoSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var dep = await db.Depositos.FindAsync([id], ct) ?? throw new NaoEncontradoException("Depósito não encontrado.");
            Aplicar(dep, r);
            await db.SaveChangesAsync(ct);
            return Results.Ok(dep.ToDto());
        }).RequireAuthorization(Politicas.Gestao);

        static void Aplicar(Deposito dep, DepositoSalvarRequest r)
        {
            if (string.IsNullOrWhiteSpace(r.Nome)) throw new RegraNegocioException("Informe o nome do depósito.");
            dep.Nome = r.Nome.Trim();
            dep.Tipo = r.Tipo;
            dep.Endereco = r.Endereco;
            dep.PermiteRetirada = r.PermiteRetirada;
            dep.AtendeOnline = r.AtendeOnline;
            dep.Ativo = r.Ativo;
        }

        var g = app.MapGroup("/api/estoque").WithTags("Estoque").RequireAuthorization(Politicas.Funcionario);

        g.MapGet("/saldos", async (EstoqueService s, int? depositoId, string? busca, bool? abaixoMinimo, CancellationToken ct) =>
            Results.Ok(await s.ListarSaldosAsync(depositoId, busca, abaixoMinimo ?? false, ct)));

        g.MapGet("/movimentacoes", async (EstoqueService s, TipoMovimentacao? tipo, int? produtoId, int? depositoId, DateOnly? de, DateOnly? ate,
                int? pagina, int? tamanho, CancellationToken ct) =>
            Results.Ok(await s.ListarMovimentacoesAsync(tipo, produtoId, depositoId, de, ate, pagina ?? 1, tamanho ?? 50, ct)));

        g.MapPost("/movimentacoes", async (MovimentacaoRequest r, EstoqueService s, ClaimsPrincipal user, CancellationToken ct) =>
            Results.Ok(await s.RegistrarAsync(r, user.FuncionarioId(), ct)))
            .RequireAuthorization(Politicas.Estoque)
            .WithSummary("Entrada de NF, saída, transferência entre depósitos ou ajuste de inventário");
    }

    private static void MapVendas(IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/vendas").WithTags("Vendas (PDV)").RequireAuthorization(Politicas.Funcionario);

        g.MapPost("/", async (VendaRequest r, VendaService s, ClaimsPrincipal user, CancellationToken ct) =>
            Results.Ok(await s.RegistrarAsync(r, user.FuncionarioId(), ct)))
            .RequireAuthorization(Politicas.Vendas)
            .WithSummary("Registra uma venda do PDV (baixa estoque e lança receita)");

        g.MapGet("/", async (VendaService s, DateOnly? de, DateOnly? ate, CanalVenda? canal, StatusVenda? status, int? clienteId,
                int? pagina, int? tamanho, CancellationToken ct) =>
            Results.Ok(await s.ListarAsync(de, ate, canal, status, clienteId, pagina ?? 1, tamanho ?? 50, ct)));

        g.MapGet("/{id:int}", async (int id, VendaService s, CancellationToken ct) =>
            await s.ObterAsync(id, ct) is { } v ? Results.Ok(v) : Results.NotFound());

        g.MapPost("/{id:int}/cancelar", async (int id, CancelarVendaRequest r, VendaService s, ClaimsPrincipal user, CancellationToken ct) =>
            Results.Ok(await s.CancelarAsync(id, r.Motivo, user.FuncionarioId(), ct)))
            .RequireAuthorization(Politicas.Gestao)
            .WithSummary("Cancela a venda, devolve o estoque e estorna a receita");
    }
}
