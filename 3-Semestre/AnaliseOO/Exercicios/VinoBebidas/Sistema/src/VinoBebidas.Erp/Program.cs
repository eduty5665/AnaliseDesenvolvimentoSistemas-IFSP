using System.Globalization;
using VinoBebidas.Erp.Components;
using VinoBebidas.Erp.Services;

var builder = WebApplication.CreateBuilder(args);

var ptBr = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentCulture = ptBr;
CultureInfo.DefaultThreadCurrentUICulture = ptBr;

builder.Services.AddRazorComponents().AddInteractiveServerComponents();

// Único backend: a API central (mesmo banco da loja online e do app)
builder.Services.AddHttpClient("api", c =>
{
    c.BaseAddress = new Uri(builder.Configuration["Api:Url"] ?? "http://localhost:5080");
    c.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddScoped<Sessao>();
builder.Services.AddScoped<ApiClient>();
builder.Services.AddScoped<Avisos>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler("/Error", createScopeForErrors: true);

app.UseRequestLocalization("pt-BR");
app.UseAntiforgery();
app.MapStaticAssets();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();

app.Run();
