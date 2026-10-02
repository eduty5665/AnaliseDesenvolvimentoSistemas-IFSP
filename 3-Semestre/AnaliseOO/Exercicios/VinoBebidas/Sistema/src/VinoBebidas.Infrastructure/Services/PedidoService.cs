using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>
/// Pedidos da loja online. Ao criar, o estoque fica reservado (não aparece como disponível para o PDV).
/// Ao concluir (retirado/entregue) a reserva vira venda com canal Online.
/// </summary>
public class PedidoService(AppDbContext db, EstoqueService estoque, VendaService vendas, Calendario calendario, INotificadorPainel notificador)
{
    public const decimal TaxaEntregaPadrao = 15m;
    public const decimal FreteGratisAcimaDe = 300m;

    public CotacaoEntregaDto CotarEntrega(decimal subtotal, string? cep)
    {
        var taxa = subtotal >= FreteGratisAcimaDe ? 0 : TaxaEntregaPadrao;
        return new CotacaoEntregaDto(taxa, 1,
            taxa == 0 ? $"Frete grátis para compras acima de R$ {FreteGratisAcimaDe:N0}" : "Entrega em até 1 dia útil na região");
    }

    public async Task<PedidoDto> CriarAsync(int clienteId, CriarPedidoRequest req, CancellationToken ct = default)
    {
        var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Id == clienteId && c.Ativo, ct)
                      ?? throw new NaoEncontradoException("Cliente não encontrado.");
        Cliente.ValidarMaioridade(cliente.DataNascimento, calendario.Hoje);

        if (req.Itens is null || req.Itens.Count == 0) throw new RegraNegocioException("O carrinho está vazio.");
        if (req.Itens.Any(i => i.Quantidade <= 0 || i.Quantidade > 48)) throw new RegraNegocioException("Quantidade inválida (1 a 48 por item).");
        if (req.Tipo == TipoPedido.Reserva && req.Modalidade == ModalidadeEntrega.Entrega)
            throw new RegraNegocioException("Reservas são somente para retirada na loja.");

        Deposito deposito;
        string? endereco = null;
        if (req.Modalidade == ModalidadeEntrega.Retirada)
        {
            deposito = await db.Depositos.FirstOrDefaultAsync(d => d.Ativo && d.PermiteRetirada &&
                           (req.DepositoRetiradaId == null || d.Id == req.DepositoRetiradaId), ct)
                       ?? throw new RegraNegocioException("Loja de retirada inválida.");
        }
        else
        {
            if (req.EnderecoEntrega is null || string.IsNullOrWhiteSpace(req.EnderecoEntrega.Logradouro) ||
                string.IsNullOrWhiteSpace(req.EnderecoEntrega.Cidade))
                throw new RegraNegocioException("Informe o endereço de entrega.");
            deposito = await db.Depositos.FirstOrDefaultAsync(d => d.Ativo && d.AtendeOnline, ct)
                       ?? throw new RegraNegocioException("Nenhum depósito atende entregas no momento.");
            endereco = req.EnderecoEntrega.ToEntity().ToString();
        }

        var produtoIds = req.Itens.Select(i => i.ProdutoId).Distinct().ToList();
        var produtos = await db.Produtos.Where(p => produtoIds.Contains(p.Id) && p.Ativo && p.VisivelLoja)
            .ToDictionaryAsync(p => p.Id, ct);

        var pedido = new Pedido
        {
            ClienteId = cliente.Id,
            Tipo = req.Tipo,
            Modalidade = req.Modalidade,
            FormaPagamento = req.Tipo == TipoPedido.Reserva ? FormaPagamento.PagamentoNaEntrega : req.FormaPagamento,
            DepositoId = deposito.Id,
            EnderecoEntrega = endereco,
            Observacao = req.Observacao?.Trim(),
            CriadoEm = calendario.AgoraUtc
        };

        foreach (var grupo in req.Itens.GroupBy(i => i.ProdutoId))
        {
            if (!produtos.TryGetValue(grupo.Key, out var produto))
                throw new RegraNegocioException($"Produto #{grupo.Key} indisponível na loja online.");
            var qtd = grupo.Sum(i => i.Quantidade);
            var saldo = await estoque.ObterSaldoAsync(produto.Id, deposito.Id, ct);
            saldo.Reservar(qtd, produto.Nome);
            pedido.Itens.Add(new ItemPedido { ProdutoId = produto.Id, Quantidade = qtd, PrecoUnitario = produto.PrecoAtual });
        }

        pedido.CalcularTotais();
        if (req.Modalidade == ModalidadeEntrega.Entrega)
        {
            pedido.TaxaEntrega = CotarEntrega(pedido.Subtotal, req.EnderecoEntrega?.Cep).Taxa;
            pedido.CalcularTotais();
        }

        // Pagamento online simulado como aprovado; integre um gateway (Pix/cartão) aqui.
        pedido.Status = StatusPedido.Confirmado;
        if (req.Tipo == TipoPedido.Reserva) pedido.ValidoAte = calendario.AgoraUtc.AddDays(Pedido.DiasValidadeReserva);

