using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.Extensions.Options;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Auth;

public static class Politicas
{
    public const string Funcionario = "funcionario";
    public const string Cliente = "cliente";
    /// <summary>Painel/BI: administração, gerência e diretoria financeira.</summary>
    public const string Gestao = "gestao";
    public const string Vendas = "vendas";
    public const string Estoque = "estoque";
    public const string Financeiro = "financeiro";
    public const string Administrador = "admin";

    public const string ClaimTipo = "tipo";

    public static void Configurar(Microsoft.AspNetCore.Authorization.AuthorizationBuilder b)
    {
        static string[] Perfis(params PerfilUsuario[] p) => p.Select(x => x.ToString()).ToArray();

        b.AddPolicy(Funcionario, p => p.RequireClaim(ClaimTipo, TiposSessao.Funcionario));
        b.AddPolicy(Cliente, p => p.RequireClaim(ClaimTipo, TiposSessao.Cliente));
        b.AddPolicy(Gestao, p => p.RequireClaim(ClaimTipo, TiposSessao.Funcionario)
            .RequireRole(Perfis(PerfilUsuario.Administrador, PerfilUsuario.Gerente, PerfilUsuario.DiretorFinanceiro)));
        b.AddPolicy(Vendas, p => p.RequireClaim(ClaimTipo, TiposSessao.Funcionario)
            .RequireRole(Perfis(PerfilUsuario.Administrador, PerfilUsuario.Gerente, PerfilUsuario.Caixa, PerfilUsuario.Vendedor)));
        b.AddPolicy(Estoque, p => p.RequireClaim(ClaimTipo, TiposSessao.Funcionario)
            .RequireRole(Perfis(PerfilUsuario.Administrador, PerfilUsuario.Gerente, PerfilUsuario.Estoquista)));
        b.AddPolicy(Financeiro, p => p.RequireClaim(ClaimTipo, TiposSessao.Funcionario)
            .RequireRole(Perfis(PerfilUsuario.Administrador, PerfilUsuario.DiretorFinanceiro, PerfilUsuario.Estagiario, PerfilUsuario.Gerente)));
        b.AddPolicy(Administrador, p => p.RequireClaim(ClaimTipo, TiposSessao.Funcionario)
            .RequireRole(Perfis(PerfilUsuario.Administrador)));
    }
}

public static class ClaimsExtensions
{
    public static int Id(this ClaimsPrincipal u) =>
        int.TryParse(u.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

    public static int? FuncionarioId(this ClaimsPrincipal u) =>
        u.FindFirstValue(Politicas.ClaimTipo) == TiposSessao.Funcionario ? u.Id() : null;
}

/// <summary>Emite tokens opacos (Bearer) usando o esquema BearerToken nativo do ASP.NET Core.</summary>
public class TokenService(IOptionsMonitor<BearerTokenOptions> opcoes, TimeProvider tempo)
{
    public SessaoDto Emitir(UsuarioAutenticado u)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, u.Id.ToString()),
            new(ClaimTypes.Name, u.Nome),
            new(Politicas.ClaimTipo, u.Tipo),
            new(ClaimTypes.Role, u.Perfil ?? "Cliente")
        };
        if (!string.IsNullOrEmpty(u.Email)) claims.Add(new Claim(ClaimTypes.Email, u.Email));

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, BearerTokenDefaults.AuthenticationScheme));
        var opt = opcoes.Get(BearerTokenDefaults.AuthenticationScheme);
        var agora = tempo.GetUtcNow();
        var expira = agora.Add(opt.BearerTokenExpiration);
        var ticket = new AuthenticationTicket(principal, new AuthenticationProperties { IssuedUtc = agora, ExpiresUtc = expira },
            BearerTokenDefaults.AuthenticationScheme);
        var token = opt.BearerTokenProtector.Protect(ticket);
        return new SessaoDto(token, expira.UtcDateTime, u.Id, u.Nome, u.Tipo, u.Perfil);
    }
}
