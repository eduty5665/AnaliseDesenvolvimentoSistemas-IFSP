using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication.BearerToken;
using VinoBebidas.Api;
using VinoBebidas.Api.Auth;
using VinoBebidas.Api.Endpoints;
using VinoBebidas.Api.Hubs;
using VinoBebidas.Infrastructure;
using VinoBebidas.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// ── Banco único + serviços de negócio ──
builder.Services.AddInfraestrutura(config);
builder.Services.AddSingleton<INotificadorPainel, NotificadorSignalR>();
builder.Services.AddHostedService<DependencyInjection.ExpiracaoReservasWorker>();

// ── JSON: enums como texto ("Tinto", "Concluida"...) para web, ERP e app ──
builder.Services.ConfigureHttpJsonOptions(o =>
{
    o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
});

// ── Autenticação por token (esquema BearerToken nativo do ASP.NET Core) ──
builder.Services.AddAuthentication(BearerTokenDefaults.AuthenticationScheme)
    .AddBearerToken(o =>
    {
        o.BearerTokenExpiration = TimeSpan.FromHours(12);
        o.Events = new BearerTokenEvents
        {
            // SignalR (WebSocket) envia o token pela query string
            OnMessageReceived = ctx =>
            {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) && ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                    ctx.Token = token;
                return Task.CompletedTask;
            }
        };
    });
Politicas.Configurar(builder.Services.AddAuthorizationBuilder());
builder.Services.AddSingleton<TokenService>();

// Chaves de proteção dos tokens persistidas em disco para sobreviver a reinícios
builder.Services.AddDataProtection()
    .SetApplicationName("VinoBebidas")
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "App_Data", "chaves")));

// ── CORS para a loja em desenvolvimento (Vite) ──
var origens = config.GetSection("Cors:Origens").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .SetIsOriginAllowed(origem => origens.Contains(origem) ||
        (builder.Environment.IsDevelopment() && Uri.TryCreate(origem, UriKind.Absolute, out var uri) && uri.IsLoopback))
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

builder.Services.AddSignalR().AddJsonProtocol(o => o.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();

var app = builder.Build();

await app.Services.InicializarBancoAsync(config);

app.UseMiddleware<TratamentoErros>();
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapOpenApi();
app.MapGet("/docs", () => Results.Content(PaginaDocs.Html, "text/html")).ExcludeFromDescription();
app.MapGet("/api/saude", () => Results.Ok(new { status = "ok", horario = DateTime.UtcNow })).WithTags("Sistema");

app.MapAuth();
app.MapCatalogo();
app.MapErp();
app.MapPedidos();
app.MapCadastros();
app.MapFinanceiro();
app.MapHub<PainelHub>("/hubs/painel");

// A loja web (React) compilada fica em wwwroot: rotas desconhecidas devolvem o index.html (SPA)
app.MapFallback(async ctx =>
{
    var caminho = ctx.Request.Path;
    var index = Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "index.html");
    if (caminho.StartsWithSegments("/api") || caminho.StartsWithSegments("/hubs") || !File.Exists(index))
    {
        ctx.Response.StatusCode = StatusCodes.Status404NotFound;
        if (!File.Exists(index) && !caminho.StartsWithSegments("/api"))
            await ctx.Response.WriteAsync("API Vino Bebidas no ar. Documentação em /docs. A loja web roda em http://localhost:5173 (npm run dev) ou é publicada em wwwroot (npm run build).");
        return;
    }
    ctx.Response.ContentType = "text/html; charset=utf-8";
    await ctx.Response.SendFileAsync(index);
});

app.Run();

/// <summary>Página de documentação interativa (Scalar via CDN) para a especificação OpenAPI.</summary>
internal static class PaginaDocs
{
    public const string Html = """
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>API Vino Bebidas</title>
        </head>
        <body>
          <script id="api-reference" data-url="/openapi/v1.json"></script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
        </html>
        """;
}

public partial class Program;
