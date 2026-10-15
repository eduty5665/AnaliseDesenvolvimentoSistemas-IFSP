using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

/// <summary>
/// Ordens de Separação (picking).
/// Pedido online: a ordem é emitida ao clicar em "Separar" e encerra quando o pedido é retirado/entregue.
/// Transferência: emitir (reserva na origem) → separar e conferir → expedir (sai da origem, fica em trânsito)
/// → receber no destino (entra no estoque; divergências ficam registradas).
/// </summary>
public class OrdemSeparacaoService(AppDbContext db, EstoqueService estoque, Calendario calendario, INotificadorPainel notificador)
{
    private IQueryable<OrdemSeparacao> ComDetalhes(IQueryable<OrdemSeparacao> q) => q
        .Include(o => o.Itens).ThenInclude(i => i.Produto)
        .Include(o => o.DepositoOrigem).Include(o => o.DepositoDestino)
        .Include(o => o.Solicitante).Include(o => o.Separador)
        .AsSplitQuery();

    public async Task<OrdemSeparacaoDto?> ObterAsync(int id, CancellationToken ct = default)
    {
        var o = await ComDetalhes(db.OrdensSeparacao.AsNoTracking()).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (o is null) return null;
        var pedido = o.PedidoId is null ? null
            : await db.Pedidos.AsNoTracking().Include(p => p.Cliente).FirstOrDefaultAsync(p => p.Id == o.PedidoId, ct);
        return o.ToDto(pedido);
    }

    public async Task<IReadOnlyList<OrdemSeparacaoDto>> ListarAsync(StatusOrdemSeparacao? status, TipoOrdemSeparacao? tipo, bool somenteAbertas,
        int? depositoId, int limite, CancellationToken ct = default)
    {
        var q = db.OrdensSeparacao.AsNoTracking().AsQueryable();
        if (status is not null) q = q.Where(o => o.Status == status);
        if (tipo is not null) q = q.Where(o => o.Tipo == tipo);
        if (somenteAbertas)
            q = q.Where(o => o.Status == StatusOrdemSeparacao.Aberta || o.Status == StatusOrdemSeparacao.Separada || o.Status == StatusOrdemSeparacao.Expedida);
        if (depositoId is not null) q = q.Where(o => o.DepositoOrigemId == depositoId || o.DepositoDestinoId == depositoId);

        var lista = await ComDetalhes(q.OrderByDescending(o => o.CriadoEm).Take(Math.Clamp(limite, 1, 500))).ToListAsync(ct);
        var pedidoIds = lista.Where(o => o.PedidoId != null).Select(o => o.PedidoId!.Value).ToList();
        var pedidos = await db.Pedidos.AsNoTracking().Include(p => p.Cliente).Where(p => pedidoIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, ct);
        return lista.Select(o => o.ToDto(o.PedidoId is null ? null : pedidos.GetValueOrDefault(o.PedidoId.Value))).ToList();
    }

    /// <summary>Monta os itens com o endereço atual de cada produto no depósito de origem.</summary>
    private async Task<List<ItemOrdemSeparacao>> MontarItensAsync(int depositoId, IEnumerable<(int ProdutoId, int Quantidade)> itens, CancellationToken ct)
    {
        var lista = itens.ToList();
        var ids = lista.Select(i => i.ProdutoId).ToList();
        var enderecos = await db.Saldos.AsNoTracking().Where(s => s.DepositoId == depositoId && ids.Contains(s.ProdutoId))
            .ToDictionaryAsync(s => s.ProdutoId, s => s.Localizacao, ct);
        return lista.Select(i => new ItemOrdemSeparacao
        {
            ProdutoId = i.ProdutoId,
            Quantidade = i.Quantidade,
            Localizacao = enderecos.GetValueOrDefault(i.ProdutoId)
        }).ToList();
    }

    /// <summary>Emite a ordem de um pedido online (chamado ao clicar em "Separar"). O estoque já está reservado pelo pedido. Não salva.</summary>
    internal async Task<OrdemSeparacao> EmitirParaPedidoAsync(Pedido pedido, int? usuarioId, CancellationToken ct)
    {
        var ordem = new OrdemSeparacao
        {
            Tipo = TipoOrdemSeparacao.PedidoOnline,
            DepositoOrigemId = pedido.DepositoId,
            PedidoId = pedido.Id,
            SolicitanteId = usuarioId,
            CriadoEm = calendario.AgoraUtc,
            Observacao = pedido.Observacao,
            Itens = await MontarItensAsync(pedido.DepositoId, pedido.Itens.Select(i => (i.ProdutoId, i.Quantidade)), ct)
        };
        db.OrdensSeparacao.Add(ordem);
        return ordem;
    }

