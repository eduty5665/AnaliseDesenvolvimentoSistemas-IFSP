using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using VinoBebidas.Contracts;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>Datas do negócio no fuso da loja (datas no banco ficam em UTC).</summary>
public class Calendario
{
    private readonly TimeProvider _tempo;
    public TimeZoneInfo Fuso { get; }

    public Calendario(TimeProvider tempo, IConfiguration config)
    {
        _tempo = tempo;
        Fuso = ResolverFuso(config["Empresa:FusoHorario"] ?? "America/Sao_Paulo");
    }

    public static TimeZoneInfo ResolverFuso(string id)
    {
        foreach (var candidato in new[] { id, "America/Sao_Paulo", "E. South America Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(candidato); }
            catch (TimeZoneNotFoundException) { }
            catch (InvalidTimeZoneException) { }
        }
        return TimeZoneInfo.Utc;
    }

    public DateTime AgoraUtc => _tempo.GetUtcNow().UtcDateTime;
    public DateTime AgoraLocal => TimeZoneInfo.ConvertTimeFromUtc(AgoraUtc, Fuso);
    public DateOnly Hoje => DateOnly.FromDateTime(AgoraLocal);

    public DateTime ParaLocal(DateTime utc) => TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), Fuso);
    public DateOnly DataLocal(DateTime utc) => DateOnly.FromDateTime(ParaLocal(utc));

    /// <summary>Início (UTC) do dia local informado.</summary>
    public DateTime InicioDoDiaUtc(DateOnly dia) =>
        TimeZoneInfo.ConvertTimeToUtc(dia.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), Fuso);
}

/// <summary>Publica eventos para o painel ao vivo (implementado com SignalR na API).</summary>
public interface INotificadorPainel
{
    Task PublicarAsync(EventoPainelDto evento, CancellationToken ct = default);
}

public sealed class NotificadorNulo : INotificadorPainel
{
    public Task PublicarAsync(EventoPainelDto evento, CancellationToken ct = default) => Task.CompletedTask;
}

public class SenhaService
{
    private readonly PasswordHasher<object> _hasher = new();
    private static readonly object Dono = new();

    public string Gerar(string senha)
    {
        if (string.IsNullOrWhiteSpace(senha) || senha.Length < 6)
            throw new Domain.Common.RegraNegocioException("A senha deve ter pelo menos 6 caracteres.");
        return _hasher.HashPassword(Dono, senha);
    }

    public bool Conferir(string hash, string senha) =>
        !string.IsNullOrEmpty(hash) &&
        _hasher.VerifyHashedPassword(Dono, hash, senha) != PasswordVerificationResult.Failed;
}

public static class Busca
{
    /// <summary>
    /// Padrão LIKE em minúsculas. Use sempre com a coluna em minúsculas — EF.Functions.Like(x.Nome.ToLower(), padrao) —
    /// para a busca não diferenciar maiúsculas em SQLite, SQL Server e PostgreSQL.
    /// </summary>
    public static string Padrao(string termo) =>
        "%" + termo.Trim().ToLowerInvariant().Replace("%", " ").Replace("_", " ").Replace("[", " ") + "%";
}
