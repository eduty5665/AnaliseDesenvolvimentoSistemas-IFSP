using System.Globalization;
using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>Relatórios gerenciais do ERP: vendas, curva ABC, kardex, entradas e saídas, fluxo de caixa e DRE.</summary>
public class RelatorioService(AppDbContext db, Calendario calendario)
{
    private static readonly CultureInfo PtBr = new("pt-BR");

    private (DateTime IniUtc, DateTime FimUtc) Periodo(DateOnly de, DateOnly ate)
    {
        if (ate < de) throw new RegraNegocioException("Período inválido: a data final é anterior à inicial.");
        if (ate.DayNumber - de.DayNumber > 730) throw new RegraNegocioException("Período máximo de 2 anos.");
        return (calendario.InicioDoDiaUtc(de), calendario.InicioDoDiaUtc(ate.AddDays(1)));
    }

    // ───────────────────────── Vendas ─────────────────────────

    private sealed record ItemBase(int VendaId, int ProdutoId, int Quantidade, decimal Bruto, decimal Desconto, decimal Custo);

    public async Task<RelatorioVendasDto> VendasAsync(DateOnly de, DateOnly ate, string? agrupamento, int? depositoId, CanalVenda? canal, CancellationToken ct = default)
    {
        var (ini, fim) = Periodo(de, ate);
        agrupamento = (agrupamento ?? AgrupamentosVenda.Dia).ToLowerInvariant();

        var qVendas = db.Vendas.AsNoTracking().Where(v => v.Status == StatusVenda.Concluida && v.Data >= ini && v.Data < fim);
        if (depositoId is not null) qVendas = qVendas.Where(v => v.DepositoId == depositoId);
        if (canal is not null) qVendas = qVendas.Where(v => v.Canal == canal);

        var vendas = await qVendas
            .Select(v => new { v.Id, v.Data, v.Canal, v.UsuarioId, v.VendedorId, v.DepositoId, v.Desconto, v.Troco })
            .ToListAsync(ct);
        var ids = vendas.Select(v => v.Id).ToHashSet();

        var itensBrutos = await (from i in db.ItensVenda.AsNoTracking()
                                 join v in db.Vendas on i.VendaId equals v.Id
                                 where v.Status == StatusVenda.Concluida && v.Data >= ini && v.Data < fim
                                 select new { i.VendaId, i.ProdutoId, i.Quantidade, i.PrecoUnitario, i.Desconto, i.CustoUnitario })
            .ToListAsync(ct);
        var itens = itensBrutos.Where(i => ids.Contains(i.VendaId))
            .Select(i => new ItemBase(i.VendaId, i.ProdutoId, i.Quantidade, i.PrecoUnitario * i.Quantidade, i.Desconto, i.CustoUnitario * i.Quantidade))
            .ToList();
        var itensPorVenda = itens.ToLookup(i => i.VendaId);

        // Uma "fatia" é a parte de uma venda atribuída a uma chave de agrupamento
        var fatias = new List<(string Chave, object? Ordem, int VendaId, int Itens, decimal Bruto, decimal Descontos, decimal Custo)>();

        switch (agrupamento)
        {
            case AgrupamentosVenda.Produto or AgrupamentosVenda.Categoria:
            {
                var produtos = await db.Produtos.AsNoTracking()
                    .Select(p => new { p.Id, p.Nome, p.Sku, Categoria = p.Categoria!.Nome }).ToDictionaryAsync(p => p.Id, ct);
                foreach (var v in vendas)
                {
                    var linhas = itensPorVenda[v.Id].ToList();
                    var liquidoItens = linhas.Sum(i => i.Bruto - i.Desconto);
                    foreach (var i in linhas)
                    {
                        // Desconto geral da venda rateado pelo valor de cada item
                        var rateio = liquidoItens == 0 ? 0 : v.Desconto * (i.Bruto - i.Desconto) / liquidoItens;
                        var p = produtos.GetValueOrDefault(i.ProdutoId);
                        var chave = agrupamento == AgrupamentosVenda.Produto ? $"{p?.Nome ?? $"#{i.ProdutoId}"} ({p?.Sku})" : p?.Categoria ?? "Sem categoria";
                        fatias.Add((chave, null, v.Id, i.Quantidade, i.Bruto, i.Desconto + rateio, i.Custo));
                    }
                }
                break;
            }
            case AgrupamentosVenda.Forma:
            {
                var pagamentos = (await (from p in db.PagamentosVenda.AsNoTracking()
                                         join v in db.Vendas on p.VendaId equals v.Id
                                         where v.Status == StatusVenda.Concluida && v.Data >= ini && v.Data < fim
                                         select new { p.VendaId, p.Forma, p.Valor }).ToListAsync(ct))
                    .Where(p => ids.Contains(p.VendaId)).ToLookup(p => p.VendaId);
                foreach (var v in vendas)
                {
                    var linhas = itensPorVenda[v.Id].ToList();
                    var bruto = linhas.Sum(i => i.Bruto);
                    var descontos = linhas.Sum(i => i.Desconto) + v.Desconto;
                    var custo = linhas.Sum(i => i.Custo);
                    var pagos = pagamentos[v.Id].Select(p => (p.Forma, Valor: p.Valor - (p.Forma == FormaPagamento.Dinheiro ? v.Troco : 0))).ToList();
                    var totalPago = pagos.Sum(p => p.Valor);
                    foreach (var p in pagos)
                    {
                        var parte = totalPago == 0 ? 0 : p.Valor / totalPago;
                        fatias.Add((DescreverForma(p.Forma), null, v.Id, (int)Math.Round(linhas.Sum(i => i.Quantidade) * parte), bruto * parte, descontos * parte, custo * parte));
                    }
                }
                break;
            }
            default:
            {
                var usuarios = await db.Usuarios.AsNoTracking().Select(u => new { u.Id, Nome = u.Nome + " " + u.Sobrenome }).ToDictionaryAsync(u => u.Id, u => u.Nome, ct);
                var depositos = await db.Depositos.AsNoTracking().ToDictionaryAsync(d => d.Id, d => d.Nome, ct);
                foreach (var v in vendas)
                {
                    var linhas = itensPorVenda[v.Id].ToList();
                    var dia = calendario.DataLocal(v.Data);
                    (string Chave, object? Ordem) k = agrupamento switch
                    {
                        AgrupamentosVenda.Vendedor => (v.VendedorId is { } vid ? usuarios.GetValueOrDefault(vid, "—") : "Sem vendedor (online)", null),
                        AgrupamentosVenda.Operador => (v.UsuarioId is { } uid ? usuarios.GetValueOrDefault(uid, "—") : "—", null),
                        AgrupamentosVenda.Canal => (VendaService.DescreverCanal(v.Canal), null),
                        AgrupamentosVenda.Loja => (depositos.GetValueOrDefault(v.DepositoId, "—"), null),
                        _ => (dia.ToString("dd/MM/yyyy (ddd)", PtBr), dia.DayNumber)
                    };
                    fatias.Add((k.Chave, k.Ordem, v.Id, linhas.Sum(i => i.Quantidade), linhas.Sum(i => i.Bruto), linhas.Sum(i => i.Desconto) + v.Desconto, linhas.Sum(i => i.Custo)));
                }
                if (agrupamento is not (AgrupamentosVenda.Vendedor or AgrupamentosVenda.Operador or AgrupamentosVenda.Canal or AgrupamentosVenda.Loja))
                    agrupamento = AgrupamentosVenda.Dia;
                break;
            }
        }

        var totalLiquido = fatias.Sum(f => f.Bruto - f.Descontos);
        var grupos = fatias.GroupBy(f => f.Chave)
            .Select(g =>
            {
                var bruto = g.Sum(f => f.Bruto);
                var desc = g.Sum(f => f.Descontos);
                var custo = g.Sum(f => f.Custo);
                return new { g.Key, Ordem = g.First().Ordem, Vendas = g.Select(f => f.VendaId).Distinct().Count(), Itens = g.Sum(f => f.Itens), Bruto = bruto, Desc = desc, Liquido = bruto - desc, Custo = custo };
            })
            .ToList();
        grupos = agrupamento == AgrupamentosVenda.Dia
            ? grupos.OrderBy(g => (int)(g.Ordem ?? 0)).ToList()
            : grupos.OrderByDescending(g => g.Liquido).ToList();

        var linhasDto = new List<LinhaVendasDto>();
        decimal acumulado = 0;
        foreach (var g in grupos)
        {
            var participacao = totalLiquido == 0 ? 0 : g.Liquido / totalLiquido * 100;
            acumulado += participacao;
            // Curva ABC: A = até 80% do faturamento acumulado, B = até 95%, C = restante
            string? classe = agrupamento == AgrupamentosVenda.Produto ? (acumulado - participacao < 80 ? "A" : acumulado - participacao < 95 ? "B" : "C") : null;
            linhasDto.Add(Linha(g.Key, g.Vendas, g.Itens, g.Bruto, g.Desc, g.Custo, participacao, agrupamento == AgrupamentosVenda.Dia ? 0 : acumulado, classe));
        }

        var total = Linha("Total", vendas.Count, itens.Sum(i => i.Quantidade), fatias.Sum(f => f.Bruto), fatias.Sum(f => f.Descontos), fatias.Sum(f => f.Custo), 100, 100, null);
        return new RelatorioVendasDto(de, ate, agrupamento, linhasDto, total);

        static LinhaVendasDto Linha(string chave, int vendas, int itens, decimal bruto, decimal desc, decimal custo, decimal part, decimal acum, string? classe)
        {
            var liquido = bruto - desc;
            return new LinhaVendasDto(chave, vendas, itens, R(bruto), R(desc), R(liquido), R(custo), R(liquido - custo),
                liquido == 0 ? 0 : Math.Round((liquido - custo) / liquido * 100, 1), Math.Round(part, 1), Math.Round(acum, 1), classe);
        }
    }

