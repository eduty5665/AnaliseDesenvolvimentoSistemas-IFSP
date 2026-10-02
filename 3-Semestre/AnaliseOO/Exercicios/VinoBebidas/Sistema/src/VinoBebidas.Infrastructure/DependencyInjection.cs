using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Seed;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Configura o banco único. appsettings: "Banco:Provedor" = "Sqlite" (padrão) ou "SqlServer",
    /// e ConnectionStrings:VinoBebidas.
    /// </summary>
    public static IServiceCollection AddInfraestrutura(this IServiceCollection services, IConfiguration config)
    {
        var provedor = config["Banco:Provedor"] ?? "Sqlite";
        var conexao = config.GetConnectionString("VinoBebidas") ?? "Data Source=vinobebidas.db";

        services.AddDbContext<AppDbContext>(opt =>
        {
            if (provedor.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
                opt.UseSqlServer(conexao);
            else
                opt.UseSqlite(conexao);
        });

        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<Calendario>();
        services.AddSingleton<SenhaService>();
        services.AddSingleton<IOcrService, OcrBasicoService>();
        services.TryAddSingleton<INotificadorPainel, NotificadorNulo>();
        services.AddScoped<AuthService>();
        services.AddScoped<EstoqueService>();
        services.AddScoped<VendaService>();
        services.AddScoped<PedidoService>();
        services.AddScoped<CatalogoService>();
        services.AddScoped<ProdutoService>();
        services.AddScoped<FinanceiroService>();
        services.AddScoped<DocumentoService>();
        services.AddScoped<AnalyticsService>();
        services.AddScoped<DadosIniciais>();
        return services;
    }

    /// <summary>Cria o banco (se não existir) e popula com dados de demonstração.</summary>
    public static async Task InicializarBancoAsync(this IServiceProvider services, IConfiguration config)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Banco");

        if (config.GetValue("Banco:RecriarAoIniciar", false))
        {
            log.LogWarning("Banco:RecriarAoIniciar=true → apagando e recriando o banco.");
            await db.Database.EnsureDeletedAsync();
        }

        if (config.GetValue("Banco:UsarMigrations", false))
            await db.Database.MigrateAsync();
        else
            await db.Database.EnsureCreatedAsync();

        if (config.GetValue("Banco:DadosDemonstracao", true))
            await scope.ServiceProvider.GetRequiredService<DadosIniciais>().ExecutarAsync(incluirHistorico: true);
    }

    /// <summary>Expira reservas vencidas periodicamente.</summary>
    public sealed class ExpiracaoReservasWorker(IServiceScopeFactory scopes, ILogger<ExpiracaoReservasWorker> log) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));
            do
            {
                try
                {
                    using var scope = scopes.CreateScope();
                    var n = await scope.ServiceProvider.GetRequiredService<PedidoService>().ExpirarReservasAsync(stoppingToken);
                    if (n > 0) log.LogInformation("{Quantidade} reserva(s) expirada(s).", n);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    log.LogError(ex, "Falha ao expirar reservas");
                }
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }
    }
}
