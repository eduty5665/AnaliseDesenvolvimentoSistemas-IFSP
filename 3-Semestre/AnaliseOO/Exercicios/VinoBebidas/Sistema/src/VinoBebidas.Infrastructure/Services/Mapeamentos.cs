using VinoBebidas.Contracts;
using VinoBebidas.Domain.Entities;

namespace VinoBebidas.Infrastructure.Services;

public static class Mapeamentos
{
    public static string NumeroVenda(int id) => $"V{id:D6}";
    public static string NumeroPedido(int id) => $"P{id:D6}";
    public static string NumeroOrdem(int id) => $"OS{id:D6}";
    public static string NumeroCaixa(int id) => $"CX{id:D5}";
    public static string NumeroMovimentacao(Domain.Enums.TipoMovimentacao tipo, int id) => tipo switch
    {
        Domain.Enums.TipoMovimentacao.Entrada => $"E{id:D6}",
        Domain.Enums.TipoMovimentacao.Saida => $"S{id:D6}",
        Domain.Enums.TipoMovimentacao.Transferencia => $"T{id:D6}",
        Domain.Enums.TipoMovimentacao.RecebimentoTransferencia => $"R{id:D6}",
        Domain.Enums.TipoMovimentacao.Ajuste => $"A{id:D6}",
        _ => $"M{id:D6}"
    };

    public static EnderecoDto ToDto(this Endereco e) =>
        new(e.Cep, e.Logradouro, e.Numero, e.Complemento, e.Bairro, e.Cidade, e.Uf);

    public static Endereco ToEntity(this EnderecoDto? d) => d is null
        ? new Endereco()
        : new Endereco
        {
            Cep = d.Cep, Logradouro = d.Logradouro, Numero = d.Numero, Complemento = d.Complemento,
            Bairro = d.Bairro, Cidade = d.Cidade, Uf = d.Uf?.ToUpperInvariant()
        };

    public static CategoriaDto ToDto(this Categoria c) => new(c.Id, c.Nome, c.Descricao, c.EhVinho, c.Cor, c.Alcoolico, c.TributosAproximados);

    public static DepositoDto ToDto(this Deposito d) => new(d.Id, d.Nome, d.Tipo, d.Endereco, d.PermiteRetirada, d.AtendeOnline, d.Ativo);

    public static SetorDto ToDto(this Setor s) => new(s.Id, s.Nome, s.Descricao);

    public static FornecedorDto ToDto(this Fornecedor f) =>
        new(f.Id, f.RazaoSocial, f.NomeFantasia, f.Cnpj, f.Email, f.Telefone, f.Contato, f.Ativo);

    public static ClienteDto ToDto(this Cliente c) =>
        new(c.Id, c.Nome, c.CpfCnpj, c.Email, c.Telefone, c.DataNascimento, c.Endereco.ToDto(), c.AceitaMarketing, c.Ativo,
            !string.IsNullOrEmpty(c.SenhaHash));

    public static UsuarioDto ToDto(this Usuario u) =>
        new(u.Id, u.Nome, u.Sobrenome, u.Cpf, u.Email, u.Login, u.Perfil, u.Cargo, u.Salario, u.HorasSemanais, u.Telefone,
            u.DataNascimento, u.SetorId, u.Setor?.Nome, u.Ativo, u.UltimoAcesso);

    public static ProdutoDto ToDto(this Produto p) => new(
        p.Id, p.Sku, p.CodigoBarras, p.Nome, p.Descricao, p.CategoriaId, p.Categoria?.Nome ?? "", p.Categoria?.Cor ?? "#7b2d3b",
        p.Produtor, p.Pais, p.Regiao, p.Uva, p.Safra, p.TeorAlcoolico, p.VolumeMl, p.Harmonizacao, p.TemperaturaServico,
        p.Pontuacao, p.PrecoCusto, p.PrecoVenda, p.PrecoPromocional, p.PrecoAtual, p.MargemPercentual, p.EstoqueMinimo,
        p.ImagemUrl, p.Ativo, p.VisivelLoja, p.Destaque,
        p.Saldos.Sum(s => s.Quantidade), p.Saldos.Sum(s => s.Disponivel),
        p.Categoria?.Alcoolico ?? true, p.Categoria?.TributosAproximados ?? 0);

    public static void Aplicar(this Produto p, ProdutoSalvarRequest r)
    {
        p.Sku = r.Sku.Trim().ToUpperInvariant();
        p.Nome = r.Nome.Trim();
        p.CategoriaId = r.CategoriaId;
        p.CodigoBarras = string.IsNullOrWhiteSpace(r.CodigoBarras) ? null : r.CodigoBarras.Trim();
        p.Descricao = r.Descricao;
        p.Produtor = r.Produtor;
        p.Pais = r.Pais;
        p.Regiao = r.Regiao;
        p.Uva = r.Uva;
        p.Safra = r.Safra;
        p.TeorAlcoolico = r.TeorAlcoolico;
        p.VolumeMl = r.VolumeMl;
        p.Harmonizacao = r.Harmonizacao;
        p.TemperaturaServico = r.TemperaturaServico;
        p.Pontuacao = r.Pontuacao;
        p.PrecoCusto = r.PrecoCusto;
        p.PrecoVenda = r.PrecoVenda;
        p.PrecoPromocional = r.PrecoPromocional;
        p.EstoqueMinimo = r.EstoqueMinimo;
        p.ImagemUrl = r.ImagemUrl;
        p.Ativo = r.Ativo;
        p.VisivelLoja = r.VisivelLoja;
        p.Destaque = r.Destaque;
    }