        db.Pedidos.Add(pedido);
        await db.SaveChangesAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.PedidoCriado,
            $"Novo pedido {Mapeamentos.NumeroPedido(pedido.Id)} ({(pedido.Tipo == TipoPedido.Reserva ? "reserva" : "compra")}) de {cliente.Nome}",
            pedido.Total, calendario.AgoraUtc), ct);

        return (await ObterAsync(pedido.Id, ct))!;
    }

    public async Task<PedidoDto> AlterarStatusAsync(int id, StatusPedido novo, int? usuarioId, CancellationToken ct = default)
    {
        var pedido = await db.Pedidos.Include(p => p.Itens).ThenInclude(i => i.Produto)
                         .FirstOrDefaultAsync(p => p.Id == id, ct)
                     ?? throw new NaoEncontradoException("Pedido não encontrado.");

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        pedido.AlterarStatus(novo);

        if (novo is StatusPedido.Cancelado or StatusPedido.Expirado)
        {
            foreach (var item in pedido.Itens)
                (await estoque.ObterSaldoAsync(item.ProdutoId, pedido.DepositoId, ct)).LiberarReserva(item.Quantidade);
        }
        else if (novo == StatusPedido.Concluido)
        {
            var venda = new Venda
            {
                Data = calendario.AgoraUtc,
                Canal = CanalVenda.Online,
                ClienteId = pedido.ClienteId,
                UsuarioId = usuarioId,
                DepositoId = pedido.DepositoId,
                PedidoId = pedido.Id,
                Itens = pedido.Itens.Select(i => new ItemVenda
                {
                    ProdutoId = i.ProdutoId,
                    Quantidade = i.Quantidade,
                    PrecoUnitario = i.PrecoUnitario,
                    CustoUnitario = i.Produto?.PrecoCusto ?? 0
                }).ToList()
            };
            venda.CalcularTotais();
            // Taxa de entrega entra como receita da venda
            venda.Total += pedido.TaxaEntrega;
            venda.Pagamentos.Add(new PagamentoVenda { Forma = pedido.FormaPagamento, Valor = venda.Total });

            foreach (var item in pedido.Itens)
                (await estoque.ObterSaldoAsync(item.ProdutoId, pedido.DepositoId, ct)).BaixarReserva(item.Quantidade);

            db.Vendas.Add(venda);
            await db.SaveChangesAsync(ct);
            vendas.RegistrarKardexEReceita(venda, usuarioId, TipoMovimentacao.Venda);
            pedido.VendaId = venda.Id;
        }

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(
            novo == StatusPedido.Concluido ? EventosPainel.VendaRegistrada : EventosPainel.PedidoAtualizado,
            $"Pedido {Mapeamentos.NumeroPedido(pedido.Id)}: {DescreverStatus(novo)}",
            novo == StatusPedido.Concluido ? pedido.Total : null, calendario.AgoraUtc), ct);

        return (await ObterAsync(pedido.Id, ct))!;
    }

    public async Task<PedidoDto> CancelarPeloClienteAsync(int clienteId, int pedidoId, CancellationToken ct = default)
    {
        var pedido = await db.Pedidos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == pedidoId && p.ClienteId == clienteId, ct)
                     ?? throw new NaoEncontradoException("Pedido não encontrado.");
        if (pedido.Status is not (StatusPedido.Pendente or StatusPedido.Confirmado))
            throw new RegraNegocioException("O pedido já está em preparação; fale com a loja para cancelar.");
        return await AlterarStatusAsync(pedidoId, StatusPedido.Cancelado, null, ct);
    }

    /// <summary>Expira reservas vencidas e devolve o estoque (executado periodicamente pela API).</summary>
    public async Task<int> ExpirarReservasAsync(CancellationToken ct = default)
    {
        var agora = calendario.AgoraUtc;
        var ids = await db.Pedidos
            .Where(p => p.Tipo == TipoPedido.Reserva && p.ValidoAte != null && p.ValidoAte < agora &&
                        (p.Status == StatusPedido.Pendente || p.Status == StatusPedido.Confirmado || p.Status == StatusPedido.ProntoParaRetirada))
            .Select(p => p.Id).ToListAsync(ct);
        foreach (var id in ids)
            await AlterarStatusAsync(id, StatusPedido.Expirado, null, ct);
        return ids.Count;
    }

    public async Task<PedidoDto?> ObterAsync(int id, CancellationToken ct = default)
    {
        var p = await db.Pedidos.AsNoTracking()
            .Include(x => x.Itens).ThenInclude(i => i.Produto)
            .Include(x => x.Cliente).Include(x => x.Deposito)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return p?.ToDto();
    }

    public async Task<IReadOnlyList<PedidoDto>> ListarAsync(StatusPedido? status, bool somenteAbertos, int? clienteId, int limite, CancellationToken ct = default)
    {
        var q = db.Pedidos.AsNoTracking().AsQueryable();
        if (status is not null) q = q.Where(p => p.Status == status);
        if (somenteAbertos)
            q = q.Where(p => p.Status != StatusPedido.Concluido && p.Status != StatusPedido.Cancelado && p.Status != StatusPedido.Expirado);
        if (clienteId is not null) q = q.Where(p => p.ClienteId == clienteId);
        var lista = await q.OrderByDescending(p => p.CriadoEm).Take(Math.Clamp(limite, 1, 500))
            .Include(x => x.Itens).ThenInclude(i => i.Produto)
            .Include(x => x.Cliente).Include(x => x.Deposito)
            .AsSplitQuery()
            .ToListAsync(ct);
        return lista.Select(p => p.ToDto()).ToList();
    }

    public static string DescreverStatus(StatusPedido s) => s switch
    {
        StatusPedido.Pendente => "pendente",
        StatusPedido.Confirmado => "confirmado",
        StatusPedido.EmSeparacao => "em separação",
        StatusPedido.ProntoParaRetirada => "pronto para retirada",
        StatusPedido.EmRota => "saiu para entrega",
        StatusPedido.Concluido => "concluído",
        StatusPedido.Cancelado => "cancelado",
        StatusPedido.Expirado => "reserva expirada",
        _ => s.ToString()
    };
}