    // ───────────────────────── Kardex ─────────────────────────

    public async Task<KardexDto> KardexAsync(int produtoId, int? depositoId, DateOnly de, DateOnly ate, CancellationToken ct = default)
    {
        var (ini, fim) = Periodo(de, ate);
        var produto = await db.Produtos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == produtoId, ct)
                      ?? throw new NaoEncontradoException("Produto não encontrado.");
        var deposito = depositoId is null ? null : await db.Depositos.AsNoTracking().FirstOrDefaultAsync(d => d.Id == depositoId, ct);

        var saldoAtual = await db.Saldos.AsNoTracking()
            .Where(s => s.ProdutoId == produtoId && (depositoId == null || s.DepositoId == depositoId))
            .SumAsync(s => s.Quantidade, ct);

        // Tudo que aconteceu desde o início do período até agora (para voltar do saldo atual ao saldo inicial)
        var brutos = await (from i in db.ItensMovimentacao.AsNoTracking()
                            join m in db.Movimentacoes on i.MovimentacaoId equals m.Id
                            where i.ProdutoId == produtoId && m.Data >= ini
                            orderby m.Data, m.Id
                            select new
                            {
                                m.Id, m.Data, m.Tipo, m.NumeroDocumento, m.Observacao, m.Motivo, m.OrdemSeparacaoId,
                                m.DepositoOrigemId, m.DepositoDestinoId,
                                Origem = m.DepositoOrigem!.Nome, Destino = m.DepositoDestino!.Nome,
                                Fornecedor = m.Fornecedor!.RazaoSocial,
                                Usuario = m.Usuario!.Nome,
                                i.Quantidade, i.CustoUnitario
                            }).ToListAsync(ct);

