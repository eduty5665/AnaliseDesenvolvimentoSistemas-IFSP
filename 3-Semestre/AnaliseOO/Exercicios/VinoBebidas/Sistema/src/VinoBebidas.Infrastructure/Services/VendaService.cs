using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>Frente de caixa (PDV). Cada venda baixa estoque, gera kardex e lança a receita no financeiro.</summary>
public class VendaService(AppDbContext db, EstoqueService estoque, Calendario calendario, INotificadorPainel notificador)
{
    public async Task<VendaDto> RegistrarAsync(VendaRequest req, int? usuarioId, CancellationToken ct = default)
    {
        if (req.Itens is null || req.Itens.Count == 0) throw new RegraNegocioException("A venda não tem itens.");

        var deposito = await db.Depositos.FirstOrDefaultAsync(d => d.Id == req.DepositoId && d.Ativo, ct)
                       ?? throw new RegraNegocioException("Depósito/loja inválido.");

        if (req.ClienteId is not null && !await db.Clientes.AnyAsync(c => c.Id == req.ClienteId && c.Ativo, ct))
            throw new RegraNegocioException("Cliente não encontrado.");

        var produtoIds = req.Itens.Select(i => i.ProdutoId).Distinct().ToList();
        var produtos = await db.Produtos.Where(p => produtoIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, ct);

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var venda = new Venda
        {
            Data = calendario.AgoraUtc,
            Canal = req.Canal,
            ClienteId = req.ClienteId,
            UsuarioId = usuarioId,
            DepositoId = deposito.Id,
            Desconto = req.Desconto
        };

        // Agrupa o mesmo produto lido várias vezes no leitor de código de barras
        foreach (var grupo in req.Itens.GroupBy(i => i.ProdutoId))
        {
            if (!produtos.TryGetValue(grupo.Key, out var produto) || !produto.Ativo)
                throw new RegraNegocioException($"Produto #{grupo.Key} não encontrado ou inativo.");
            var quantidade = grupo.Sum(i => i.Quantidade);
            venda.Itens.Add(new ItemVenda
            {
                ProdutoId = produto.Id,
                Produto = produto,
                Quantidade = quantidade,
                PrecoUnitario = produto.PrecoAtual,
                CustoUnitario = produto.PrecoCusto,
                Desconto = grupo.Sum(i => i.Desconto)
            });
            var saldo = await estoque.ObterSaldoAsync(produto.Id, deposito.Id, ct);
            saldo.Retirar(quantidade, produto.Nome);
        }

        venda.CalcularTotais();
        venda.Pagamentos = req.Pagamentos.Select(p => new PagamentoVenda { Forma = p.Forma, Valor = p.Valor }).ToList();
        venda.ValidarPagamentos();

        db.Vendas.Add(venda);
        await db.SaveChangesAsync(ct);

        RegistrarKardexEReceita(venda, usuarioId, TipoMovimentacao.Venda);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.VendaRegistrada,
            $"Venda {Mapeamentos.NumeroVenda(venda.Id)} ({DescreverCanal(venda.Canal)})", venda.Total, venda.Data), ct);

        return (await ObterAsync(venda.Id, ct))!;
    }

    /// <summary>Gera a movimentação de estoque (kardex) e o lançamento de receita da venda. Não salva.</summary>
    internal void RegistrarKardexEReceita(Venda venda, int? usuarioId, TipoMovimentacao tipo)
    {
        db.Movimentacoes.Add(new Movimentacao
        {
            Tipo = tipo,
            Data = venda.Data,
            DepositoOrigemId = venda.DepositoId,
            UsuarioId = usuarioId,
            VendaId = venda.Id,
            NumeroDocumento = Mapeamentos.NumeroVenda(venda.Id),
            Itens = venda.Itens.Select(i => new ItemMovimentacao { ProdutoId = i.ProdutoId, Quantidade = -i.Quantidade, CustoUnitario = i.CustoUnitario }).ToList()
        });

        var dia = calendario.DataLocal(venda.Data);
        db.Lancamentos.Add(new LancamentoFinanceiro
        {
            Tipo = TipoLancamento.Receita,
            Categoria = CategoriaLancamento.Venda,
            Descricao = $"Venda {Mapeamentos.NumeroVenda(venda.Id)} ({DescreverCanal(venda.Canal)})",
            Valor = venda.Total,
            Competencia = new DateOnly(dia.Year, dia.Month, 1),
            Vencimento = dia,
            DataPagamento = dia,
            Status = StatusLancamento.Pago,
            VendaId = venda.Id
        });
    }

    public async Task<VendaDto> CancelarAsync(int id, string motivo, int? usuarioId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(motivo)) throw new RegraNegocioException("Informe o motivo do cancelamento.");
        var venda = await db.Vendas.Include(v => v.Itens).FirstOrDefaultAsync(v => v.Id == id, ct)
                    ?? throw new NaoEncontradoException("Venda não encontrada.");
        if (venda.Status == StatusVenda.Cancelada) throw new RegraNegocioException("Venda já cancelada.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);

        foreach (var item in venda.Itens)
        {
            var saldo = await estoque.ObterSaldoAsync(item.ProdutoId, venda.DepositoId, ct);
            saldo.Entrar(item.Quantidade);
        }

        venda.Status = StatusVenda.Cancelada;
        venda.MotivoCancelamento = motivo.Trim();
        venda.CanceladaEm = calendario.AgoraUtc;

        db.Movimentacoes.Add(new Movimentacao
        {
            Tipo = TipoMovimentacao.CancelamentoVenda,
            Data = calendario.AgoraUtc,
            DepositoDestinoId = venda.DepositoId,
            UsuarioId = usuarioId,
            VendaId = venda.Id,
            NumeroDocumento = Mapeamentos.NumeroVenda(venda.Id),
            Observacao = motivo.Trim(),
            Itens = venda.Itens.Select(i => new ItemMovimentacao { ProdutoId = i.ProdutoId, Quantidade = i.Quantidade, CustoUnitario = i.CustoUnitario }).ToList()
        });

        var receitas = await db.Lancamentos.Where(l => l.VendaId == venda.Id && l.Status != StatusLancamento.Cancelado).ToListAsync(ct);
        foreach (var l in receitas)
        {
            // Estorno: receita de venda cancelada deixa de contar
            l.Status = StatusLancamento.Cancelado;
            l.Observacao = $"Estornada: {motivo.Trim()}";
        }

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.VendaCancelada,
            $"Venda {Mapeamentos.NumeroVenda(venda.Id)} cancelada", -venda.Total, calendario.AgoraUtc), ct);

        return (await ObterAsync(venda.Id, ct))!;
    }

    public async Task<VendaDto?> ObterAsync(int id, CancellationToken ct = default)
    {
        var venda = await db.Vendas.AsNoTracking()
            .Include(v => v.Itens).ThenInclude(i => i.Produto)
            .Include(v => v.Pagamentos)
            .Include(v => v.Cliente).Include(v => v.Usuario).Include(v => v.Deposito)
            .AsSplitQuery()
            .FirstOrDefaultAsync(v => v.Id == id, ct);
        return venda?.ToDto();
    }

    public async Task<PaginaDto<VendaResumoDto>> ListarAsync(DateOnly? de, DateOnly? ate, CanalVenda? canal, StatusVenda? status,
        int? clienteId, int pagina, int tamanho, CancellationToken ct = default)
    {
        var q = db.Vendas.AsNoTracking().AsQueryable();
        if (de is not null) { var ini = calendario.InicioDoDiaUtc(de.Value); q = q.Where(v => v.Data >= ini); }
        if (ate is not null) { var fim = calendario.InicioDoDiaUtc(ate.Value.AddDays(1)); q = q.Where(v => v.Data < fim); }
        if (canal is not null) q = q.Where(v => v.Canal == canal);
        if (status is not null) q = q.Where(v => v.Status == status);
        if (clienteId is not null) q = q.Where(v => v.ClienteId == clienteId);

        pagina = Math.Max(1, pagina);
        tamanho = Math.Clamp(tamanho, 1, 200);
        var total = await q.CountAsync(ct);
        var linhas = await q.OrderByDescending(v => v.Data).ThenByDescending(v => v.Id)
            .Skip((pagina - 1) * tamanho).Take(tamanho)
            .Select(v => new { v.Id, v.Data, v.Canal, v.Status, Cliente = v.Cliente!.Nome, Itens = v.Itens.Sum(i => i.Quantidade), v.Total })
            .ToListAsync(ct);
        var itens = linhas.Select(v => new VendaResumoDto(v.Id, Mapeamentos.NumeroVenda(v.Id), v.Data, v.Canal, v.Status, v.Cliente, v.Itens, v.Total)).ToList();
        return new PaginaDto<VendaResumoDto>(itens, total, pagina, tamanho);
    }

    public static string DescreverCanal(CanalVenda canal) => canal switch
    {
        CanalVenda.Loja => "Loja",
        CanalVenda.Online => "Online",
        CanalVenda.Consultor => "Consultor",
        _ => canal.ToString()
    };
}
