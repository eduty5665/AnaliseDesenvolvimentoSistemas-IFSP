using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Contracts;

// ───────────────────────── Comuns ─────────────────────────

public record PaginaDto<T>(IReadOnlyList<T> Itens, int Total, int Pagina, int TamanhoPagina);

public record ErroDto(string Mensagem);

public record EnderecoDto(
    string? Cep = null,
    string? Logradouro = null,
    string? Numero = null,
    string? Complemento = null,
    string? Bairro = null,
    string? Cidade = null,
    string? Uf = null);

public record OpcaoDto(int Id, string Nome);

// ───────────────────────── Autenticação ─────────────────────────

public record LoginFuncionarioRequest(string Login, string Senha);

public record LoginClienteRequest(string Email, string Senha);

public record RegistrarClienteRequest(
    string Nome,
    string Email,
    string Senha,
    DateOnly DataNascimento,
    string? Cpf = null,
    string? Telefone = null,
    EnderecoDto? Endereco = null,
    bool AceitaMarketing = false);

public record SessaoDto(string Token, DateTime ExpiraEm, int Id, string Nome, string Tipo, string? Perfil);

public static class TiposSessao
{
    public const string Funcionario = "funcionario";
    public const string Cliente = "cliente";
}

// ───────────────────────── Catálogo ─────────────────────────

public record CategoriaDto(int Id, string Nome, string? Descricao, bool EhVinho, string Cor);

public record CategoriaSalvarRequest(string Nome, string? Descricao, bool EhVinho, string? Cor);

/// <summary>Visão completa para o ERP (inclui custo e margem).</summary>
public record ProdutoDto(
    int Id,
    string Sku,
    string? CodigoBarras,
    string Nome,
    string? Descricao,
    int CategoriaId,
    string Categoria,
    string CorCategoria,
    string? Produtor,
    string? Pais,
    string? Regiao,
    string? Uva,
    int? Safra,
    decimal? TeorAlcoolico,
    int VolumeMl,
    string? Harmonizacao,
    string? TemperaturaServico,
    int? Pontuacao,
    decimal PrecoCusto,
    decimal PrecoVenda,
    decimal? PrecoPromocional,
    decimal PrecoAtual,
    decimal MargemPercentual,
    int EstoqueMinimo,
    string? ImagemUrl,
    bool Ativo,
    bool VisivelLoja,
    bool Destaque,
    int EstoqueTotal,
    int EstoqueDisponivel);

public record ProdutoSalvarRequest(
    string Sku,
    string Nome,
    int CategoriaId,
    decimal PrecoCusto,
    decimal PrecoVenda,
    string? CodigoBarras = null,
    string? Descricao = null,
    string? Produtor = null,
    string? Pais = null,
    string? Regiao = null,
    string? Uva = null,
    int? Safra = null,
    decimal? TeorAlcoolico = null,
    int VolumeMl = 750,
    string? Harmonizacao = null,
    string? TemperaturaServico = null,
    int? Pontuacao = null,
    decimal? PrecoPromocional = null,
    int EstoqueMinimo = 0,
    string? ImagemUrl = null,
    bool Ativo = true,
    bool VisivelLoja = false,
    bool Destaque = false);

/// <summary>Visão pública (loja online e app): sem custo, com disponibilidade.</summary>
public record CatalogoItemDto(
    int Id,
    string Sku,
    string Nome,
    string? Descricao,
    int CategoriaId,
    string Categoria,
    string CorCategoria,
    string? Produtor,
    string? Pais,
    string? Regiao,
    string? Uva,
    int? Safra,
    decimal? TeorAlcoolico,
    int VolumeMl,
    string? Harmonizacao,
    string? TemperaturaServico,
    int? Pontuacao,
    decimal PrecoVenda,
    decimal? PrecoPromocional,
    decimal PrecoAtual,
    string? ImagemUrl,
    bool Destaque,
    int Disponivel);

public record CatalogoFacetasDto(
    IReadOnlyList<CategoriaDto> Categorias,
    IReadOnlyList<string> Paises,
    IReadOnlyList<string> Uvas,
    decimal PrecoMinimo,
    decimal PrecoMaximo);

