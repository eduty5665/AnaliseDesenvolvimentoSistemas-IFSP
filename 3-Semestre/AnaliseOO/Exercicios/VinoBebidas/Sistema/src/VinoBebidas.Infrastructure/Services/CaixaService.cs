using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>
/// Sessões de caixa do PDV: abertura com fundo de troco, sangria/suprimento e fechamento com conferência.
/// Dinheiro esperado na gaveta = abertura + recebido em dinheiro − troco + suprimentos − sangrias.
/// </summary>
public class CaixaService(AppDbContext db, Calendario calendario)
{
    /// <summary>Sessão aberta do operador (entidade rastreada) ou null.</summary>
    public Task<CaixaSessao?> SessaoAbertaAsync(int operadorId, CancellationToken ct = default) =>
        db.CaixasSessao.Include(c => c.Movimentos).FirstOrDefaultAsync(c => c.OperadorId == operadorId && c.Status == StatusCaixa.Aberto, ct);

    public async Task<CaixaDto?> AtualAsync(int operadorId, CancellationToken ct = default)
    {
        var sessao = await SessaoAbertaAsync(operadorId, ct);
        return sessao is null ? null : await MontarAsync(sessao.Id, ct);
    }

    public async Task<CaixaDto> AbrirAsync(int operadorId, AbrirCaixaRequest req, CancellationToken ct = default)
    {
        if (req.ValorAbertura < 0) throw new RegraNegocioException("O fundo de troco não pode ser negativo.");
        if (await db.CaixasSessao.AnyAsync(c => c.OperadorId == operadorId && c.Status == StatusCaixa.Aberto, ct))
            throw new RegraNegocioException("Você já tem um caixa aberto. Feche-o antes de abrir outro.");
        var deposito = await db.Depositos.FirstOrDefaultAsync(d => d.Id == req.DepositoId && d.Ativo, ct)
                       ?? throw new RegraNegocioException("Loja inválida.");
        if (deposito.Tipo != TipoDeposito.Loja) throw new RegraNegocioException("O caixa só pode ser aberto em uma loja.");

        var sessao = new CaixaSessao
        {
            DepositoId = deposito.Id,
            OperadorId = operadorId,
            ValorAbertura = req.ValorAbertura,
            AbertoEm = calendario.AgoraUtc,
            CriadoEm = calendario.AgoraUtc
        };
        db.CaixasSessao.Add(sessao);
        await db.SaveChangesAsync(ct);
        return await MontarAsync(sessao.Id, ct);
    }

    public async Task<CaixaDto> MovimentarAsync(int operadorId, MovimentoCaixaRequest req, CancellationToken ct = default)
    {
        var sessao = await SessaoAbertaAsync(operadorId, ct) ?? throw new RegraNegocioException("Não há caixa aberto.");
        if (req.Tipo == TipoMovimentoCaixa.Sangria)
        {
            var atual = await MontarAsync(sessao.Id, ct);
            if (req.Valor > atual.DinheiroEsperado)
                throw new RegraNegocioException($"Sangria maior que o dinheiro em caixa (R$ {atual.DinheiroEsperado:N2}).");
        }
        sessao.Movimentar(req.Tipo, req.Valor, req.Motivo, operadorId, calendario.AgoraUtc);
        await db.SaveChangesAsync(ct);
        return await MontarAsync(sessao.Id, ct);
    }

    public async Task<CaixaDto> FecharAsync(int operadorId, FecharCaixaRequest req, CancellationToken ct = default)
    {
        var sessao = await SessaoAbertaAsync(operadorId, ct) ?? throw new RegraNegocioException("Não há caixa aberto.");
        var atual = await MontarAsync(sessao.Id, ct);
        sessao.Fechar(atual.DinheiroEsperado, req.ValorContado, req.Observacao, calendario.AgoraUtc);
        await db.SaveChangesAsync(ct);
        return await MontarAsync(sessao.Id, ct);
    }

