using System.Security.Claims;
using VinoBebidas.Api.Auth;
using VinoBebidas.Contracts;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuth(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/auth").WithTags("Autenticação");

        g.MapPost("/funcionarios/login", async (LoginFuncionarioRequest r, AuthService auth, TokenService tokens, HttpContext ctx, CancellationToken ct) =>
        {
            var origem = ctx.Request.Headers["X-Origem"].FirstOrDefault() ?? "api";
            var u = await auth.AutenticarFuncionarioAsync(r.Login, r.Senha, ctx.Connection.RemoteIpAddress?.ToString(), origem, ct);
            return u is null
                ? Results.Json(new ErroDto("Credenciais de acesso inválidas"), statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(tokens.Emitir(u));
        }).WithSummary("Login de funcionário (login ou CPF + senha)");

        g.MapPost("/clientes/login", async (LoginClienteRequest r, AuthService auth, TokenService tokens, HttpContext ctx, CancellationToken ct) =>
        {
            var u = await auth.AutenticarClienteAsync(r.Email, r.Senha, ctx.Connection.RemoteIpAddress?.ToString(), ct);
            return u is null
                ? Results.Json(new ErroDto("E-mail ou senha inválidos"), statusCode: StatusCodes.Status401Unauthorized)
                : Results.Ok(tokens.Emitir(u));
        }).WithSummary("Login de cliente da loja online");

        g.MapPost("/clientes/registrar", async (RegistrarClienteRequest r, AuthService auth, TokenService tokens, CancellationToken ct) =>
            Results.Ok(tokens.Emitir(await auth.RegistrarClienteAsync(r, ct))))
            .WithSummary("Cria conta de cliente (somente maiores de 18 anos)");

        g.MapGet("/eu", (ClaimsPrincipal user) => Results.Ok(new
        {
            Id = user.Id(),
            Nome = user.FindFirstValue(ClaimTypes.Name),
            Tipo = user.FindFirstValue(Politicas.ClaimTipo),
            Perfil = user.FindFirstValue(ClaimTypes.Role)
        })).RequireAuthorization();
    }
}