    /// <summary>Acompanha o andamento do pedido: pronto/em rota = separada; concluído = encerrada; cancelado = cancelada. Não salva.</summary>
    internal async Task SincronizarComPedidoAsync(Pedido pedido, StatusPedido novo, int? usuarioId, CancellationToken ct)
    {
        if (pedido.OrdemSeparacaoId is null) return;
        var ordem = await db.OrdensSeparacao.Include(o => o.Itens).FirstOrDefaultAsync(o => o.Id == pedido.OrdemSeparacaoId, ct);
        if (ordem is null || !ordem.EstaAberta) return;
        var agora = calendario.AgoraUtc;
        switch (novo)
        {
            case StatusPedido.ProntoParaRetirada or StatusPedido.EmRota when ordem.Status == StatusOrdemSeparacao.Aberta:
                ordem.MarcarSeparada(usuarioId, agora);
                break;
            case StatusPedido.Concluido:
                if (ordem.Status == StatusOrdemSeparacao.Aberta) ordem.MarcarSeparada(usuarioId, agora);
                ordem.MarcarConcluida(agora);
                break;
            case StatusPedido.Cancelado or StatusPedido.Expirado:
                ordem.Cancelar(agora);
                break;
        }
    }

    /// <summary>Solicita transferência: emite a ordem e reserva o estoque na origem para ninguém vender o que vai sair.</summary>
    public async Task<OrdemSeparacaoDto> EmitirTransferenciaAsync(CriarOrdemSeparacaoRequest req, int? usuarioId, CancellationToken ct = default)
    {
        if (req.Itens is null || req.Itens.Count == 0) throw new RegraNegocioException("Informe ao menos um item.");
        if (req.DepositoOrigemId == req.DepositoDestinoId) throw new RegraNegocioException("Origem e destino devem ser diferentes.");
        if (req.Itens.Any(i => i.Quantidade <= 0)) throw new RegraNegocioException("As quantidades devem ser maiores que zero.");
        if (req.Itens.GroupBy(i => i.ProdutoId).Any(g => g.Count() > 1)) throw new RegraNegocioException("Há produtos repetidos na lista.");

        var depositos = await db.Depositos.CountAsync(d => (d.Id == req.DepositoOrigemId || d.Id == req.DepositoDestinoId) && d.Ativo, ct);
        if (depositos != 2) throw new RegraNegocioException("Depósito inválido ou inativo.");

        var ids = req.Itens.Select(i => i.ProdutoId).ToList();
        var produtos = await db.Produtos.Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id, ct);
        if (produtos.Count != ids.Count) throw new RegraNegocioException("Um ou mais produtos não foram encontrados.");

        foreach (var item in req.Itens)
            (await estoque.ObterSaldoAsync(item.ProdutoId, req.DepositoOrigemId, ct)).Reservar(item.Quantidade, produtos[item.ProdutoId].Nome);

