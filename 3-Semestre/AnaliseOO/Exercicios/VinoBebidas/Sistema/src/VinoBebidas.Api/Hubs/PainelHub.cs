using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using VinoBebidas.Api.Auth;
using VinoBebidas.Contracts;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Hubs;

/// <summary>Canal em tempo real do painel. Clientes recebem o método "evento" com um <see cref="EventoPainelDto"/>.</summary>
[Authorize(Policy = Politicas.Gestao)]
public class PainelHub : Hub;

public class NotificadorSignalR(IHubContext<PainelHub> hub, ILogger<NotificadorSignalR> log) : INotificadorPainel
{
    public async Task PublicarAsync(EventoPainelDto evento, CancellationToken ct = default)
    {
        try
        {
            await hub.Clients.All.SendAsync(EventosPainel.Metodo, evento, ct);
        }
        catch (Exception ex)
        {
            // O painel ao vivo nunca deve derrubar uma venda
            log.LogWarning(ex, "Falha ao publicar evento do painel");
        }
    }
}