// ───────────────────────── Estoque ─────────────────────────

public record DepositoDto(int Id, string Nome, TipoDeposito Tipo, string? Endereco, bool PermiteRetirada, bool AtendeOnline, bool Ativo);

public record DepositoSalvarRequest(string Nome, TipoDeposito Tipo, string? Endereco, bool PermiteRetirada, bool AtendeOnline, bool Ativo = true);

public record SaldoDto(
    int ProdutoId,
    string Sku,
    string Produto,
    string Categoria,
    int DepositoId,
    string Deposito,
    int Quantidade,
    int Reservado,
    int Disponivel,
    int EstoqueMinimo,
    bool AbaixoMinimo,
    decimal CustoUnitario);

public record ItemMovimentacaoRequest(int ProdutoId, int Quantidade, decimal? CustoUnitario = null);

/// <summary>
/// Entrada: exige DepositoDestinoId. Saída: exige DepositoOrigemId.
/// Transferência: exige origem e destino. Ajuste (inventário): DepositoOrigemId e, em cada item,
/// a quantidade CONTADA fisicamente (o sistema calcula a diferença).
/// </summary>
public record MovimentacaoRequest(
    TipoMovimentacao Tipo,
    IReadOnlyList<ItemMovimentacaoRequest> Itens,
    int? DepositoOrigemId = null,
    int? DepositoDestinoId = null,
    int? FornecedorId = null,
    string? NumeroDocumento = null,
    string? Observacao = null,
    bool GerarContaAPagar = false,
    DateOnly? VencimentoContaAPagar = null);

public record ItemMovimentacaoDto(int ProdutoId, string Produto, int Quantidade, decimal CustoUnitario);

public record MovimentacaoDto(
    int Id,
    TipoMovimentacao Tipo,
    DateTime Data,
    string? DepositoOrigem,
    string? DepositoDestino,
    string? Fornecedor,
    string? NumeroDocumento,
    string? Observacao,
    string? Usuario,
    int? VendaId,
    decimal ValorTotal,
    IReadOnlyList<ItemMovimentacaoDto> Itens);

// ───────────────────────── Vendas (PDV) ─────────────────────────

public record ItemVendaRequest(int ProdutoId, int Quantidade, decimal Desconto = 0);

public record PagamentoRequest(FormaPagamento Forma, decimal Valor);

public record VendaRequest(
    int DepositoId,
    IReadOnlyList<ItemVendaRequest> Itens,
    IReadOnlyList<PagamentoRequest> Pagamentos,
    int? ClienteId = null,
    decimal Desconto = 0,
    CanalVenda Canal = CanalVenda.Loja);

public record ItemVendaDto(int ProdutoId, string Produto, int Quantidade, decimal PrecoUnitario, decimal Desconto, decimal Total);

public record PagamentoDto(FormaPagamento Forma, decimal Valor);

public record VendaDto(
    int Id,
    string Numero,
    DateTime Data,
    CanalVenda Canal,
    StatusVenda Status,
    int? ClienteId,
    string? Cliente,
    string? Vendedor,
    string Deposito,
    decimal Subtotal,
    decimal Desconto,
    decimal Total,
    decimal Troco,
    string? MotivoCancelamento,
    IReadOnlyList<ItemVendaDto> Itens,
    IReadOnlyList<PagamentoDto> Pagamentos);

public record VendaResumoDto(int Id, string Numero, DateTime Data, CanalVenda Canal, StatusVenda Status, string? Cliente, int Itens, decimal Total);

public record CancelarVendaRequest(string Motivo);

// ───────────────────────── Pedidos online ─────────────────────────

public record ItemPedidoRequest(int ProdutoId, int Quantidade);

public record CriarPedidoRequest(
    TipoPedido Tipo,
    ModalidadeEntrega Modalidade,
    FormaPagamento FormaPagamento,
    IReadOnlyList<ItemPedidoRequest> Itens,
    int? DepositoRetiradaId = null,
    EnderecoDto? EnderecoEntrega = null,
    string? Observacao = null);

public record ItemPedidoDto(int ProdutoId, string Produto, int Quantidade, decimal PrecoUnitario, decimal Total);

