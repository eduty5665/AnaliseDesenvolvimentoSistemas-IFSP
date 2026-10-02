using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

public class EstoqueService(AppDbContext db, Calendario calendario, INotificadorPainel notificador)
{
    /// <summary>Busca (ou cria zerado) o saldo do produto no depósito. Não salva.</summary>
    public async Task<SaldoEstoque> ObterSaldoAsync(int produtoId, int depositoId, CancellationToken ct = default)
    {
        var saldo = db.Saldos.Local.FirstOrDefault(s => s.ProdutoId == produtoId && s.DepositoId == depositoId)
                    ?? await db.Saldos.FirstOrDefaultAsync(s => s.ProdutoId == produtoId && s.DepositoId == depositoId, ct);
        if (saldo is null)
        {
            saldo = new SaldoEstoque { ProdutoId = produtoId, DepositoId = depositoId };
            db.Saldos.Add(saldo);
        }
        return saldo;
    }

    public async Task<IReadOnlyList<SaldoDto>> ListarSaldosAsync(int? depositoId, string? busca, bool somenteAbaixoMinimo, CancellationToken ct = default)
    {
        var q = db.Saldos.AsNoTracking().Where(s => s.Produto!.Ativo);
        if (depositoId is not null) q = q.Where(s => s.DepositoId == depositoId);
        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var padrao = Busca.Padrao(termo);
            q = q.Where(s => EF.Functions.Like(s.Produto!.Nome, padrao) || EF.Functions.Like(s.Produto.Sku, padrao) || s.Produto.CodigoBarras == termo);
        }

        var linhas = await q
            .Select(s => new
            {
                s.ProdutoId, s.Produto!.Sku, Produto = s.Produto.Nome, Categoria = s.Produto.Categoria!.Nome,
                s.DepositoId, Deposito = s.Deposito!.Nome, s.Quantidade, s.Reservado, s.Produto.EstoqueMinimo, s.Produto.PrecoCusto
            })
            .ToListAsync(ct);

