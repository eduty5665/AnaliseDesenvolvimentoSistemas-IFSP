using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;

namespace VinoBebidas.Api;

/// <summary>Converte exceções de negócio em respostas HTTP com { "mensagem": "..." }.</summary>
public class TratamentoErros(RequestDelegate next, ILogger<TratamentoErros> log)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (RegraNegocioException ex)
        {
            await Responder(ctx, StatusCodes.Status400BadRequest, ex.Message);
        }
        catch (NaoEncontradoException ex)
        {
            await Responder(ctx, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (DbUpdateConcurrencyException)
        {
            await Responder(ctx, StatusCodes.Status409Conflict, "O estoque foi alterado por outra operação ao mesmo tempo. Tente novamente.");
        }
        catch (DbUpdateException ex)
        {
            log.LogError(ex, "Erro ao gravar no banco");
            await Responder(ctx, StatusCodes.Status409Conflict, "Não foi possível gravar: verifique se o registro não está duplicado ou em uso.");
        }
        catch (BadHttpRequestException ex)
        {
            await Responder(ctx, StatusCodes.Status400BadRequest, $"Requisição inválida: {ex.Message}");
        }
        catch (OperationCanceledException) when (ctx.RequestAborted.IsCancellationRequested)
        {
            // cliente desconectou
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Erro não tratado em {Caminho}", ctx.Request.Path);
            await Responder(ctx, StatusCodes.Status500InternalServerError, "Erro interno. Consulte o log do servidor.");
        }
    }

    private static async Task Responder(HttpContext ctx, int status, string mensagem)
    {
        if (ctx.Response.HasStarted) return;
        ctx.Response.Clear();
        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ErroDto(mensagem));
    }
}