public record PedidoDto(
    int Id,
    string Numero,
    DateTime Data,
    int ClienteId,
    string Cliente,
    string? ClienteTelefone,
    TipoPedido Tipo,
    ModalidadeEntrega Modalidade,
    StatusPedido Status,
    string Deposito,
    FormaPagamento FormaPagamento,
    string? EnderecoEntrega,
    decimal TaxaEntrega,
    decimal Subtotal,
    decimal Total,
    DateTime? ValidoAte,
    string? Observacao,
    int? VendaId,
    IReadOnlyList<ItemPedidoDto> Itens,
    IReadOnlyList<StatusPedido> ProximosStatus);

public record AlterarStatusPedidoRequest(StatusPedido Status);

public record CotacaoEntregaDto(decimal Taxa, int PrazoDias, string Descricao);

// ───────────────────────── Cadastros ─────────────────────────

public record ClienteDto(
    int Id,
    string Nome,
    string? CpfCnpj,
    string? Email,
    string? Telefone,
    DateOnly? DataNascimento,
    EnderecoDto Endereco,
    bool AceitaMarketing,
    bool Ativo,
    bool PossuiContaOnline);

public record ClienteSalvarRequest(
    string Nome,
    string? CpfCnpj = null,
    string? Email = null,
    string? Telefone = null,
    DateOnly? DataNascimento = null,
    EnderecoDto? Endereco = null,
    bool AceitaMarketing = false,
    bool Ativo = true);

public record FornecedorDto(int Id, string RazaoSocial, string? NomeFantasia, string Cnpj, string? Email, string? Telefone, string? Contato, bool Ativo);

public record FornecedorSalvarRequest(string RazaoSocial, string Cnpj, string? NomeFantasia = null, string? Email = null, string? Telefone = null, string? Contato = null, bool Ativo = true);

public record SetorDto(int Id, string Nome, string? Descricao);

public record UsuarioDto(
    int Id,
    string Nome,
    string Sobrenome,
    string Cpf,
    string Email,
    string Login,
    PerfilUsuario Perfil,
    string? Cargo,
    decimal Salario,
    int HorasSemanais,
    string? Telefone,
    DateOnly? DataNascimento,
    int? SetorId,
    string? Setor,
    bool Ativo,
    DateTime? UltimoAcesso);

public record UsuarioSalvarRequest(
    string Nome,
    string Sobrenome,
    string Cpf,
    string Email,
    string Login,
    PerfilUsuario Perfil,
    string? Senha = null,
    string? Cargo = null,
    decimal Salario = 0,
    int HorasSemanais = 44,
    string? Telefone = null,
    DateOnly? DataNascimento = null,
    int? SetorId = null,
    bool Ativo = true);

public record RegistroAcessoDto(int Id, DateTime DataHora, string LoginInformado, bool Sucesso, string? Ip, string? Usuario, string Origem);

// ───────────────────────── Financeiro ─────────────────────────

public record LancamentoDto(
    int Id,
    TipoLancamento Tipo,
    CategoriaLancamento Categoria,
    string Descricao,
    decimal Valor,
    DateOnly Competencia,
    DateOnly Vencimento,
    DateOnly? DataPagamento,
    StatusLancamento Status,
    bool Atrasado,
    int? SetorId,
    string? Setor,
    int? FornecedorId,
    string? Fornecedor,
    int? VendaId,
    decimal? ConsumoQuantidade,
    string? ConsumoUnidade,
    string? Observacao);

public record LancamentoSalvarRequest(
    TipoLancamento Tipo,
    CategoriaLancamento Categoria,
    string Descricao,
    decimal Valor,
    DateOnly Vencimento,
    DateOnly? Competencia = null,
    int? SetorId = null,
    int? FornecedorId = null,
    decimal? ConsumoQuantidade = null,
    string? ConsumoUnidade = null,
    string? Observacao = null);

public record PagarLancamentoRequest(DateOnly? DataPagamento = null);

public record AlertaFinanceiroDto(int LancamentoId, string Descricao, TipoLancamento Tipo, decimal Valor, DateOnly Vencimento, int DiasParaVencer, bool Atrasado);

