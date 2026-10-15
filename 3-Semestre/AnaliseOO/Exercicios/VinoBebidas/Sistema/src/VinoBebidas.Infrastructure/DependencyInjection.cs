using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VinoBebidas.Domain.Common;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Seed;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Infrastructure;

public enum ProvedorBanco { Sqlite, SqlServer, Postgres }

/// <summary>
/// Resolve provedor e string de conexão. No PostgreSQL (Supabase) testa a conexão principal e as alternativas
/// (conexão direta IPv6, pooler IPv4...) e fica com a primeira que responder.
/// </summary>
public sealed class ConexaoBanco
{
    public const string SqliteLocal = "Data Source=vinobebidas.db";

    public ProvedorBanco Provedor { get; }
    public string Texto { get; }
    /// <summary>Verdadeiro quando o PostgreSQL configurado não respondeu e a API subiu no SQLite local.</summary>
    public bool EmContingencia { get; }
    public string Descricao => Provedor switch
    {
        ProvedorBanco.Postgres => $"PostgreSQL ({Servidor(Texto)})",
        ProvedorBanco.SqlServer => "SQL Server",
        _ => EmContingencia ? "SQLite local (contingência: PostgreSQL indisponível)" : "SQLite local"
    };

    public ConexaoBanco(IConfiguration config, ILogger<ConexaoBanco> log)
    {
        Provedor = LerProvedor(config);
        var principal = config.GetConnectionString("VinoBebidas") ?? SqliteLocal;
        Texto = principal;
        if (Provedor != ProvedorBanco.Postgres) return;

        var candidatas = new List<string> { principal };
        candidatas.AddRange(config.GetSection("Banco:ConexoesAlternativas").Get<string[]>() ?? []);
        candidatas = candidatas.Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().ToList();
        var contingencia = config.GetValue("Banco:SeFalharUsarSqlite", false);
        if (candidatas.Count <= 1 && !contingencia) return;

        foreach (var candidata in candidatas)
        {
            var servidor = Servidor(candidata);
            try
            {
                var opcoes = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(candidata).Options;
                using var teste = new AppDbContext(opcoes);
                if (teste.Database.CanConnect())
                {
                    log.LogInformation("Banco PostgreSQL conectado ({Servidor}).", servidor);
                    Texto = candidata;
                    return;
                }
            }
            catch (Exception ex)
            {
                log.LogDebug(ex, "Falha ao testar conexão {Servidor}", servidor);
            }
            log.LogWarning("Não foi possível conectar em {Servidor}; tentando a próxima conexão...", servidor);
        }

        if (contingencia)
        {
            log.LogError("NENHUMA conexão PostgreSQL respondeu. Banco:SeFalharUsarSqlite=true → usando o SQLite local ({Arquivo}). " +
                         "O que for gravado agora NÃO vai para o Supabase.", SqliteLocal);
            Provedor = ProvedorBanco.Sqlite;
            Texto = SqliteLocal;
            EmContingencia = true;
            return;
        }
        log.LogError("Nenhuma das conexões PostgreSQL respondeu. Confira ConnectionStrings:VinoBebidas e sua rede.");
    }

    private static string Servidor(string conexao) =>
        conexao.Split(';').Select(p => p.Trim()).FirstOrDefault(p => p.StartsWith("Host", StringComparison.OrdinalIgnoreCase))?.Split('=', 2).ElementAtOrDefault(1)?.Trim() ?? "?";

    public static ProvedorBanco LerProvedor(IConfiguration config) => (config["Banco:Provedor"] ?? "Sqlite").Trim().ToLowerInvariant() switch
    {
        "sqlserver" or "mssql" => ProvedorBanco.SqlServer,
        "postgres" or "postgresql" or "npgsql" or "supabase" => ProvedorBanco.Postgres,
        _ => ProvedorBanco.Sqlite
    };
}