        // Efeitos de cada movimento no(s) depósito(s): (depósitoId, nome, variação)
        var efeitos = new List<(DateTime Data, int Ordem, TipoMovimentacao Tipo, string Numero, string? Documento, string Deposito, string? Historico, int Delta, decimal Custo, string? Usuario)>();
        foreach (var m in brutos)
        {
            var numero = Mapeamentos.NumeroMovimentacao(m.Tipo, m.Id);
            var historico = m.Tipo switch
            {
                TipoMovimentacao.Entrada => m.Fornecedor,
                TipoMovimentacao.Saida => m.Motivo is { } mot ? EstoqueService.DescreverMotivo(mot) + (string.IsNullOrWhiteSpace(m.Observacao) ? "" : $" — {m.Observacao}") : m.Observacao,
                TipoMovimentacao.Transferencia => $"{m.Origem} → {m.Destino}",
                TipoMovimentacao.RecebimentoTransferencia => $"Vindo de {m.Origem}",
                _ => m.Observacao
            };
            void Add(int? depId, string? depNome, int delta)
            {
                if (depId is null || delta == 0) return;
                if (depositoId is not null && depId != depositoId) return;
                efeitos.Add((m.Data, m.Id, m.Tipo, numero, m.NumeroDocumento, depNome ?? "—", historico, delta, m.CustoUnitario, m.Usuario));
            }

            switch (m.Tipo)
            {
                case TipoMovimentacao.Entrada or TipoMovimentacao.CancelamentoVenda or TipoMovimentacao.RecebimentoTransferencia:
                    Add(m.DepositoDestinoId, m.Destino, Math.Abs(m.Quantidade));
                    break;
                case TipoMovimentacao.Saida or TipoMovimentacao.Venda:
                    Add(m.DepositoOrigemId, m.Origem, -Math.Abs(m.Quantidade));
                    break;
                case TipoMovimentacao.Ajuste:
                    Add(m.DepositoOrigemId, m.Origem, m.Quantidade);
                    break;
                case TipoMovimentacao.Transferencia when m.OrdemSeparacaoId is not null:
                    // Expedição por ordem de separação: só sai da origem (a entrada no destino é o recebimento)
                    Add(m.DepositoOrigemId, m.Origem, -Math.Abs(m.Quantidade));
                    break;
                case TipoMovimentacao.Transferencia:
                    Add(m.DepositoOrigemId, m.Origem, -Math.Abs(m.Quantidade));
                    Add(m.DepositoDestinoId, m.Destino, Math.Abs(m.Quantidade));
                    break;
            }
        }

