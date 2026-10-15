using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

public record FiltroCatalogo(
    string? Busca = null,
    int? CategoriaId = null,
    string? Pais = null,
    string? Uva = null,
    decimal? PrecoMin = null,
    decimal? PrecoMax = null,
    bool SomenteDisponiveis = false,
    bool SomenteDestaques = false,
    string? Ordem = null,
    int Pagina = 1,
    int TamanhoPagina = 24);

/// <summary>Catálogo público (loja online + app): somente vinhos especiais ativos, sem custo.</summary>
public class CatalogoService(AppDbContext db)
{
    private IQueryable<Produto> Publicos() =>
        db.Produtos.AsNoTracking().Where(p => p.Ativo && p.VisivelLoja && p.Categoria!.EhVinho);

    public async Task<PaginaDto<CatalogoItemDto>> ListarAsync(FiltroCatalogo f, CancellationToken ct = default)
    {
        var q = Publicos();
        if (!string.IsNullOrWhiteSpace(f.Busca))
        {
            var padrao = Busca.Padrao(f.Busca);
            q = q.Where(p => EF.Functions.Like(p.Nome.ToLower(), padrao) || EF.Functions.Like(p.Produtor!.ToLower(), padrao) ||
                             EF.Functions.Like(p.Uva!.ToLower(), padrao) || EF.Functions.Like(p.Regiao!.ToLower(), padrao));
        }
        if (f.CategoriaId is not null) q = q.Where(p => p.CategoriaId == f.CategoriaId);
        if (!string.IsNullOrWhiteSpace(f.Pais)) q = q.Where(p => p.Pais == f.Pais);
        if (!string.IsNullOrWhiteSpace(f.Uva)) q = q.Where(p => EF.Functions.Like(p.Uva!.ToLower(), Busca.Padrao(f.Uva)));
        if (f.PrecoMin is not null) q = q.Where(p => (p.PrecoPromocional ?? p.PrecoVenda) >= f.PrecoMin);
        if (f.PrecoMax is not null) q = q.Where(p => (p.PrecoPromocional ?? p.PrecoVenda) <= f.PrecoMax);
        if (f.SomenteDestaques) q = q.Where(p => p.Destaque);
        if (f.SomenteDisponiveis)
            q = q.Where(p => p.Saldos.Where(s => s.Deposito!.AtendeOnline || s.Deposito.PermiteRetirada).Sum(s => s.Quantidade - s.Reservado) > 0);

        q = f.Ordem switch
        {
            "preco" => q.OrderBy(p => p.PrecoPromocional ?? p.PrecoVenda),
            "preco_desc" => q.OrderByDescending(p => p.PrecoPromocional ?? p.PrecoVenda),
            "pontuacao" => q.OrderByDescending(p => p.Pontuacao).ThenBy(p => p.Nome),
            "safra" => q.OrderByDescending(p => p.Safra).ThenBy(p => p.Nome),
            "nome" => q.OrderBy(p => p.Nome),
            _ => q.OrderByDescending(p => p.Destaque).ThenByDescending(p => p.Pontuacao).ThenBy(p => p.Nome)
        };

        var pagina = Math.Max(1, f.Pagina);
        var tamanho = Math.Clamp(f.TamanhoPagina, 1, 100);
        var total = await q.CountAsync(ct);
        var itens = await Projetar(q.Skip((pagina - 1) * tamanho).Take(tamanho)).ToListAsync(ct);
        return new PaginaDto<CatalogoItemDto>(itens.Select(Finalizar).ToList(), total, pagina, tamanho);
    }

    public async Task<CatalogoItemDto?> ObterAsync(int id, CancellationToken ct = default)
    {
        var item = await Projetar(Publicos().Where(p => p.Id == id)).FirstOrDefaultAsync(ct);
        return item is null ? null : Finalizar(item);
    }

