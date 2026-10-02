using System.Globalization;
using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>Indicadores do painel (estilo Power BI): KPIs, séries, rankings, cobertura de estoque e projeções.</summary>
public class AnalyticsService(AppDbContext db, Calendario calendario, FinanceiroService financeiro)
{
    private const int HistoricoParaPrevisao = 182;
    private const int HorizontePadrao = 30;
    private static readonly CultureInfo PtBr = new("pt-BR");

    private sealed record VendaLinha(int Id, DateTime DataUtc, DateTime Data, CanalVenda Canal, decimal Total, int? ClienteId);
    private sealed record ItemLinha(int VendaId, DateTime Data, int ProdutoId, int Quantidade, decimal Total, decimal Custo);

    public async Task<DashboardDto> DashboardAsync(int periodoDias = 90, int horizonte = HorizontePadrao, CancellationToken ct = default)
    {
        periodoDias = Math.Clamp(periodoDias, 7, 365);
        horizonte = Math.Clamp(horizonte, 7, 90);

        var hoje = calendario.Hoje;
        var inicioMes = new DateOnly(hoje.Year, hoje.Month, 1);
        var inicioMesAnterior = inicioMes.AddMonths(-1);
        var inicioPeriodo = hoje.AddDays(-(periodoDias - 1));
        var inicioHistorico = hoje.AddDays(-HistoricoParaPrevisao);
        var inicioBusca = new[] { inicioPeriodo, inicioMesAnterior, inicioHistorico }.Min();
        var inicioBuscaUtc = calendario.InicioDoDiaUtc(inicioBusca);

        var vendasBrutas = await db.Vendas.AsNoTracking()
            .Where(v => v.Status == StatusVenda.Concluida && v.Data >= inicioBuscaUtc)
            .Select(v => new { v.Id, v.Data, v.Canal, v.Total, v.ClienteId })
            .ToListAsync(ct);
        var vendas = vendasBrutas.Select(v => new VendaLinha(v.Id, v.Data, calendario.ParaLocal(v.Data), v.Canal, v.Total, v.ClienteId)).ToList();

        var itensBrutos = await (from i in db.ItensVenda.AsNoTracking()
                                 join v in db.Vendas on i.VendaId equals v.Id
                                 where v.Status == StatusVenda.Concluida && v.Data >= inicioBuscaUtc
                                 select new { i.VendaId, v.Data, i.ProdutoId, i.Quantidade, i.Total, i.CustoUnitario })
            .ToListAsync(ct);
        var itens = itensBrutos.Select(i => new ItemLinha(i.VendaId, calendario.ParaLocal(i.Data), i.ProdutoId, i.Quantidade, i.Total, i.CustoUnitario * i.Quantidade)).ToList();

        var produtos = await db.Produtos.AsNoTracking()
            .Select(p => new { p.Id, p.Nome, p.EstoqueMinimo, p.PrecoCusto, p.Ativo, Categoria = p.Categoria!.Nome, Cor = p.Categoria.Cor })
            .ToDictionaryAsync(p => p.Id, ct);


        DateOnly Dia(DateTime local) => DateOnly.FromDateTime(local);

        // ── Série diária (receita por dia) ──
        var porDia = vendas.GroupBy(v => Dia(v.Data)).ToDictionary(g => g.Key, g => (Valor: g.Sum(v => v.Total), Qtd: g.Count()));
        var serie = new List<PontoSerieDto>();
        for (var d = inicioPeriodo; d <= hoje; d = d.AddDays(1))
        {
            porDia.TryGetValue(d, out var val);
            serie.Add(new PontoSerieDto(d, val.Valor, val.Qtd));
        }

        // ── Projeção (histórico até ontem, prevê a partir de hoje) ──
        var historico = new List<double>();
        for (var d = inicioHistorico; d < hoje; d = d.AddDays(1))
            historico.Add(porDia.TryGetValue(d, out var v) ? (double)v.Valor : 0d);
        // Descarta dias iniciais sem movimento (antes da implantação do sistema)
        var primeiroComVenda = historico.FindIndex(v => v > 0);
        if (primeiroComVenda > 0) historico = historico.Skip(primeiroComVenda).ToList();

        var prev = Previsao.Prever(historico, horizonte);
        var pontos = Enumerable.Range(0, horizonte)
            .Select(h => new PontoProjecaoDto(hoje.AddDays(h), R(prev.Previsto[h]), R(prev.Minimo[h]), R(prev.Maximo[h])))
            .ToList();
        var totalPrevisto = pontos.Sum(p => p.Previsto);
        var ultimoIgual = vendas.Where(v => Dia(v.Data) >= hoje.AddDays(-horizonte) && Dia(v.Data) < hoje).Sum(v => v.Total);
        var crescimento = ultimoIgual == 0 ? 0 : Math.Round((totalPrevisto - ultimoIgual) / ultimoIgual * 100, 1);

        // ── KPIs ──
        var hojeVendas = vendas.Where(v => Dia(v.Data) == hoje).ToList();
        var mesVendas = vendas.Where(v => Dia(v.Data) >= inicioMes).ToList();
        var mesAnteriorMesmoPeriodo = vendas.Where(v => Dia(v.Data) >= inicioMesAnterior && Dia(v.Data) < inicioMesAnterior.AddDays(hoje.Day)).Sum(v => v.Total);
        var faturamentoMes = mesVendas.Sum(v => v.Total);
        var mesItens = itens.Where(i => Dia(i.Data) >= inicioMes).ToList();
        var receitaItensMes = mesItens.Sum(i => i.Total);
        var margemMes = receitaItensMes == 0 ? 0 : Math.Round((receitaItensMes - mesItens.Sum(i => i.Custo)) / receitaItensMes * 100, 1);

        var fimMes = inicioMes.AddMonths(1);
        var restanteMes = pontos.Where(p => p.Data > hoje && p.Data < fimMes).Sum(p => p.Previsto);
        var hojePrevisto = pontos.FirstOrDefault(p => p.Data == hoje)?.Previsto ?? 0;
        var previsaoFechamento = faturamentoMes + restanteMes + Math.Max(0, hojePrevisto - hojeVendas.Sum(v => v.Total));

        var saldos = await db.Saldos.AsNoTracking()
            .Select(s => new { s.ProdutoId, s.Quantidade, s.Reservado })
            .ToListAsync(ct);
        var valorEstoque = saldos.Sum(s => produtos.TryGetValue(s.ProdutoId, out var p) ? p.PrecoCusto * s.Quantidade : 0);

        var pedidosPendentes = await db.Pedidos.CountAsync(p => p.Status != StatusPedido.Concluido && p.Status != StatusPedido.Cancelado && p.Status != StatusPedido.Expirado, ct);
        var clientesAtivos = vendas.Where(v => v.ClienteId != null && Dia(v.Data) > hoje.AddDays(-90)).Select(v => v.ClienteId).Distinct().Count();

        var kpis = new KpisDto(
            hojeVendas.Sum(v => v.Total), hojeVendas.Count,
            faturamentoMes, mesAnteriorMesmoPeriodo,
            mesAnteriorMesmoPeriodo == 0 ? 0 : Math.Round((faturamentoMes - mesAnteriorMesmoPeriodo) / mesAnteriorMesmoPeriodo * 100, 1),
            mesVendas.Count == 0 ? 0 : Math.Round(faturamentoMes / mesVendas.Count, 2),
            margemMes, mesItens.Sum(i => i.Quantidade), R(previsaoFechamento), R(valorEstoque), clientesAtivos, pedidosPendentes);

        // ── Recortes do período ──
        var vendasPeriodo = vendas.Where(v => Dia(v.Data) >= inicioPeriodo).ToList();
        var itensPeriodo = itens.Where(i => Dia(i.Data) >= inicioPeriodo).ToList();

        var porCategoria = itensPeriodo
            .GroupBy(i => produtos.TryGetValue(i.ProdutoId, out var p) ? (p.Categoria, p.Cor) : ("Outros", "#888888"))
            .Select(g => new FatiaDto(g.Key.Item1, g.Sum(i => i.Total), g.Key.Item2))
            .OrderByDescending(f => f.Valor).ToList();

        var porCanal = vendasPeriodo.GroupBy(v => v.Canal)
            .Select(g => new FatiaDto(VendaService.DescreverCanal(g.Key), g.Sum(v => v.Total)))
            .OrderByDescending(f => f.Valor).ToList();

        var semanas = Math.Max(1m, periodoDias / 7m);
        var porDiaSemana = Enumerable.Range(0, 7)
            .Select(i => (DayOfWeek)((i + 1) % 7)) // segunda..domingo
            .Select(d => new FatiaDto(PtBr.DateTimeFormat.GetAbbreviatedDayName(d).TrimEnd('.'),
                R(vendasPeriodo.Where(v => v.Data.DayOfWeek == d).Sum(v => v.Total) / semanas)))
            .ToList();

        var porHora = vendasPeriodo.GroupBy(v => v.Data.Hour).OrderBy(g => g.Key)
            .Select(g => new FatiaDto($"{g.Key:00}h", g.Sum(v => v.Total))).ToList();

        var top = itensPeriodo.GroupBy(i => i.ProdutoId)
            .Select(g =>
            {
                var receita = g.Sum(i => i.Total);
                var p = produtos.GetValueOrDefault(g.Key);
                return new RankingProdutoDto(g.Key, p?.Nome ?? $"#{g.Key}", p?.Categoria ?? "", g.Sum(i => i.Quantidade), receita,
                    receita == 0 ? 0 : Math.Round((receita - g.Sum(i => i.Custo)) / receita * 100, 1));
            })
            .OrderByDescending(r => r.Faturamento).Take(10).ToList();

        // ── Cobertura de estoque (quando cada produto acaba no ritmo atual) ──
        var janelaGiro = 30;
        var giro = itens.Where(i => Dia(i.Data) >= hoje.AddDays(-janelaGiro) && Dia(i.Data) < hoje)
            .GroupBy(i => i.ProdutoId).ToDictionary(g => g.Key, g => (decimal)g.Sum(i => i.Quantidade) / janelaGiro);
        var disponivelPorProduto = saldos.GroupBy(s => s.ProdutoId).ToDictionary(g => g.Key, g => g.Sum(s => s.Quantidade - s.Reservado));

        var cobertura = produtos.Values.Where(p => p.Ativo)
            .Select(p =>
            {
                var disp = disponivelPorProduto.GetValueOrDefault(p.Id);
                var media = Math.Round(giro.GetValueOrDefault(p.Id), 2);
                decimal? dias = media > 0 ? Math.Round(disp / media, 1) : null;
                DateOnly? ruptura = dias is not null ? hoje.AddDays((int)Math.Floor(dias.Value)) : null;
                var sugestao = (int)Math.Max(0, Math.Ceiling(media * 30 + p.EstoqueMinimo - disp));
                return new CoberturaEstoqueDto(p.Id, p.Nome, disp, p.EstoqueMinimo, media, dias, ruptura, sugestao);
            })
            .Where(c => c.Disponivel < c.EstoqueMinimo || c.DiasCobertura is < 21)
            .OrderBy(c => c.DiasCobertura ?? (c.Disponivel <= 0 ? 0 : 999))
            .Take(12).ToList();

        var alertas = await financeiro.AlertasAsync(7, ct);

        var ultimasVendas = vendas.OrderByDescending(v => v.DataUtc).Take(8).ToList();
        var idsClientes = ultimasVendas.Where(v => v.ClienteId != null).Select(v => v.ClienteId!.Value).Distinct().ToList();
        var clientesNomes = await db.Clientes.AsNoTracking().Where(c => idsClientes.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Nome, ct);
        var ultimas = ultimasVendas
            .Select(v => new VendaResumoDto(v.Id, Mapeamentos.NumeroVenda(v.Id), v.DataUtc, v.Canal, StatusVenda.Concluida,
                v.ClienteId is null ? null : clientesNomes.GetValueOrDefault(v.ClienteId.Value),
                itens.Where(i => i.VendaId == v.Id).Sum(i => i.Quantidade), v.Total))
            .ToList();

        return new DashboardDto(calendario.AgoraUtc, periodoDias, kpis, serie,
            new ProjecaoDto(prev.Metodo, pontos, R(totalPrevisto), R(ultimoIgual), crescimento, (decimal)prev.ErroMedioPercentual),
            porCategoria, porCanal, porDiaSemana, porHora, top, cobertura, alertas, ultimas);
    }

    private static decimal R(double v) => Math.Round((decimal)v, 2);
    private static decimal R(decimal v) => Math.Round(v, 2);
}