        var resultado = linhas
            .Select(l => new SaldoDto(l.ProdutoId, l.Sku, l.Produto, l.Categoria, l.DepositoId, l.Deposito, l.Quantidade, l.Reservado,
                l.Quantidade - l.Reservado, l.EstoqueMinimo, l.Quantidade - l.Reservado < l.EstoqueMinimo, l.PrecoCusto))
            .Where(s => !somenteAbaixoMinimo || s.AbaixoMinimo)
            .OrderBy(s => s.Produto).ThenBy(s => s.Deposito)
            .ToList();
        return resultado;
    }

    public async Task<PaginaDto<MovimentacaoDto>> ListarMovimentacoesAsync(TipoMovimentacao? tipo, int? produtoId, int? depositoId,
        DateOnly? de, DateOnly? ate, int pagina, int tamanho, CancellationToken ct = default)
    {
        var q = db.Movimentacoes.AsNoTracking().AsQueryable();
        if (tipo is not null) q = q.Where(m => m.Tipo == tipo);
        if (produtoId is not null) q = q.Where(m => m.Itens.Any(i => i.ProdutoId == produtoId));
        if (depositoId is not null) q = q.Where(m => m.DepositoOrigemId == depositoId || m.DepositoDestinoId == depositoId);
        if (de is not null) { var ini = calendario.InicioDoDiaUtc(de.Value); q = q.Where(m => m.Data >= ini); }
        if (ate is not null) { var fim = calendario.InicioDoDiaUtc(ate.Value.AddDays(1)); q = q.Where(m => m.Data < fim); }

        var total = await q.CountAsync(ct);
        pagina = Math.Max(1, pagina);
        tamanho = Math.Clamp(tamanho, 1, 200);
        var itens = await q.OrderByDescending(m => m.Data).ThenByDescending(m => m.Id)
            .Skip((pagina - 1) * tamanho).Take(tamanho)
            .Include(m => m.Itens).ThenInclude(i => i.Produto)
            .Include(m => m.DepositoOrigem).Include(m => m.DepositoDestino)
            .Include(m => m.Fornecedor).Include(m => m.Usuario)
            .AsSplitQuery()
            .ToListAsync(ct);
        return new PaginaDto<MovimentacaoDto>(itens.Select(m => m.ToDto()).ToList(), total, pagina, tamanho);
    }

    /// <summary>Entrada de mercadoria, saída avulsa, transferência entre depósitos ou ajuste de inventário.</summary>
    public async Task<MovimentacaoDto> RegistrarAsync(MovimentacaoRequest req, int? usuarioId, CancellationToken ct = default)
    {
        if (req.Itens is null || req.Itens.Count == 0) throw new RegraNegocioException("Informe ao menos um item.");
        if (req.Itens.GroupBy(i => i.ProdutoId).Any(g => g.Count() > 1))
            throw new RegraNegocioException("Há produtos repetidos na lista. Some as quantidades em uma única linha.");

        switch (req.Tipo)
        {
            case TipoMovimentacao.Entrada when req.DepositoDestinoId is null:
                throw new RegraNegocioException("Entrada exige o depósito de destino.");
            case TipoMovimentacao.Saida or TipoMovimentacao.Ajuste when req.DepositoOrigemId is null:
                throw new RegraNegocioException("Informe o depósito.");
            case TipoMovimentacao.Transferencia when req.DepositoOrigemId is null || req.DepositoDestinoId is null:
                throw new RegraNegocioException("Transferência exige depósito de origem e de destino.");
            case TipoMovimentacao.Transferencia when req.DepositoOrigemId == req.DepositoDestinoId:
                throw new RegraNegocioException("Origem e destino devem ser diferentes.");
            case TipoMovimentacao.Venda or TipoMovimentacao.CancelamentoVenda:
                throw new RegraNegocioException("Movimentações de venda são geradas pelo PDV.");
        }

        var depositoIds = new[] { req.DepositoOrigemId, req.DepositoDestinoId }.Where(i => i is not null).Select(i => i!.Value).ToList();
        var depositosValidos = await db.Depositos.CountAsync(d => depositoIds.Contains(d.Id) && d.Ativo, ct);
        if (depositosValidos != depositoIds.Distinct().Count()) throw new RegraNegocioException("Depósito inválido ou inativo.");

        if (req.FornecedorId is not null && !await db.Fornecedores.AnyAsync(f => f.Id == req.FornecedorId, ct))
            throw new RegraNegocioException("Fornecedor não encontrado.");

        var produtoIds = req.Itens.Select(i => i.ProdutoId).ToList();
        var produtos = await db.Produtos.Where(p => produtoIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, ct);
        if (produtos.Count != produtoIds.Count) throw new RegraNegocioException("Um ou mais produtos não foram encontrados.");

        var mov = new Movimentacao
        {
            Tipo = req.Tipo,
            Data = calendario.AgoraUtc,
            DepositoOrigemId = req.Tipo == TipoMovimentacao.Entrada ? null : req.DepositoOrigemId,
            DepositoDestinoId = req.Tipo is TipoMovimentacao.Saida or TipoMovimentacao.Ajuste ? null : req.DepositoDestinoId,
            FornecedorId = req.FornecedorId,
            NumeroDocumento = req.NumeroDocumento?.Trim(),
            Observacao = req.Observacao?.Trim(),
            UsuarioId = usuarioId
        };

        foreach (var item in req.Itens)
        {
            var produto = produtos[item.ProdutoId];
            var custo = item.CustoUnitario ?? produto.PrecoCusto;
            if (custo < 0) throw new RegraNegocioException("Custo não pode ser negativo.");

            switch (req.Tipo)
            {
                case TipoMovimentacao.Entrada:
                {
                    var destino = await ObterSaldoAsync(produto.Id, req.DepositoDestinoId!.Value, ct);
                    var totalAntes = await db.Saldos.Where(s => s.ProdutoId == produto.Id).SumAsync(s => s.Quantidade, ct);
                    destino.Entrar(item.Quantidade);
                    // Custo médio ponderado
                    if (item.CustoUnitario is not null && totalAntes + item.Quantidade > 0)
                        produto.PrecoCusto = Math.Round((produto.PrecoCusto * Math.Max(0, totalAntes) + custo * item.Quantidade) / (Math.Max(0, totalAntes) + item.Quantidade), 2);
                    mov.Itens.Add(new ItemMovimentacao { ProdutoId = produto.Id, Quantidade = item.Quantidade, CustoUnitario = custo });
                    break;
                }
                case TipoMovimentacao.Saida:
                {
                    var origem = await ObterSaldoAsync(produto.Id, req.DepositoOrigemId!.Value, ct);
                    origem.Retirar(item.Quantidade, produto.Nome);
                    mov.Itens.Add(new ItemMovimentacao { ProdutoId = produto.Id, Quantidade = -item.Quantidade, CustoUnitario = custo });
                    break;
                }
                case TipoMovimentacao.Transferencia:
                {
                    var origem = await ObterSaldoAsync(produto.Id, req.DepositoOrigemId!.Value, ct);
                    var destino = await ObterSaldoAsync(produto.Id, req.DepositoDestinoId!.Value, ct);
                    origem.Retirar(item.Quantidade, produto.Nome);
                    destino.Entrar(item.Quantidade);
                    mov.Itens.Add(new ItemMovimentacao { ProdutoId = produto.Id, Quantidade = item.Quantidade, CustoUnitario = custo });
                    break;
                }
                case TipoMovimentacao.Ajuste:
                {
                    var saldo = await ObterSaldoAsync(produto.Id, req.DepositoOrigemId!.Value, ct);
                    var diferenca = saldo.AjustarPara(item.Quantidade);
                    if (diferenca != 0)
                        mov.Itens.Add(new ItemMovimentacao { ProdutoId = produto.Id, Quantidade = diferenca, CustoUnitario = custo });
                    break;
                }
            }
        }

        if (mov.Itens.Count == 0) throw new RegraNegocioException("A contagem é igual ao saldo atual; nada a ajustar.");

        db.Movimentacoes.Add(mov);

        if (req.Tipo == TipoMovimentacao.Entrada && req.GerarContaAPagar)
        {
            var hoje = calendario.Hoje;
            db.Lancamentos.Add(new LancamentoFinanceiro
            {
                Tipo = TipoLancamento.Despesa,
                Categoria = CategoriaLancamento.CompraMercadoria,
                Descricao = $"Compra de mercadoria{(string.IsNullOrWhiteSpace(req.NumeroDocumento) ? "" : $" - NF {req.NumeroDocumento}")}",
                Valor = mov.ValorTotal,
                Competencia = new DateOnly(hoje.Year, hoje.Month, 1),
                Vencimento = req.VencimentoContaAPagar ?? hoje.AddDays(30),
                FornecedorId = req.FornecedorId
            });
        }

        await db.SaveChangesAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.EstoqueAlterado,
            $"{DescreverTipo(req.Tipo)} registrada ({mov.Itens.Count} item(ns))", mov.ValorTotal, calendario.AgoraUtc), ct);

        var salvo = await db.Movimentacoes.AsNoTracking()
            .Include(m => m.Itens).ThenInclude(i => i.Produto)
            .Include(m => m.DepositoOrigem).Include(m => m.DepositoDestino)
            .Include(m => m.Fornecedor).Include(m => m.Usuario)
            .FirstAsync(m => m.Id == mov.Id, ct);
        return salvo.ToDto();
    }

    public static string DescreverTipo(TipoMovimentacao tipo) => tipo switch
    {
        TipoMovimentacao.Entrada => "Entrada",
        TipoMovimentacao.Saida => "Saída",
        TipoMovimentacao.Transferencia => "Transferência",
        TipoMovimentacao.Ajuste => "Ajuste de inventário",
        TipoMovimentacao.Venda => "Venda",
        TipoMovimentacao.CancelamentoVenda => "Cancelamento de venda",
        _ => tipo.ToString()
    };
}