public static class DependencyInjection
{
    /// <summary>
    /// Configura o banco único. appsettings: "Banco:Provedor" = "Sqlite" (padrão), "SqlServer" ou "Postgres" (Supabase),
    /// e ConnectionStrings:VinoBebidas.
    /// </summary>
    public static IServiceCollection AddInfraestrutura(this IServiceCollection services, IConfiguration config)
    {
        services.AddSingleton<ConexaoBanco>();
        services.AddDbContext<AppDbContext>((sp, opt) =>
        {
            var conexao = sp.GetRequiredService<ConexaoBanco>();
            switch (conexao.Provedor)
            {
                case ProvedorBanco.SqlServer: opt.UseSqlServer(conexao.Texto); break;
                case ProvedorBanco.Postgres: opt.UseNpgsql(conexao.Texto); break;
                default: opt.UseSqlite(conexao.Texto); break;
            }
        });

        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<Calendario>();
        services.AddSingleton<SenhaService>();
        services.AddSingleton<IOcrService, OcrBasicoService>();
        services.TryAddSingleton<INotificadorPainel, NotificadorNulo>();
        services.AddScoped<AuthService>();
        services.AddScoped<EstoqueService>();
        services.AddScoped<OrdemSeparacaoService>();
        services.AddScoped<CaixaService>();
        services.AddScoped<VendaService>();
        services.AddScoped<PedidoService>();
        services.AddScoped<CatalogoService>();
        services.AddScoped<ProdutoService>();
        services.AddScoped<FinanceiroService>();
        services.AddScoped<DocumentoService>();
        services.AddScoped<AnalyticsService>();
        services.AddScoped<RelatorioService>();
        services.AddScoped<DadosIniciais>();
        return services;
    }

    /// <summary>Cria as tabelas (se não existirem), confere a versão do esquema e popula os dados de demonstração.</summary>
    public static async Task InicializarBancoAsync(this IServiceProvider services, IConfiguration config)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<AppDbContext>();
        var conexao = sp.GetRequiredService<ConexaoBanco>();
        var log = sp.GetRequiredService<ILoggerFactory>().CreateLogger("Banco");
        log.LogInformation("Banco de dados: {Banco}", conexao.Descricao);

        if (config.GetValue("Banco:RecriarAoIniciar", false) && conexao.Provedor != ProvedorBanco.Postgres)
        {
            log.LogWarning("Banco:RecriarAoIniciar=true → apagando e recriando o banco.");
            await db.Database.EnsureDeletedAsync();
        }

        if (config.GetValue("Banco:UsarMigrations", false))
        {
            await db.Database.MigrateAsync();
        }
        else if (conexao.Provedor == ProvedorBanco.Postgres)
        {
            // No Supabase o banco "postgres" já existe com tabelas de outros schemas, então EnsureCreated não faz nada.
            // Criamos somente as nossas tabelas (schema "vino") quando ainda não existem.
            if (!await TabelasExistemAsync(db))
            {
                log.LogInformation("Criando tabelas no PostgreSQL (schema {Schema})...", AppDbContext.SchemaPostgres);
                await db.GetService<IRelationalDatabaseCreator>().CreateTablesAsync();
            }
            else if (await ConferirEsquemaAsync(db) is { } problema)
            {
                // As tabelas existem, mas não batem com as entidades desta versão (coluna faltando, tipo diferente...)
                if (!config.GetValue("Banco:RecriarSeIncompativel", false))
                    throw new InvalidOperationException(
                        $"O schema \"{AppDbContext.SchemaPostgres}\" do PostgreSQL não corresponde a esta versão do sistema ({problema}). " +
                        "Aplique o script de atualização da pasta banco/ ou, se os dados forem só de demonstração, " +
                        "defina Banco:RecriarSeIncompativel=true para recriar as tabelas.");
                log.LogWarning("Schema {Schema} incompatível ({Problema}). Banco:RecriarSeIncompativel=true → recriando as tabelas.",
                    AppDbContext.SchemaPostgres, problema);
                await db.Database.ExecuteSqlRawAsync(
                    $"DO $$ DECLARE t record; BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = '{AppDbContext.SchemaPostgres}' " +
                    $"LOOP EXECUTE format('DROP TABLE IF EXISTS {AppDbContext.SchemaPostgres}.%I CASCADE', t.tablename); END LOOP; END $$;");
                await db.GetService<IRelationalDatabaseCreator>().CreateTablesAsync();
            }
        }
        else
        {
            await db.Database.EnsureCreatedAsync();
        }

        var versao = await LerVersaoAsync(db);
        if (versao != AppDbContext.VersaoEsquema && versao != 0)
        {
            if (conexao.Provedor == ProvedorBanco.Sqlite)
            {
                // Banco de desenvolvimento com esquema antigo: guarda uma cópia e recria com os dados de demonstração
                var arquivo = ArquivoSqlite(conexao.Texto);
                if (arquivo is not null && File.Exists(arquivo))
                {
                    var backup = Path.ChangeExtension(arquivo, $".v{Math.Max(versao, 1)}-{DateTime.Now:yyyyMMdd-HHmmss}.bak");
                    try
                    {
                        File.Copy(arquivo, backup, overwrite: true);
                        log.LogWarning("O banco SQLite estava em uma versão anterior do sistema. Cópia salva em {Backup}; recriando...", backup);
                    }
                    catch (IOException ex)
                    {
                        log.LogWarning(ex, "Não foi possível copiar o banco antigo; recriando mesmo assim.");
                    }
                }
                await db.Database.EnsureDeletedAsync();
                await db.Database.EnsureCreatedAsync();
                versao = 0;
            }
            else
            {
                throw new InvalidOperationException(
                    $"O banco está na versão {versao} do esquema e o sistema espera a versão {AppDbContext.VersaoEsquema}. " +
                    "Aplique o script de atualização (pasta banco/) ou as migrations antes de iniciar.");
            }
        }

