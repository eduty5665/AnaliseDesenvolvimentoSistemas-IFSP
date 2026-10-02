using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using VinoBebidas.Api.Auth;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Endpoints;

public static class PedidosEndpoints
{
    public static void MapPedidos(this IEndpointRouteBuilder app)
    {
        // ── Área do cliente (loja online) ──
        var cli = app.MapGroup("/api/minha-conta").WithTags("Loja online - cliente").RequireAuthorization(Politicas.Cliente);

        cli.MapGet("/", async (ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
        {
            var id = user.Id();
            return await db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct) is { } c ? Results.Ok(c.ToDto()) : Results.NotFound();
        });

        cli.MapPut("/", async (ClienteSalvarRequest r, ClaimsPrincipal user, AppDbContext db, CancellationToken ct) =>
        {
            var id = user.Id();
            var c = await db.Clientes.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NaoEncontradoException("Cliente não encontrado.");
            if (string.IsNullOrWhiteSpace(r.Nome)) throw new RegraNegocioException("Informe o nome.");
            c.Nome = r.Nome.Trim();
            c.Telefone = r.Telefone;
            if (r.Endereco is not null) c.Endereco = r.Endereco.ToEntity();
            c.AceitaMarketing = r.AceitaMarketing;
            await db.SaveChangesAsync(ct);
            return Results.Ok(c.ToDto());
        });

        cli.MapGet("/pedidos", async (ClaimsPrincipal user, PedidoService s, CancellationToken ct) =>
            Results.Ok(await s.ListarAsync(null, false, user.Id(), 100, ct)));

        cli.MapPost("/pedidos", async (CriarPedidoRequest r, ClaimsPrincipal user, PedidoService s, CancellationToken ct) =>
            Results.Ok(await s.CriarAsync(user.Id(), r, ct)))
            .WithSummary("Cria reserva ou compra (retirada ou entrega)");

        cli.MapPost("/pedidos/{id:int}/cancelar", async (int id, ClaimsPrincipal user, PedidoService s, CancellationToken ct) =>
            Results.Ok(await s.CancelarPeloClienteAsync(user.Id(), id, ct)));

        // ── Gestão de pedidos no ERP ──
        var g = app.MapGroup("/api/pedidos").WithTags("Pedidos online - ERP").RequireAuthorization(Politicas.Funcionario);

        g.MapGet("/", async (PedidoService s, StatusPedido? status, bool? abertos, int? clienteId, int? limite, CancellationToken ct) =>
            Results.Ok(await s.ListarAsync(status, abertos ?? false, clienteId, limite ?? 200, ct)));

        g.MapGet("/{id:int}", async (int id, PedidoService s, CancellationToken ct) =>
            await s.ObterAsync(id, ct) is { } p ? Results.Ok(p) : Results.NotFound());

        g.MapPost("/{id:int}/status", async (int id, AlterarStatusPedidoRequest r, PedidoService s, ClaimsPrincipal user, CancellationToken ct) =>
            Results.Ok(await s.AlterarStatusAsync(id, r.Status, user.FuncionarioId(), ct)))
            .WithSummary("Avança o pedido (separação, pronto, em rota, concluído) ou cancela");
    }
}
