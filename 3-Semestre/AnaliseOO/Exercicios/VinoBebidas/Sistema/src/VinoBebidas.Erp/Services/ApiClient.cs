using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using VinoBebidas.Contracts;

namespace VinoBebidas.Erp.Services;

public class ApiException(string mensagem, HttpStatusCode status) : Exception(mensagem)
{
    public HttpStatusCode Status { get; } = status;
}

/// <summary>Cliente HTTP do ERP. Todas as leituras e gravações passam pela API central (banco único).</summary>
public class ApiClient(IHttpClientFactory fabrica, Sessao sessao)
{
    public static readonly JsonSerializerOptions Json = CriarJson();

    private static JsonSerializerOptions CriarJson()
    {
        var o = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        o.Converters.Add(new JsonStringEnumConverter());
        return o;
    }

    private HttpClient Cliente()
    {
        var http = fabrica.CreateClient("api");
        if (sessao.Token is not null)
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", sessao.Token);
        http.DefaultRequestHeaders.Add("X-Origem", "erp");
        return http;
    }

    public async Task<T> GetAsync<T>(string url, CancellationToken ct = default)
    {
        using var resp = await Enviar(c => c.GetAsync(url, ct));
        return (await resp.Content.ReadFromJsonAsync<T>(Json, ct))!;
    }

    public async Task<byte[]> GetBytesAsync(string url, CancellationToken ct = default)
    {
        using var resp = await Enviar(c => c.GetAsync(url, ct));
        return await resp.Content.ReadAsByteArrayAsync(ct);
    }

    public async Task<T?> GetOuNuloAsync<T>(string url, CancellationToken ct = default) where T : class
    {
        using var resp = await Cliente().GetAsync(url, ct);
        if (resp.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.NoContent) return null;
        await GarantirSucesso(resp);
        return await resp.Content.ReadFromJsonAsync<T>(Json, ct);
    }

    public async Task<T> PostAsync<T>(string url, object? corpo, CancellationToken ct = default)
    {
        using var resp = await Enviar(c => c.PostAsJsonAsync(url, corpo, Json, ct));
        return (await resp.Content.ReadFromJsonAsync<T>(Json, ct))!;
    }

    public async Task<T> PutAsync<T>(string url, object corpo, CancellationToken ct = default)
    {
        using var resp = await Enviar(c => c.PutAsJsonAsync(url, corpo, Json, ct));
        return (await resp.Content.ReadFromJsonAsync<T>(Json, ct))!;
    }

    public async Task PutSemRespostaAsync(string url, object corpo, CancellationToken ct = default)
    {
        using var resp = await Enviar(c => c.PutAsJsonAsync(url, corpo, Json, ct));
    }

    public async Task<T> PostMultipartAsync<T>(string url, MultipartFormDataContent conteudo, CancellationToken ct = default)
    {
        using var resp = await Enviar(c => c.PostAsync(url, conteudo, ct));
        return (await resp.Content.ReadFromJsonAsync<T>(Json, ct))!;
    }

    private async Task<HttpResponseMessage> Enviar(Func<HttpClient, Task<HttpResponseMessage>> acao)
    {
        HttpResponseMessage resp;
        try
        {
            resp = await acao(Cliente());
        }
        catch (HttpRequestException)
        {
            throw new ApiException("Não foi possível conectar à API. Verifique se o VinoBebidas.Api está rodando.", HttpStatusCode.ServiceUnavailable);
        }
        await GarantirSucesso(resp);
        return resp;
    }

    private async Task GarantirSucesso(HttpResponseMessage resp)
    {
        if (resp.IsSuccessStatusCode) return;
        string mensagem;
        try
        {
            var erro = await resp.Content.ReadFromJsonAsync<ErroDto>(Json);
            mensagem = erro?.Mensagem ?? resp.ReasonPhrase ?? "Erro";
        }
        catch
        {
            mensagem = resp.StatusCode switch
            {
                HttpStatusCode.Unauthorized => "Sessão expirada. Faça login novamente.",
                HttpStatusCode.Forbidden => "Seu perfil não tem permissão para esta operação.",
                HttpStatusCode.NotFound => "Registro não encontrado.",
                _ => $"Erro {(int)resp.StatusCode} ao comunicar com a API."
            };
        }
        if (resp.StatusCode == HttpStatusCode.Unauthorized) await sessao.SairAsync();
        resp.Dispose();
        throw new ApiException(mensagem, resp.StatusCode);
    }
}