        if (versao == 0)
        {
            db.Parametros.Add(new ParametroSistema { Chave = ParametroSistema.ChaveVersaoEsquema, Valor = AppDbContext.VersaoEsquema.ToString() });
            await db.SaveChangesAsync();
        }

        if (config.GetValue("Banco:DadosDemonstracao", true))
            await sp.GetRequiredService<DadosIniciais>().ExecutarAsync(incluirHistorico: true);
    }

    private static async Task<bool> TabelasExistemAsync(AppDbContext db)
    {
        try
        {
            await db.Parametros.AsNoTracking().AnyAsync();
            return true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            return false;
        }
    }

    /// <summary>
    /// Lê uma linha de cada tabela: se alguma coluna ou tipo não corresponder às entidades, o provedor lança
    /// exceção e devolvemos a descrição do problema (nulo = tudo certo).
    /// </summary>
    private static async Task<string?> ConferirEsquemaAsync(AppDbContext db)
    {
        async Task<string?> Ler<T>(IQueryable<T> tabela) where T : class
        {
            try
            {
                await tabela.AsNoTracking().OrderBy(e => 1).Take(1).ToListAsync();
                return null;
            }
            catch (Exception ex) when (EhErroDeEsquema(ex))
            {
                return $"{typeof(T).Name}: {ex.GetBaseException().Message}";
            }
        }

        return await Ler(db.Setores) ?? await Ler(db.Usuarios) ?? await Ler(db.RegistrosAcesso) ?? await Ler(db.Clientes)
            ?? await Ler(db.Fornecedores) ?? await Ler(db.CadastrosBancarios) ?? await Ler(db.Categorias) ?? await Ler(db.Produtos)
            ?? await Ler(db.Depositos) ?? await Ler(db.Saldos) ?? await Ler(db.Movimentacoes) ?? await Ler(db.ItensMovimentacao)
            ?? await Ler(db.Vendas) ?? await Ler(db.ItensVenda) ?? await Ler(db.PagamentosVenda) ?? await Ler(db.Pedidos)
            ?? await Ler(db.ItensPedido) ?? await Ler(db.Lancamentos) ?? await Ler(db.Documentos) ?? await Ler(db.OrdensSeparacao)
            ?? await Ler(db.ItensOrdemSeparacao) ?? await Ler(db.CaixasSessao) ?? await Ler(db.MovimentosCaixa);
    }

    /// <summary>
    /// Coluna/tabela inexistente, tipo diferente ou conversão inválida. Queda de rede e timeout NÃO entram aqui:
    /// nesses casos a exceção sobe e nada é recriado.
    /// </summary>
    private static bool EhErroDeEsquema(Exception ex)
    {
        var causa = ex.GetBaseException();
        if (causa is InvalidCastException or FormatException) return true;
        var sqlState = causa.GetType().GetProperty("SqlState")?.GetValue(causa) as string;
        return sqlState is "42703" or "42P01" or "42804" or "42883" or "3F000";
    }

    /// <summary>Versão gravada no banco; -1 se o banco é anterior ao controle de versão; 0 se acabou de ser criado.</summary>
    private static async Task<int> LerVersaoAsync(AppDbContext db)
    {
        try
        {
            var p = await db.Parametros.AsNoTracking().FirstOrDefaultAsync(x => x.Chave == ParametroSistema.ChaveVersaoEsquema);
            return p is null ? 0 : int.TryParse(p.Valor, out var v) ? v : -1;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            return -1; // tabela Parametros não existe: banco criado pela primeira versão do sistema
        }
    }

    private static string? ArquivoSqlite(string conexao)
    {
        var parte = conexao.Split(';').Select(p => p.Trim())
            .FirstOrDefault(p => p.StartsWith("Data Source", StringComparison.OrdinalIgnoreCase) || p.StartsWith("DataSource", StringComparison.OrdinalIgnoreCase));
        var caminho = parte?.Split('=', 2).ElementAtOrDefault(1)?.Trim();
        return string.IsNullOrEmpty(caminho) || caminho == ":memory:" ? null : Path.GetFullPath(caminho);
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
