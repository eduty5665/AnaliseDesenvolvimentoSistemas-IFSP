using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>Reconhecimento óptico de caracteres (RF03). Troque a implementação para usar Tesseract, Azure AI Vision etc.</summary>
public interface IOcrService
{
    Task<string?> ExtrairTextoAsync(string caminhoArquivo, string? contentType, CancellationToken ct = default);
}

/// <summary>
/// Implementação inicial: lê arquivos de texto e o texto embutido de PDFs simples.
/// Para imagens/PDF escaneado é preciso plugar um motor de OCR real.
/// </summary>
public class OcrBasicoService : IOcrService
{
    public async Task<string?> ExtrairTextoAsync(string caminhoArquivo, string? contentType, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(caminhoArquivo).ToLowerInvariant();
        if (ext is ".txt" or ".csv")
            return await File.ReadAllTextAsync(caminhoArquivo, ct);

        if (ext == ".pdf")
        {
            // Extração ingênua de strings "(texto) Tj" de PDFs não comprimidos.
            var bytes = await File.ReadAllBytesAsync(caminhoArquivo, ct);
            var bruto = Encoding.Latin1.GetString(bytes);
            var sb = new StringBuilder();
            var i = 0;
            while ((i = bruto.IndexOf('(', i)) >= 0)
            {
                var fim = bruto.IndexOf(')', i + 1);
                if (fim < 0) break;
                if (bruto.AsSpan(fim + 1).TrimStart().StartsWith("Tj"))
                    sb.Append(bruto, i + 1, fim - i - 1).Append(' ');
                i = fim + 1;
            }
            var texto = sb.ToString().Trim();
            return texto.Length > 0 ? texto : null;
        }

        return null;
    }
}

/// <summary>
/// Fluxo dos casos de uso DigitalizarDoc → RecebeDoc → FiltrarDados → GerarAnalise, seguindo o Diagrama de Estado:
/// Bloqueado → (verificação de padrão) → Disponível → (análise gerada) → Analisado.
/// </summary>
public class DocumentoService(AppDbContext db, IOcrService ocr, IConfiguration config, Calendario calendario)
{
    private static readonly string[] Extensoes = [".pdf", ".png", ".jpg", ".jpeg", ".txt"];

    private string PastaArquivos()
    {
        var pasta = config["Armazenamento:Documentos"] ?? Path.Combine(AppContext.BaseDirectory, "App_Data", "documentos");
        Directory.CreateDirectory(pasta);
        return pasta;
    }

    public async Task<DocumentoDto> ReceberAsync(Stream conteudo, string nomeArquivo, string? contentType, TipoDocumento tipo,
        int? setorId, string? descricao, int? usuarioId, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(nomeArquivo).ToLowerInvariant();
        if (!Extensoes.Contains(ext)) throw new RegraNegocioException("Envie PDF, imagem (PNG/JPG) ou TXT.");

        var nomeSeguro = $"{Guid.NewGuid():N}{ext}";
        var caminho = Path.Combine(PastaArquivos(), nomeSeguro);
        await using (var arquivo = File.Create(caminho))
            await conteudo.CopyToAsync(arquivo, ct);

        var doc = new Documento
        {
            Nome = Path.GetFileName(nomeArquivo),
            CaminhoArquivo = nomeSeguro,
            ContentType = contentType,
            Tipo = tipo,
            SetorId = setorId,
            Descricao = descricao,
            ResponsavelId = usuarioId,
            DataDigitalizacao = calendario.AgoraUtc,
            Status = StatusDocumento.Bloqueado,
            ConteudoExtraido = await ocr.ExtrairTextoAsync(caminho, contentType, ct)
        };
        doc.Pendencias = doc.ConteudoExtraido is null
            ? "Texto não extraído automaticamente; confira os dados manualmente."
            : "Aguardando verificação de padrão.";

        db.Documentos.Add(doc);
        await db.SaveChangesAsync(ct);
        return await ObterAsync(doc.Id, ct) ?? throw new InvalidOperationException();
    }

    /// <summary>Verificação de padrão: se os dados obrigatórios estão completos o documento fica Disponível.</summary>
    public async Task<DocumentoDto> VerificarAsync(int id, VerificarDocumentoRequest r, CancellationToken ct = default)
    {
        var doc = await db.Documentos.FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new NaoEncontradoException("Documento não encontrado.");
        doc.Tipo = r.Tipo;
        doc.SetorId = r.SetorId;
        if (!string.IsNullOrWhiteSpace(r.Descricao)) doc.Descricao = r.Descricao.Trim();

        var pendencias = new List<string>();
        if (r.SetorId is null) pendencias.Add("setor de origem");
        if (r.Valor is null or <= 0) pendencias.Add("valor");
        if (r.Tipo == TipoDocumento.Despesa && r.Vencimento is null) pendencias.Add("vencimento");
        if (string.IsNullOrWhiteSpace(doc.Descricao)) pendencias.Add("descrição");
        doc.VerificarPadrao(pendencias.Select(p => $"Falta {p}").ToList());

        if (doc.Status == StatusDocumento.Disponivel)
        {
            // Gera a análise: o documento vira um lançamento financeiro filtrado pelo tipo
            var hoje = calendario.Hoje;
            var vencimento = r.Vencimento ?? hoje;
            var lanc = new LancamentoFinanceiro
            {
                Tipo = r.Tipo == TipoDocumento.Venda ? TipoLancamento.Receita : TipoLancamento.Despesa,
                Categoria = r.Categoria ?? (r.Tipo switch
                {
                    TipoDocumento.Compra => CategoriaLancamento.CompraMercadoria,
                    TipoDocumento.Venda => CategoriaLancamento.Venda,
                    _ => CategoriaLancamento.Outros
                }),
                Descricao = doc.Descricao!,
                Valor = r.Valor!.Value,
                Vencimento = vencimento,
                Competencia = new DateOnly(vencimento.Year, vencimento.Month, 1),
                SetorId = r.SetorId,
                Observacao = $"Gerado do documento #{doc.Id} ({doc.Nome})"
            };
            db.Lancamentos.Add(lanc);
            await db.SaveChangesAsync(ct);
            lanc.DocumentoId = doc.Id;
            doc.RegistrarAnalise(lanc.Id);
        }

        await db.SaveChangesAsync(ct);
        return (await ObterAsync(id, ct))!;
    }

    public async Task<DocumentoDto?> ObterAsync(int id, CancellationToken ct = default)
    {
        var d = await db.Documentos.AsNoTracking().Include(x => x.Setor).Include(x => x.Responsavel).FirstOrDefaultAsync(x => x.Id == id, ct);
        return d?.ToDto();
    }

    public async Task<IReadOnlyList<DocumentoDto>> ListarAsync(StatusDocumento? status, CancellationToken ct = default)
    {
        var q = db.Documentos.AsNoTracking().Include(x => x.Setor).Include(x => x.Responsavel).AsQueryable();
        if (status is not null) q = q.Where(d => d.Status == status);
        var lista = await q.OrderByDescending(d => d.DataDigitalizacao).Take(300).ToListAsync(ct);
        return lista.Select(d => d.ToDto()).ToList();
    }

    public async Task<(Stream Conteudo, string ContentType, string Nome)?> AbrirArquivoAsync(int id, CancellationToken ct = default)
    {
        var d = await db.Documentos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return null;
        var caminho = Path.Combine(PastaArquivos(), d.CaminhoArquivo);
        if (!File.Exists(caminho)) return null;
        return (File.OpenRead(caminho), d.ContentType ?? "application/octet-stream", d.Nome);
    }
}