    public async Task<CaixaDto?> ObterAsync(int id, CancellationToken ct = default) =>
        await db.CaixasSessao.AnyAsync(c => c.Id == id, ct) ? await MontarAsync(id, ct) : null;

    public async Task<IReadOnlyList<CaixaDto>> ListarAsync(DateOnly? de, DateOnly? ate, int? depositoId, int limite, CancellationToken ct = default)
    {
        var q = db.CaixasSessao.AsNoTracking().AsQueryable();
        if (de is not null) { var ini = calendario.InicioDoDiaUtc(de.Value); q = q.Where(c => c.AbertoEm >= ini); }
        if (ate is not null) { var fim = calendario.InicioDoDiaUtc(ate.Value.AddDays(1)); q = q.Where(c => c.AbertoEm < fim); }
        if (depositoId is not null) q = q.Where(c => c.DepositoId == depositoId);
        var ids = await q.OrderByDescending(c => c.AbertoEm).Take(Math.Clamp(limite, 1, 300)).Select(c => c.Id).ToListAsync(ct);
        var lista = new List<CaixaDto>();
        foreach (var id in ids) lista.Add(await MontarAsync(id, ct));
        return lista;
    }

    private async Task<CaixaDto> MontarAsync(int id, CancellationToken ct)
    {
        var c = await db.CaixasSessao.AsNoTracking()
            .Include(x => x.Movimentos).Include(x => x.Deposito).Include(x => x.Operador)
            .FirstAsync(x => x.Id == id, ct);

        var vendas = await db.Vendas.AsNoTracking().Where(v => v.CaixaSessaoId == id)
            .Select(v => new { v.Id, v.Status, v.Total, v.Troco })
            .ToListAsync(ct);
        var concluidas = vendas.Where(v => v.Status == StatusVenda.Concluida).ToList();
        var idsConcluidas = concluidas.Select(v => v.Id).ToList();
        var pagamentos = await db.PagamentosVenda.AsNoTracking().Where(p => idsConcluidas.Contains(p.VendaId))
            .Select(p => new { p.Forma, p.Valor })
            .ToListAsync(ct);

        var troco = concluidas.Sum(v => v.Troco);
        var porForma = pagamentos.GroupBy(p => p.Forma)
            // Dinheiro aparece líquido de troco: é o que de fato ficou na gaveta
            .Select(g => new ValorFormaDto(g.Key, g.Sum(p => p.Valor) - (g.Key == FormaPagamento.Dinheiro ? troco : 0), g.Count()))
            .OrderByDescending(f => f.Valor).ToList();

        var suprimentos = c.Movimentos.Where(m => m.Tipo == TipoMovimentoCaixa.Suprimento).Sum(m => m.Valor);
        var sangrias = c.Movimentos.Where(m => m.Tipo == TipoMovimentoCaixa.Sangria).Sum(m => m.Valor);
        var dinheiro = porForma.Where(f => f.Forma == FormaPagamento.Dinheiro).Sum(f => f.Valor);
        var esperado = c.Status == StatusCaixa.Fechado && c.ValorEsperado is not null
            ? c.ValorEsperado.Value
            : c.ValorAbertura + dinheiro + suprimentos - sangrias;

        return new CaixaDto(c.Id, Mapeamentos.NumeroCaixa(c.Id), c.DepositoId, c.Deposito?.Nome ?? "", c.OperadorId, c.Operador?.NomeCompleto ?? "",
            c.Status, c.AbertoEm, c.FechadoEm, c.ValorAbertura, concluidas.Count, vendas.Count - concluidas.Count, concluidas.Sum(v => v.Total),
            porForma, suprimentos, sangrias, esperado, c.ValorContado, c.Diferenca, c.Observacao,
            c.Movimentos.OrderBy(m => m.CriadoEm).Select(m => new MovimentoCaixaDto(m.Id, m.Tipo, m.Valor, m.Motivo, m.CriadoEm)).ToList());
    }
}