public record ValorCategoriaDto(string Nome, decimal Valor);

public record ResumoFinanceiroDto(
    decimal ReceitasMes,
    decimal DespesasMes,
    decimal ResultadoMes,
    decimal AReceber,
    decimal APagar,
    decimal Atrasado,
    IReadOnlyList<ValorCategoriaDto> DespesasPorCategoria,
    IReadOnlyList<ValorCategoriaDto> DespesasPorSetor);

// ───────────────────────── Documentos (OCR) ─────────────────────────

public record DocumentoDto(
    int Id,
    string Nome,
    TipoDocumento Tipo,
    int? SetorId,
    string? Setor,
    StatusDocumento Status,
    string? Pendencias,
    DateTime DataDigitalizacao,
    string? ConteudoExtraido,
    string? Responsavel,
    int? LancamentoId);

/// <summary>Dados conferidos pelo estagiário a partir do texto extraído (verificação de padrão).</summary>
public record VerificarDocumentoRequest(
    TipoDocumento Tipo,
    int? SetorId,
    decimal? Valor,
    DateOnly? Vencimento,
    string? Descricao,
    CategoriaLancamento? Categoria);

// ───────────────────────── Dashboard / BI ─────────────────────────

public record KpisDto(
    decimal FaturamentoHoje,
    int VendasHoje,
    decimal FaturamentoMes,
    decimal FaturamentoMesAnteriorMesmoPeriodo,
    decimal VariacaoMesPercentual,
    decimal TicketMedioMes,
    decimal MargemBrutaMesPercentual,
    int ItensVendidosMes,
    decimal PrevisaoFechamentoMes,
    decimal ValorEmEstoque,
    int ClientesAtivos,
    int PedidosPendentes);

public record PontoSerieDto(DateOnly Data, decimal Valor, int Quantidade);

public record PontoProjecaoDto(DateOnly Data, decimal Previsto, decimal Minimo, decimal Maximo);

public record ProjecaoDto(
    string Metodo,
    IReadOnlyList<PontoProjecaoDto> Pontos,
    decimal TotalPrevisto,
    decimal TotalUltimoPeriodoIgual,
    decimal CrescimentoPercentual,
    decimal ErroMedioPercentual);

public record FatiaDto(string Nome, decimal Valor, string? Cor = null);

public record RankingProdutoDto(int ProdutoId, string Nome, string Categoria, int Quantidade, decimal Faturamento, decimal Margem);

public record CoberturaEstoqueDto(
    int ProdutoId,
    string Nome,
    int Disponivel,
    int EstoqueMinimo,
    decimal MediaDiaria,
    decimal? DiasCobertura,
    DateOnly? DataRupturaPrevista,
    int SugestaoCompra);

public record DashboardDto(
    DateTime GeradoEm,
    int PeriodoDias,
    KpisDto Kpis,
    IReadOnlyList<PontoSerieDto> SerieDiaria,
    ProjecaoDto Projecao,
    IReadOnlyList<FatiaDto> PorCategoria,
    IReadOnlyList<FatiaDto> PorCanal,
    IReadOnlyList<FatiaDto> PorDiaSemana,
    IReadOnlyList<FatiaDto> PorHora,
    IReadOnlyList<RankingProdutoDto> TopProdutos,
    IReadOnlyList<CoberturaEstoqueDto> EstoqueCritico,
    IReadOnlyList<AlertaFinanceiroDto> AlertasFinanceiros,
    IReadOnlyList<VendaResumoDto> UltimasVendas);

/// <summary>Evento enviado pelo hub SignalR (/hubs/painel) a cada mudança relevante.</summary>
public record EventoPainelDto(string Tipo, string Descricao, decimal? Valor, DateTime Quando);

public static class EventosPainel
{
    public const string Metodo = "evento";
    public const string VendaRegistrada = "venda";
    public const string VendaCancelada = "venda-cancelada";
    public const string EstoqueAlterado = "estoque";
    public const string PedidoCriado = "pedido";
    public const string PedidoAtualizado = "pedido-status";
    public const string Financeiro = "financeiro";
}
