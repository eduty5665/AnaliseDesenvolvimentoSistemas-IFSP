using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>Contas a pagar/receber, alertas de vencimento (RF06) e resumo (RF09).</summary>
public class FinanceiroService(AppDbContext db, Calendario calendario, INotificadorPainel notificador)
{
    public async Task<PaginaDto<LancamentoDto>> ListarAsync(TipoLancamento? tipo, StatusLancamento? status, CategoriaLancamento? categoria,
        int? setorId, DateOnly? vencimentoDe, DateOnly? vencimentoAte, bool somenteAtrasados, bool incluirVendas,
        int pagina, int tamanho, CancellationToken ct = default)
    {
        var hoje = calendario.Hoje;
        var q = db.Lancamentos.AsNoTracking().AsQueryable();
        if (tipo is not null) q = q.Where(l => l.Tipo == tipo);
        if (status is not null) q = q.Where(l => l.Status == status);
        if (categoria is not null) q = q.Where(l => l.Categoria == categoria);
        if (setorId is not null) q = q.Where(l => l.SetorId == setorId);
        if (vencimentoDe is not null) q = q.Where(l => l.Vencimento >= vencimentoDe);
        if (vencimentoAte is not null) q = q.Where(l => l.Vencimento <= vencimentoAte);
        if (somenteAtrasados) q = q.Where(l => l.Status == StatusLancamento.Aberto && l.Vencimento < hoje);
        // Receitas de venda são muitas (uma por venda); por padrão ficam fora da listagem de contas.
        if (!incluirVendas && categoria != CategoriaLancamento.Venda) q = q.Where(l => l.Categoria != CategoriaLancamento.Venda);

        pagina = Math.Max(1, pagina);
        tamanho = Math.Clamp(tamanho, 1, 500);
        var total = await q.CountAsync(ct);
        var itens = await q.OrderBy(l => l.Status).ThenBy(l => l.Vencimento).ThenBy(l => l.Id)
            .Skip((pagina - 1) * tamanho).Take(tamanho)
            .Include(l => l.Setor).Include(l => l.Fornecedor)
            .ToListAsync(ct);
        return new PaginaDto<LancamentoDto>(itens.Select(l => l.ToDto(hoje)).ToList(), total, pagina, tamanho);
    }

    public async Task<LancamentoDto> SalvarAsync(int? id, LancamentoSalvarRequest r, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(r.Descricao)) throw new RegraNegocioException("Informe a descrição.");
        if (r.Valor <= 0) throw new RegraNegocioException("O valor deve ser maior que zero.");

        LancamentoFinanceiro l;
        if (id is null)
        {
            l = new LancamentoFinanceiro();
            db.Lancamentos.Add(l);
        }
        else
        {
            l = await db.Lancamentos.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NaoEncontradoException("Lançamento não encontrado.");
            if (l.Status != StatusLancamento.Aberto) throw new RegraNegocioException("Somente lançamentos em aberto podem ser editados.");
        }