        var saldoInicial = saldoAtual - efeitos.Sum(e => e.Delta);
        var saldo = saldoInicial;
        var linhas = new List<LinhaKardexDto>();
        foreach (var e in efeitos.Where(e => e.Data < fim).OrderBy(e => e.Data).ThenBy(e => e.Ordem))
        {
            saldo += e.Delta;
            linhas.Add(new LinhaKardexDto(e.Data, e.Tipo, e.Numero, e.Documento, e.Deposito, e.Historico,
                e.Delta > 0 ? e.Delta : 0, e.Delta < 0 ? -e.Delta : 0, saldo, e.Custo, e.Usuario));
        }

        return new KardexDto(produto.Id, produto.Sku, produto.Nome, deposito?.Nome, de, ate, saldoInicial, saldo,
            linhas.Sum(l => l.Entrada), linhas.Sum(l => l.Saida), linhas);
    }

    // ───────────────────────── Entradas e saídas ─────────────────────────

    public async Task<RelatorioMovimentacoesDto> MovimentacoesAsync(DateOnly de, DateOnly ate, TipoMovimentacao? tipo, int? depositoId, bool incluirVendas, CancellationToken ct = default)
    {
        var (ini, fim) = Periodo(de, ate);
        var q = db.Movimentacoes.AsNoTracking().Where(m => m.Data >= ini && m.Data < fim);
        if (tipo is not null) q = q.Where(m => m.Tipo == tipo);
        else if (!incluirVendas) q = q.Where(m => m.Tipo != TipoMovimentacao.Venda && m.Tipo != TipoMovimentacao.CancelamentoVenda);
        if (depositoId is not null) q = q.Where(m => m.DepositoOrigemId == depositoId || m.DepositoDestinoId == depositoId);

        var brutos = await (from m in q
                            join i in db.ItensMovimentacao on m.Id equals i.MovimentacaoId
                            orderby m.Data, m.Id
                            select new
                            {
                                m.Id, m.Data, m.Tipo, m.NumeroDocumento, m.Serie, m.Motivo, m.Observacao,
                                Origem = m.DepositoOrigem!.Nome, Destino = m.DepositoDestino!.Nome,
                                Fornecedor = m.Fornecedor!.RazaoSocial, Usuario = m.Usuario!.Nome,
                                i.Produto!.Sku, Produto = i.Produto.Nome, i.Quantidade, i.CustoUnitario
                            }).Take(20000).ToListAsync(ct);

        var linhas = brutos.Select(m => new LinhaMovimentacaoDto(m.Data, Mapeamentos.NumeroMovimentacao(m.Tipo, m.Id), m.Tipo, m.Origem, m.Destino,
            m.Tipo == TipoMovimentacao.Entrada && m.NumeroDocumento is not null ? $"NF {m.NumeroDocumento}/{m.Serie}" : m.NumeroDocumento,
            m.Tipo == TipoMovimentacao.Saida && m.Motivo is { } mot ? EstoqueService.DescreverMotivo(mot) : m.Fornecedor ?? m.Observacao,
            m.Sku, m.Produto, m.Quantidade, m.CustoUnitario, R(Math.Abs(m.Quantidade) * m.CustoUnitario), m.Usuario)).ToList();

        var resumo = brutos.GroupBy(m => m.Tipo)
            .Select(g => new ResumoMovimentacaoDto(g.Key, g.Select(x => x.Id).Distinct().Count(), g.Sum(x => Math.Abs(x.Quantidade)), R(g.Sum(x => Math.Abs(x.Quantidade) * x.CustoUnitario))))
            .OrderBy(r => r.Tipo).ToList();

        return new RelatorioMovimentacoesDto(de, ate, resumo, linhas);
    }

    // ───────────────────────── Financeiro ─────────────────────────

    public async Task<FluxoCaixaDto> FluxoCaixaAsync(DateOnly de, DateOnly ate, CancellationToken ct = default)
    {
        Periodo(de, ate);
        var realizados = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Status == StatusLancamento.Pago && l.DataPagamento >= de && l.DataPagamento <= ate)
            .Select(l => new { l.Tipo, l.Valor, Data = l.DataPagamento!.Value }).ToListAsync(ct);
        var previstos = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Status == StatusLancamento.Aberto && l.Vencimento >= de && l.Vencimento <= ate)
            .Select(l => new { l.Tipo, l.Valor, Data = l.Vencimento }).ToListAsync(ct);

        var linhas = new List<LinhaFluxoDto>();
        decimal acumulado = 0;
        for (var d = de; d <= ate; d = d.AddDays(1))
        {
            var entradas = realizados.Where(l => l.Data == d && l.Tipo == TipoLancamento.Receita).Sum(l => l.Valor);
            var saidas = realizados.Where(l => l.Data == d && l.Tipo == TipoLancamento.Despesa).Sum(l => l.Valor);
            var entPrev = previstos.Where(l => l.Data == d && l.Tipo == TipoLancamento.Receita).Sum(l => l.Valor);
            var saiPrev = previstos.Where(l => l.Data == d && l.Tipo == TipoLancamento.Despesa).Sum(l => l.Valor);
            if (entradas == 0 && saidas == 0 && entPrev == 0 && saiPrev == 0) continue;
            acumulado += entradas - saidas;
            linhas.Add(new LinhaFluxoDto(d, entradas, saidas, entradas - saidas, acumulado, entPrev, saiPrev));
        }
        return new FluxoCaixaDto(de, ate, linhas, linhas.Sum(l => l.Entradas), linhas.Sum(l => l.Saidas),
            linhas.Sum(l => l.EntradasPrevistas), linhas.Sum(l => l.SaidasPrevistas));
    }

    /// <summary>Demonstrativo de resultado simplificado (gerencial, não contábil).</summary>
    public async Task<DreDto> DreAsync(DateOnly de, DateOnly ate, CancellationToken ct = default)
    {
        var (ini, fim) = Periodo(de, ate);
        var vendas = await db.Vendas.AsNoTracking()
            .Where(v => v.Status == StatusVenda.Concluida && v.Data >= ini && v.Data < fim)
            .Select(v => new { v.Desconto, v.Total }).ToListAsync(ct);
        var itens = await (from i in db.ItensVenda.AsNoTracking()
                           join v in db.Vendas on i.VendaId equals v.Id
                           where v.Status == StatusVenda.Concluida && v.Data >= ini && v.Data < fim
                           select new { i.Quantidade, i.PrecoUnitario, i.Desconto, i.CustoUnitario }).ToListAsync(ct);

        var bruta = itens.Sum(i => i.PrecoUnitario * i.Quantidade);
        var descontos = itens.Sum(i => i.Desconto) + vendas.Sum(v => v.Desconto);
        var liquida = bruta - descontos;
        var cmv = itens.Sum(i => i.CustoUnitario * i.Quantidade);
        // Taxas de entrega cobradas nos pedidos online entram como outra receita
        var fretes = vendas.Sum(v => v.Total) - liquida;

        var lancamentos = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Status != StatusLancamento.Cancelado && l.Vencimento >= de && l.Vencimento <= ate &&
                        l.Categoria != CategoriaLancamento.Venda && l.Categoria != CategoriaLancamento.CompraMercadoria)
            .Select(l => new { l.Tipo, l.Categoria, l.Valor }).ToListAsync(ct);

        var despesas = lancamentos.Where(l => l.Tipo == TipoLancamento.Despesa).GroupBy(l => l.Categoria)
            .Select(g => new ValorCategoriaDto(FinanceiroService.DescreverCategoria(g.Key), g.Sum(x => x.Valor)))
            .OrderByDescending(x => x.Valor).ToList();
        var totalDespesas = despesas.Sum(x => x.Valor);
        var outras = lancamentos.Where(l => l.Tipo == TipoLancamento.Receita).Sum(l => l.Valor) + Math.Max(0, fretes);
        var lucroBruto = liquida - cmv;
        var resultado = lucroBruto + outras - totalDespesas;

        return new DreDto(de, ate, R(bruta), R(descontos), R(liquida), R(cmv), R(lucroBruto),
            liquida == 0 ? 0 : Math.Round(lucroBruto / liquida * 100, 1), despesas, R(totalDespesas), R(outras), R(resultado),
            liquida == 0 ? 0 : Math.Round(resultado / liquida * 100, 1));
    }

    public static string DescreverForma(FormaPagamento f) => f switch
    {
        FormaPagamento.Dinheiro => "Dinheiro",
        FormaPagamento.Pix => "Pix",
        FormaPagamento.CartaoCredito => "Cartão de crédito",
        FormaPagamento.CartaoDebito => "Cartão de débito",
        FormaPagamento.Boleto => "Boleto",
        _ => "Na entrega/retirada"
    };

    private static decimal R(decimal v) => Math.Round(v, 2);
}