    public static VendaDto ToDto(this Venda v, string? autorizadoPor = null) => new(
        v.Id, NumeroVenda(v.Id), v.Data, v.Canal, v.Status, v.ClienteId, v.Cliente?.Nome, v.Usuario?.NomeCompleto,
        v.Vendedor?.NomeCompleto, v.Deposito?.Nome ?? "", v.CaixaSessaoId, v.CpfCnpjNota, v.Subtotal, v.Desconto, v.Total, v.Troco,
        Math.Round(v.Itens.Sum(i => i.Total * (i.Produto?.Categoria?.TributosAproximados ?? 0) / 100), 2),
        autorizadoPor, v.MotivoCancelamento,
        v.Itens.Select(i => new ItemVendaDto(i.ProdutoId, i.Produto?.Sku ?? "", i.Produto?.Nome ?? $"#{i.ProdutoId}", i.Quantidade, i.PrecoUnitario, i.Desconto, i.Total)).ToList(),
        v.Pagamentos.Select(p => new PagamentoDto(p.Forma, p.Valor, p.Parcelas, p.Nsu)).ToList());

    public static PedidoDto ToDto(this Pedido p) => new(
        p.Id, NumeroPedido(p.Id), p.CriadoEm, p.ClienteId, p.Cliente?.Nome ?? "", p.Cliente?.Telefone, p.Tipo, p.Modalidade,
        p.Status, p.Deposito?.Nome ?? "", p.FormaPagamento, p.EnderecoEntrega, p.TaxaEntrega, p.Subtotal, p.Total,
        p.ValidoAte, p.Observacao, p.VendaId, p.OrdemSeparacaoId,
        p.Itens.Select(i => new ItemPedidoDto(i.ProdutoId, i.Produto?.Nome ?? $"#{i.ProdutoId}", i.Quantidade, i.PrecoUnitario, i.PrecoUnitario * i.Quantidade)).ToList(),
        Pedido.ProximosStatus(p.Status, p.Modalidade));

    public static MovimentacaoDto ToDto(this Movimentacao m) => new(
        m.Id, NumeroMovimentacao(m.Tipo, m.Id), m.Tipo, m.Data, m.DepositoOrigem?.Nome, m.DepositoDestino?.Nome,
        m.Fornecedor?.RazaoSocial, m.Fornecedor?.Cnpj, m.NumeroDocumento, m.Serie, m.ChaveAcesso, m.DataEmissao, m.Motivo,
        m.Observacao, m.Usuario?.NomeCompleto, m.VendaId, m.OrdemSeparacaoId, m.ValorProdutos, m.ValorFrete, m.ValorOutrasDespesas, m.ValorTotal,
        m.Itens.Select(i => new ItemMovimentacaoDto(i.ProdutoId, i.Produto?.Sku ?? "", i.Produto?.Nome ?? $"#{i.ProdutoId}", i.Quantidade, i.CustoUnitario)).ToList());

    public static OrdemSeparacaoDto ToDto(this OrdemSeparacao o, Pedido? pedido = null) => new(
        o.Id, NumeroOrdem(o.Id), o.Tipo, o.Status, o.CriadoEm, o.DepositoOrigemId, o.DepositoOrigem?.Nome ?? "", o.DepositoDestinoId,
        o.DepositoDestino?.Nome, o.PedidoId, o.PedidoId is null ? null : NumeroPedido(o.PedidoId.Value), pedido?.Cliente?.Nome,
        pedido is null ? null : pedido.Modalidade == Domain.Enums.ModalidadeEntrega.Entrega ? $"Entrega: {pedido.EnderecoEntrega}" : "Retirada na loja",
        o.Solicitante?.NomeCompleto, o.Separador?.NomeCompleto, o.Observacao, o.SeparadaEm, o.ExpedidaEm, o.ConcluidaEm,
        o.Itens.OrderBy(i => i.Localizacao ?? "ZZZ").ThenBy(i => i.Produto?.Nome)
            .Select(i => new ItemOrdemSeparacaoDto(i.ProdutoId, i.Produto?.Sku ?? "", i.Produto?.CodigoBarras, i.Produto?.Nome ?? $"#{i.ProdutoId}",
                i.Localizacao, i.Quantidade, i.QuantidadeSeparada, i.QuantidadeRecebida)).ToList());

    public static LancamentoDto ToDto(this LancamentoFinanceiro l, DateOnly hoje) => new(
        l.Id, l.Tipo, l.Categoria, l.Descricao, l.Valor, l.Competencia, l.Vencimento, l.DataPagamento, l.Status,
        l.EstaAtrasado(hoje), l.SetorId, l.Setor?.Nome, l.FornecedorId, l.Fornecedor?.RazaoSocial, l.VendaId,
        l.ConsumoQuantidade, l.ConsumoUnidade, l.Observacao);

    public static DocumentoDto ToDto(this Documento d) => new(
        d.Id, d.Nome, d.Tipo, d.SetorId, d.Setor?.Nome, d.Status, d.Pendencias, d.DataDigitalizacao, d.ConteudoExtraido,
        d.Responsavel?.NomeCompleto, d.LancamentoId);
}
