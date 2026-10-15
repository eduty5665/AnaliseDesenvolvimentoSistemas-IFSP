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
            q = q.Where(s => EF.Functions.Like(s.Produto!.Nome.ToLower(), padrao) || EF.Functions.Like(s.Produto.Sku.ToLower(), padrao) || s.Produto.CodigoBarras == termo);
        }

        var linhas = await q
            .Select(s => new
            {
                s.ProdutoId, s.Produto!.Sku, Produto = s.Produto.Nome, Categoria = s.Produto.Categoria!.Nome,
                s.DepositoId, Deposito = s.Deposito!.Nome, s.Quantidade, s.Reservado, s.Produto.EstoqueMinimo, s.Produto.PrecoCusto,
                s.Produto.PrecoVenda, s.Localizacao
            })
            .ToListAsync(ct);

        return linhas
            .Select(l => new SaldoDto(l.ProdutoId, l.Sku, l.Produto, l.Categoria, l.DepositoId, l.Deposito, l.Quantidade, l.Reservado,
                l.Quantidade - l.Reservado, l.EstoqueMinimo, l.Quantidade - l.Reservado < l.EstoqueMinimo, l.PrecoCusto, l.PrecoVenda, l.Localizacao))
            .Where(s => !somenteAbaixoMinimo || s.AbaixoMinimo)
            .OrderBy(s => s.Produto).ThenBy(s => s.Deposito)
            .ToList();
    }

    /// <summary>Define o endereço (corredor-prateleira-nível) do produto no depósito.</summary>
    public async Task DefinirLocalizacaoAsync(int produtoId, int depositoId, string? localizacao, CancellationToken ct = default)
    {
        if (!await db.Produtos.AnyAsync(p => p.Id == produtoId, ct) || !await db.Depositos.AnyAsync(d => d.Id == depositoId, ct))
            throw new NaoEncontradoException("Produto ou depósito não encontrado.");
        var saldo = await ObterSaldoAsync(produtoId, depositoId, ct);
        var valor = string.IsNullOrWhiteSpace(localizacao) ? null : localizacao.Trim().ToUpperInvariant();
        if (valor is { Length: > 20 }) throw new RegraNegocioException("Endereço muito longo (máx. 20 caracteres).");
        saldo.Localizacao = valor;
        await db.SaveChangesAsync(ct);
    }

    private static IQueryable<Movimentacao> ComDetalhes(IQueryable<Movimentacao> q) => q
        .Include(m => m.Itens).ThenInclude(i => i.Produto)
        .Include(m => m.DepositoOrigem).Include(m => m.DepositoDestino)
        .Include(m => m.Fornecedor).Include(m => m.Usuario)
        .AsSplitQuery();

    public async Task<MovimentacaoDto?> ObterAsync(int id, CancellationToken ct = default) =>
        (await ComDetalhes(db.Movimentacoes.AsNoTracking()).FirstOrDefaultAsync(m => m.Id == id, ct))?.ToDto();

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
        var itens = await ComDetalhes(q.OrderByDescending(m => m.Data).ThenByDescending(m => m.Id)
            .Skip((pagina - 1) * tamanho).Take(tamanho)).ToListAsync(ct);
        return new PaginaDto<MovimentacaoDto>(itens.Select(m => m.ToDto()).ToList(), total, pagina, tamanho);
    }

    /// <summary>
    /// Entrada de nota fiscal, saída avulsa com motivo, transferência direta ou ajuste de inventário.
    /// (Transferências do dia a dia passam pela Ordem de Separação — ver <see cref="OrdemSeparacaoService"/>.)
    /// </summary>
    public async Task<MovimentacaoDto> RegistrarAsync(MovimentacaoRequest req, int? usuarioId, CancellationToken ct = default)
    {
        if (req.Itens is null || req.Itens.Count == 0) throw new RegraNegocioException("Informe ao menos um item.");
        if (req.Itens.GroupBy(i => i.ProdutoId).Any(g => g.Count() > 1))
            throw new RegraNegocioException("Há produtos repetidos na lista. Some as quantidades em uma única linha.");

        switch (req.Tipo)
        {
            case TipoMovimentacao.Entrada when req.DepositoDestinoId is null:
                throw new RegraNegocioException("Entrada exige o depósito de destino.");
            case TipoMovimentacao.Entrada when req.FornecedorId is null:
                throw new RegraNegocioException("Informe o fornecedor da nota fiscal.");
            case TipoMovimentacao.Entrada when string.IsNullOrWhiteSpace(req.NumeroDocumento):
                throw new RegraNegocioException("Informe o número da nota fiscal.");
            case TipoMovimentacao.Saida or TipoMovimentacao.Ajuste when req.DepositoOrigemId is null:
                throw new RegraNegocioException("Informe o depósito.");
            case TipoMovimentacao.Saida when req.Motivo is null:
                throw new RegraNegocioException("Informe o motivo da saída (quebra, degustação, brinde...).");
            case TipoMovimentacao.Saida when req.Motivo == MotivoSaida.Outro && string.IsNullOrWhiteSpace(req.Observacao):
                throw new RegraNegocioException("Descreva o motivo na observação.");
            case TipoMovimentacao.Transferencia when req.DepositoOrigemId is null || req.DepositoDestinoId is null:
                throw new RegraNegocioException("Transferência exige depósito de origem e de destino.");
            case TipoMovimentacao.Transferencia when req.DepositoOrigemId == req.DepositoDestinoId:
                throw new RegraNegocioException("Origem e destino devem ser diferentes.");
            case TipoMovimentacao.Venda or TipoMovimentacao.CancelamentoVenda or TipoMovimentacao.RecebimentoTransferencia:
                throw new RegraNegocioException("Este tipo de movimentação é gerado automaticamente pelo sistema.");
        }

        if (req.ValorFrete < 0 || req.ValorOutrasDespesas < 0) throw new RegraNegocioException("Frete e despesas não podem ser negativos.");
        var chave = Documentos.SomenteDigitos(req.ChaveAcesso);
        if (chave.Length is not (0 or 44)) throw new RegraNegocioException("A chave de acesso da NF-e deve ter 44 dígitos.");
        if (req.NumeroParcelas is < 1 or > 12) throw new RegraNegocioException("Parcelas: de 1 a 12.");

        var depositoIds = new[] { req.DepositoOrigemId, req.DepositoDestinoId }.Where(i => i is not null).Select(i => i!.Value).ToList();
        var depositosValidos = await db.Depositos.CountAsync(d => depositoIds.Contains(d.Id) && d.Ativo, ct);
        if (depositosValidos != depositoIds.Distinct().Count()) throw new RegraNegocioException("Depósito inválido ou inativo.");

        Fornecedor? fornecedor = null;
        if (req.FornecedorId is not null)
            fornecedor = await db.Fornecedores.FirstOrDefaultAsync(f => f.Id == req.FornecedorId, ct)
                         ?? throw new RegraNegocioException("Fornecedor não encontrado.");

        var serie = string.IsNullOrWhiteSpace(req.Serie) ? "1" : req.Serie.Trim();
        if (req.Tipo == TipoMovimentacao.Entrada)
        {
            var numero = req.NumeroDocumento!.Trim();
            if (await db.Movimentacoes.AnyAsync(m => m.Tipo == TipoMovimentacao.Entrada && m.FornecedorId == req.FornecedorId &&
                                                     m.NumeroDocumento == numero && m.Serie == serie, ct))
                throw new RegraNegocioException($"A NF {numero}/{serie} deste fornecedor já foi lançada.");
        }

        var produtoIds = req.Itens.Select(i => i.ProdutoId).ToList();
        var produtos = await db.Produtos.Where(p => produtoIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, ct);
        if (produtos.Count != produtoIds.Count) throw new RegraNegocioException("Um ou mais produtos não foram encontrados.");

        var mov = new Movimentacao
        {
            Tipo = req.Tipo,
            Data = calendario.AgoraUtc,
            DepositoOrigemId = req.Tipo == TipoMovimentacao.Entrada ? null : req.DepositoOrigemId,
            DepositoDestinoId = req.Tipo is TipoMovimentacao.Saida or TipoMovimentacao.Ajuste ? null : req.DepositoDestinoId,
            FornecedorId = req.Tipo == TipoMovimentacao.Entrada ? req.FornecedorId : null,
            NumeroDocumento = req.NumeroDocumento?.Trim(),
            Observacao = req.Observacao?.Trim(),
            UsuarioId = usuarioId,
            Motivo = req.Tipo == TipoMovimentacao.Saida ? req.Motivo : null
        };
        if (req.Tipo == TipoMovimentacao.Entrada)
        {
            mov.Serie = serie;
            mov.ChaveAcesso = chave.Length == 44 ? chave : null;
            mov.DataEmissao = req.DataEmissao ?? calendario.Hoje;
            mov.ValorFrete = req.ValorFrete;
            mov.ValorOutrasDespesas = req.ValorOutrasDespesas;
        }

        // Frete e despesas são rateados no custo proporcionalmente ao valor de cada item
        var valorProdutosNf = req.Tipo == TipoMovimentacao.Entrada
            ? req.Itens.Sum(i => (i.CustoUnitario ?? produtos[i.ProdutoId].PrecoCusto) * i.Quantidade)
            : 0;
        var acrescimos = req.ValorFrete + req.ValorOutrasDespesas;

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
                    var totalAntes = Math.Max(0, await db.Saldos.Where(s => s.ProdutoId == produto.Id).SumAsync(s => s.Quantidade, ct));
                    destino.Entrar(item.Quantidade);
                    var custoComRateio = valorProdutosNf > 0 ? custo + custo / valorProdutosNf * acrescimos : custo;
                    // Custo médio ponderado (com frete rateado)
                    produto.PrecoCusto = Math.Round((produto.PrecoCusto * totalAntes + custoComRateio * item.Quantidade) / (totalAntes + item.Quantidade), 2);
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
            // Duplicatas: divide o total da nota em parcelas (a última absorve o arredondamento)
            var hoje = calendario.Hoje;
            var primeiro = req.VencimentoContaAPagar ?? hoje.AddDays(30);
            var intervalo = Math.Clamp(req.IntervaloParcelasDias, 1, 90);
            var parcela = Math.Round(mov.ValorTotal / req.NumeroParcelas, 2);
            for (var n = 1; n <= req.NumeroParcelas; n++)
            {
                db.Lancamentos.Add(new LancamentoFinanceiro
                {
                    Tipo = TipoLancamento.Despesa,
                    Categoria = CategoriaLancamento.CompraMercadoria,
                    Descricao = $"NF {mov.NumeroDocumento}/{mov.Serie} - {fornecedor!.NomeFantasia ?? fornecedor.RazaoSocial}" +
                                (req.NumeroParcelas > 1 ? $" ({n}/{req.NumeroParcelas})" : ""),
                    Valor = n == req.NumeroParcelas ? mov.ValorTotal - parcela * (req.NumeroParcelas - 1) : parcela,
                    Competencia = new DateOnly(hoje.Year, hoje.Month, 1),
                    Vencimento = primeiro.AddDays(intervalo * (n - 1)),
                    FornecedorId = req.FornecedorId
                });
            }
        }

        await db.SaveChangesAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.EstoqueAlterado,
            $"{DescreverTipo(req.Tipo)} registrada ({mov.Itens.Count} item(ns))", mov.ValorTotal, calendario.AgoraUtc), ct);

        return (await ObterAsync(mov.Id, ct))!;
    }

    public static string DescreverTipo(TipoMovimentacao tipo) => tipo switch
    {
        TipoMovimentacao.Entrada => "Entrada",
        TipoMovimentacao.Saida => "Saída",
        TipoMovimentacao.Transferencia => "Transferência",
        TipoMovimentacao.Ajuste => "Ajuste de inventário",
        TipoMovimentacao.Venda => "Venda",
        TipoMovimentacao.CancelamentoVenda => "Cancelamento de venda",
        TipoMovimentacao.RecebimentoTransferencia => "Recebimento de transferência",
        _ => tipo.ToString()
    };

    public static string DescreverMotivo(MotivoSaida motivo) => motivo switch
    {
        MotivoSaida.Quebra => "Quebra",
        MotivoSaida.Avaria => "Avaria",
        MotivoSaida.Vencimento => "Vencimento",
        MotivoSaida.Degustacao => "Degustação",
        MotivoSaida.Brinde => "Brinde",
        MotivoSaida.UsoInterno => "Uso interno",
        MotivoSaida.DevolucaoFornecedor => "Devolução ao fornecedor",
        _ => "Outro"
    };
}