        l.Tipo = r.Tipo;
        l.Categoria = r.Categoria;
        l.Descricao = r.Descricao.Trim();
        l.Valor = r.Valor;
        l.Vencimento = r.Vencimento;
        l.Competencia = r.Competencia ?? new DateOnly(r.Vencimento.Year, r.Vencimento.Month, 1);
        l.SetorId = r.SetorId;
        l.FornecedorId = r.FornecedorId;
        l.ConsumoQuantidade = r.ConsumoQuantidade;
        l.ConsumoUnidade = r.ConsumoUnidade;
        l.Observacao = r.Observacao;
        await db.SaveChangesAsync(ct);
        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.Financeiro, $"Lançamento: {l.Descricao}", l.Valor, calendario.AgoraUtc), ct);
        return await ObterAsync(l.Id, ct);
    }

    public async Task<LancamentoDto> PagarAsync(int id, DateOnly? data, CancellationToken ct = default)
    {
        var l = await db.Lancamentos.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NaoEncontradoException("Lançamento não encontrado.");
        l.Pagar(data ?? calendario.Hoje);
        await db.SaveChangesAsync(ct);
        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.Financeiro, $"Baixa: {l.Descricao}", l.Valor, calendario.AgoraUtc), ct);
        return await ObterAsync(id, ct);
    }

    public async Task<LancamentoDto> CancelarAsync(int id, CancellationToken ct = default)
    {
        var l = await db.Lancamentos.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NaoEncontradoException("Lançamento não encontrado.");
        l.Cancelar();
        await db.SaveChangesAsync(ct);
        return await ObterAsync(id, ct);
    }

    private async Task<LancamentoDto> ObterAsync(int id, CancellationToken ct)
    {
        var l = await db.Lancamentos.AsNoTracking().Include(x => x.Setor).Include(x => x.Fornecedor).FirstAsync(x => x.Id == id, ct);
        return l.ToDto(calendario.Hoje);
    }

    /// <summary>Contas em aberto atrasadas ou que vencem nos próximos <paramref name="dias"/> dias.</summary>
    public async Task<IReadOnlyList<AlertaFinanceiroDto>> AlertasAsync(int dias = 7, CancellationToken ct = default)
    {
        var hoje = calendario.Hoje;
        var limite = hoje.AddDays(dias);
        var abertos = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Status == StatusLancamento.Aberto && l.Vencimento <= limite)
            .OrderBy(l => l.Vencimento)
            .ToListAsync(ct);
        return abertos.Select(l => new AlertaFinanceiroDto(l.Id, l.Descricao, l.Tipo, l.Valor, l.Vencimento,
            l.Vencimento.DayNumber - hoje.DayNumber, l.Vencimento < hoje)).ToList();
    }

    public async Task<ResumoFinanceiroDto> ResumoAsync(int? ano, int? mes, CancellationToken ct = default)
    {
        var hoje = calendario.Hoje;
        var competencia = new DateOnly(ano ?? hoje.Year, mes ?? hoje.Month, 1);
        var fimMes = competencia.AddMonths(1);

        var doMes = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Status != StatusLancamento.Cancelado && l.Vencimento >= competencia && l.Vencimento < fimMes)
            .Select(l => new { l.Tipo, l.Categoria, l.Valor, Setor = l.Setor!.Nome })
            .ToListAsync(ct);

        var abertos = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Status == StatusLancamento.Aberto)
            .Select(l => new { l.Tipo, l.Valor, l.Vencimento })
            .ToListAsync(ct);

        var receitas = doMes.Where(l => l.Tipo == TipoLancamento.Receita).Sum(l => l.Valor);
        var despesas = doMes.Where(l => l.Tipo == TipoLancamento.Despesa).Sum(l => l.Valor);

        return new ResumoFinanceiroDto(
            receitas, despesas, receitas - despesas,
            abertos.Where(a => a.Tipo == TipoLancamento.Receita).Sum(a => a.Valor),
            abertos.Where(a => a.Tipo == TipoLancamento.Despesa).Sum(a => a.Valor),
            abertos.Where(a => a.Tipo == TipoLancamento.Despesa && a.Vencimento < hoje).Sum(a => a.Valor),
            doMes.Where(l => l.Tipo == TipoLancamento.Despesa).GroupBy(l => l.Categoria)
                .Select(g => new ValorCategoriaDto(DescreverCategoria(g.Key), g.Sum(x => x.Valor))).OrderByDescending(x => x.Valor).ToList(),
            doMes.Where(l => l.Tipo == TipoLancamento.Despesa).GroupBy(l => l.Setor ?? "Sem setor")
                .Select(g => new ValorCategoriaDto(g.Key, g.Sum(x => x.Valor))).OrderByDescending(x => x.Valor).ToList());
    }

    public static string DescreverCategoria(CategoriaLancamento c) => c switch
    {
        CategoriaLancamento.Venda => "Vendas",
        CategoriaLancamento.CompraMercadoria => "Compra de mercadoria",
        CategoriaLancamento.EnergiaEletrica => "Energia elétrica",
        CategoriaLancamento.Agua => "Água",
        CategoriaLancamento.IPTU => "IPTU",
        CategoriaLancamento.Manutencao => "Manutenção",
        CategoriaLancamento.FolhaPagamento => "Folha de pagamento",
        CategoriaLancamento.Impostos => "Impostos",
        CategoriaLancamento.Aluguel => "Aluguel",
        CategoriaLancamento.Frete => "Frete",
        CategoriaLancamento.Marketing => "Marketing",
        _ => "Outros"
    };
}