        var ordem = new OrdemSeparacao
        {
            Tipo = TipoOrdemSeparacao.Transferencia,
            DepositoOrigemId = req.DepositoOrigemId,
            DepositoDestinoId = req.DepositoDestinoId,
            SolicitanteId = usuarioId,
            CriadoEm = calendario.AgoraUtc,
            Observacao = req.Observacao?.Trim(),
            Itens = await MontarItensAsync(req.DepositoOrigemId, req.Itens.Select(i => (i.ProdutoId, i.Quantidade)), ct)
        };
        db.OrdensSeparacao.Add(ordem);
        await db.SaveChangesAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.EstoqueAlterado,
            $"Ordem de separação {Mapeamentos.NumeroOrdem(ordem.Id)} emitida ({ordem.Itens.Count} item(ns))", null, calendario.AgoraUtc), ct);
        return (await ObterAsync(ordem.Id, ct))!;
    }

    private async Task<OrdemSeparacao> CarregarAsync(int id, CancellationToken ct) =>
        await db.OrdensSeparacao.Include(o => o.Itens).ThenInclude(i => i.Produto).FirstOrDefaultAsync(o => o.Id == id, ct)
        ?? throw new NaoEncontradoException("Ordem de separação não encontrada.");

    /// <summary>Estoquista confere o que separou. Para transferências, o que não foi encontrado tem a reserva liberada.</summary>
    public async Task<OrdemSeparacaoDto> SepararAsync(int id, ConferirOrdemRequest req, int? usuarioId, CancellationToken ct = default)
    {
        var ordem = await CarregarAsync(id, ct);
        if (ordem.Status != StatusOrdemSeparacao.Aberta) throw new RegraNegocioException("Somente ordens em aberto podem ser separadas.");

        var conferido = (req.Itens ?? []).ToDictionary(i => i.ProdutoId, i => i.Quantidade);
        foreach (var item in ordem.Itens)
            item.QuantidadeSeparada = conferido.TryGetValue(item.ProdutoId, out var q) ? q : item.Quantidade;

        if (ordem.Tipo == TipoOrdemSeparacao.PedidoOnline && ordem.Itens.Any(i => i.QuantidadeSeparada != i.Quantidade))
            throw new RegraNegocioException("Pedido de cliente precisa ser separado por completo. Se faltar produto, cancele o pedido e avise o cliente.");

        ordem.MarcarSeparada(usuarioId, calendario.AgoraUtc);
        if (!string.IsNullOrWhiteSpace(req.Observacao)) ordem.Observacao = req.Observacao.Trim();

        if (ordem.Tipo == TipoOrdemSeparacao.Transferencia)
        {
            foreach (var item in ordem.Itens.Where(i => i.QuantidadeSeparada < i.Quantidade))
                (await estoque.ObterSaldoAsync(item.ProdutoId, ordem.DepositoOrigemId, ct)).LiberarReserva(item.Quantidade - item.QuantidadeSeparada!.Value);
        }

        await db.SaveChangesAsync(ct);
        return (await ObterAsync(id, ct))!;
    }

    /// <summary>Mercadoria sai da origem (baixa a reserva) e fica em trânsito até o recebimento.</summary>
    public async Task<OrdemSeparacaoDto> ExpedirAsync(int id, int? usuarioId, CancellationToken ct = default)
    {
        var ordem = await CarregarAsync(id, ct);
        ordem.MarcarExpedida(calendario.AgoraUtc);

        var mov = new Movimentacao
        {
            Tipo = TipoMovimentacao.Transferencia,
            Data = calendario.AgoraUtc,
            DepositoOrigemId = ordem.DepositoOrigemId,
            DepositoDestinoId = ordem.DepositoDestinoId,
            UsuarioId = usuarioId,
            OrdemSeparacaoId = ordem.Id,
            NumeroDocumento = Mapeamentos.NumeroOrdem(ordem.Id),
            Observacao = "Expedição — mercadoria em trânsito"
        };
        foreach (var item in ordem.Itens.Where(i => i.QuantidadeSeparada > 0))
        {
            (await estoque.ObterSaldoAsync(item.ProdutoId, ordem.DepositoOrigemId, ct)).BaixarReserva(item.QuantidadeSeparada!.Value);
            mov.Itens.Add(new ItemMovimentacao { ProdutoId = item.ProdutoId, Quantidade = -item.QuantidadeSeparada.Value, CustoUnitario = item.Produto?.PrecoCusto ?? 0 });
        }
        db.Movimentacoes.Add(mov);
        await db.SaveChangesAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.EstoqueAlterado,
            $"{Mapeamentos.NumeroOrdem(ordem.Id)} expedida — em trânsito", mov.ValorTotal, calendario.AgoraUtc), ct);
        return (await ObterAsync(id, ct))!;
    }

    /// <summary>Destino confere e dá entrada. Quantidade recebida menor que a expedida fica registrada como divergência.</summary>
    public async Task<OrdemSeparacaoDto> ReceberAsync(int id, ConferirOrdemRequest req, int? usuarioId, CancellationToken ct = default)
    {
        var ordem = await CarregarAsync(id, ct);
        if (ordem.Tipo != TipoOrdemSeparacao.Transferencia || ordem.DepositoDestinoId is null)
            throw new RegraNegocioException("Somente transferências têm recebimento.");

        var recebido = (req.Itens ?? []).ToDictionary(i => i.ProdutoId, i => i.Quantidade);
        var divergencias = new List<string>();
        var mov = new Movimentacao
        {
            Tipo = TipoMovimentacao.RecebimentoTransferencia,
            Data = calendario.AgoraUtc,
            DepositoOrigemId = ordem.DepositoOrigemId,
            DepositoDestinoId = ordem.DepositoDestinoId,
            UsuarioId = usuarioId,
            OrdemSeparacaoId = ordem.Id,
            NumeroDocumento = Mapeamentos.NumeroOrdem(ordem.Id)
        };

        foreach (var item in ordem.Itens)
        {
            var expedido = item.QuantidadeSeparada ?? 0;
            var qtd = recebido.TryGetValue(item.ProdutoId, out var q) ? q : expedido;
            if (qtd < 0 || qtd > expedido) throw new RegraNegocioException($"Quantidade recebida de '{item.Produto?.Nome}' deve ficar entre 0 e {expedido}.");
            item.QuantidadeRecebida = qtd;
            if (qtd < expedido) divergencias.Add($"{item.Produto?.Nome}: expedido {expedido}, recebido {qtd}");
            if (qtd == 0) continue;
            (await estoque.ObterSaldoAsync(item.ProdutoId, ordem.DepositoDestinoId.Value, ct)).Entrar(qtd);
            mov.Itens.Add(new ItemMovimentacao { ProdutoId = item.ProdutoId, Quantidade = qtd, CustoUnitario = item.Produto?.PrecoCusto ?? 0 });
        }

        ordem.MarcarConcluida(calendario.AgoraUtc);
        var observacoes = new List<string>();
        if (!string.IsNullOrWhiteSpace(ordem.Observacao)) observacoes.Add(ordem.Observacao);
        if (!string.IsNullOrWhiteSpace(req.Observacao)) observacoes.Add(req.Observacao.Trim());
        if (divergencias.Count > 0) observacoes.Add("DIVERGÊNCIA NO RECEBIMENTO — " + string.Join("; ", divergencias));
        ordem.Observacao = observacoes.Count == 0 ? null : string.Join(" | ", observacoes);
        if (ordem.Observacao is { Length: > 1000 }) ordem.Observacao = ordem.Observacao[..1000];
        mov.Observacao = divergencias.Count > 0 ? "Recebido com divergência: " + string.Join("; ", divergencias) : "Recebido conforme";
        if (mov.Observacao.Length > 1000) mov.Observacao = mov.Observacao[..1000];

        if (mov.Itens.Count > 0) db.Movimentacoes.Add(mov);
        await db.SaveChangesAsync(ct);

        await notificador.PublicarAsync(new EventoPainelDto(EventosPainel.EstoqueAlterado,
            $"{Mapeamentos.NumeroOrdem(ordem.Id)} recebida no destino", mov.ValorTotal, calendario.AgoraUtc), ct);
        return (await ObterAsync(id, ct))!;
    }

    public async Task<OrdemSeparacaoDto> CancelarAsync(int id, CancellationToken ct = default)
    {
        var ordem = await CarregarAsync(id, ct);
        if (ordem.Tipo == TipoOrdemSeparacao.PedidoOnline)
            throw new RegraNegocioException("Ordens de pedido são canceladas junto com o pedido, na tela Pedidos online.");
        var eraSeparada = ordem.Status == StatusOrdemSeparacao.Separada;
        ordem.Cancelar(calendario.AgoraUtc);
        foreach (var item in ordem.Itens)
        {
            var reservado = eraSeparada ? item.QuantidadeSeparada ?? 0 : item.Quantidade;
            if (reservado > 0) (await estoque.ObterSaldoAsync(item.ProdutoId, ordem.DepositoOrigemId, ct)).LiberarReserva(reservado);
        }
        await db.SaveChangesAsync(ct);
        return (await ObterAsync(id, ct))!;
    }

    public static string DescreverStatus(StatusOrdemSeparacao s) => s switch
    {
        StatusOrdemSeparacao.Aberta => "Aguardando separação",
        StatusOrdemSeparacao.Separada => "Separada e conferida",
        StatusOrdemSeparacao.Expedida => "Em trânsito",
        StatusOrdemSeparacao.Concluida => "Concluída",
        _ => "Cancelada"
    };
}