    public async Task<CatalogoFacetasDto> FacetasAsync(CancellationToken ct = default)
    {
        var categorias = await db.Categorias.AsNoTracking().Where(c => c.EhVinho).OrderBy(c => c.Nome).ToListAsync(ct);
        var dados = await Publicos().Select(p => new { p.Pais, p.Uva, Preco = p.PrecoPromocional ?? p.PrecoVenda }).ToListAsync(ct);
        var uvas = dados.Where(d => !string.IsNullOrWhiteSpace(d.Uva))
            .SelectMany(d => d.Uva!.Split([',', '/'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Distinct(StringComparer.OrdinalIgnoreCase).Order().ToList();
        return new CatalogoFacetasDto(
            categorias.Select(c => c.ToDto()).ToList(),
            dados.Select(d => d.Pais).Where(p => !string.IsNullOrWhiteSpace(p)).Distinct().Order().ToList()!,
            uvas,
            dados.Count == 0 ? 0 : dados.Min(d => d.Preco),
            dados.Count == 0 ? 0 : dados.Max(d => d.Preco));
    }

    private sealed record Linha(Produto P, string Categoria, string Cor, int Disponivel);

    private static IQueryable<Linha> Projetar(IQueryable<Produto> q) =>
        q.Select(p => new Linha(p, p.Categoria!.Nome, p.Categoria.Cor,
            p.Saldos.Where(s => s.Deposito!.AtendeOnline || s.Deposito.PermiteRetirada).Sum(s => s.Quantidade - s.Reservado)));

    private static CatalogoItemDto Finalizar(Linha l)
    {
        var p = l.P;
        return new CatalogoItemDto(p.Id, p.Sku, p.Nome, p.Descricao, p.CategoriaId, l.Categoria, l.Cor, p.Produtor, p.Pais, p.Regiao,
            p.Uva, p.Safra, p.TeorAlcoolico, p.VolumeMl, p.Harmonizacao, p.TemperaturaServico, p.Pontuacao, p.PrecoVenda,
            p.PrecoPromocional, p.PrecoAtual, p.ImagemUrl, p.Destaque, Math.Max(0, l.Disponivel));
    }
}

/// <summary>Cadastro de produtos no ERP.</summary>
public class ProdutoService(AppDbContext db)
{
    public async Task<PaginaDto<ProdutoDto>> ListarAsync(string? busca, int? categoriaId, bool? ativo, bool? visivelLoja,
        int pagina, int tamanho, CancellationToken ct = default)
    {
        var q = db.Produtos.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var padrao = Busca.Padrao(termo);
            q = q.Where(p => EF.Functions.Like(p.Nome.ToLower(), padrao) || EF.Functions.Like(p.Sku.ToLower(), padrao) || p.CodigoBarras == termo);
        }
        if (categoriaId is not null) q = q.Where(p => p.CategoriaId == categoriaId);
        if (ativo is not null) q = q.Where(p => p.Ativo == ativo);
        if (visivelLoja is not null) q = q.Where(p => p.VisivelLoja == visivelLoja);

        pagina = Math.Max(1, pagina);
        tamanho = Math.Clamp(tamanho, 1, 500);
        var total = await q.CountAsync(ct);
        var itens = await q.OrderBy(p => p.Nome).Skip((pagina - 1) * tamanho).Take(tamanho)
            .Include(p => p.Categoria).Include(p => p.Saldos)
            .AsSplitQuery()
            .ToListAsync(ct);
        return new PaginaDto<ProdutoDto>(itens.Select(p => p.ToDto()).ToList(), total, pagina, tamanho);
    }

    /// <summary>Busca exata para o leitor de código de barras do PDV (código de barras ou SKU).</summary>
    public async Task<ProdutoDto?> BuscarPorCodigoAsync(string codigo, CancellationToken ct = default)
    {
        var c = codigo.Trim();
        var p = await db.Produtos.AsNoTracking().Include(x => x.Categoria).Include(x => x.Saldos)
            .FirstOrDefaultAsync(x => x.Ativo && (x.CodigoBarras == c || x.Sku == c.ToUpper()), ct);
        return p?.ToDto();
    }

    public async Task<ProdutoDto?> ObterAsync(int id, CancellationToken ct = default)
    {
        var p = await db.Produtos.AsNoTracking().Include(x => x.Categoria).Include(x => x.Saldos)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return p?.ToDto();
    }

    public async Task<ProdutoDto> SalvarAsync(int? id, ProdutoSalvarRequest req, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Sku) || string.IsNullOrWhiteSpace(req.Nome))
            throw new RegraNegocioException("SKU e nome são obrigatórios.");
        if (req.PrecoVenda <= 0 || req.PrecoCusto < 0) throw new RegraNegocioException("Preços inválidos.");
        if (req.PrecoPromocional is not null && (req.PrecoPromocional <= 0 || req.PrecoPromocional >= req.PrecoVenda))
            throw new RegraNegocioException("O preço promocional deve ser menor que o preço de venda.");
        if (!await db.Categorias.AnyAsync(c => c.Id == req.CategoriaId, ct)) throw new RegraNegocioException("Categoria inválida.");

        var sku = req.Sku.Trim().ToUpperInvariant();
        if (await db.Produtos.AnyAsync(p => p.Sku == sku && p.Id != (id ?? 0), ct))
            throw new RegraNegocioException($"Já existe um produto com o SKU {sku}.");
        if (!string.IsNullOrWhiteSpace(req.CodigoBarras) &&
            await db.Produtos.AnyAsync(p => p.CodigoBarras == req.CodigoBarras.Trim() && p.Id != (id ?? 0), ct))
            throw new RegraNegocioException("Código de barras já cadastrado em outro produto.");

        Produto produto;
        if (id is null)
        {
            produto = new Produto();
            db.Produtos.Add(produto);
        }
        else
        {
            produto = await db.Produtos.FirstOrDefaultAsync(p => p.Id == id, ct) ?? throw new NaoEncontradoException("Produto não encontrado.");
        }
        produto.Aplicar(req);
        await db.SaveChangesAsync(ct);
        return (await ObterAsync(produto.Id, ct))!;
    }
}
