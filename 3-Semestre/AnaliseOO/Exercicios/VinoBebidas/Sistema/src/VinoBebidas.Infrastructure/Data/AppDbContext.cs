using Microsoft.EntityFrameworkCore;
using VinoBebidas.Domain.Entities;

namespace VinoBebidas.Infrastructure.Data;

/// <summary>Banco único do sistema: ERP/PDV, loja online, app e painel leem e gravam aqui (via API).</summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<RegistroAcesso> RegistrosAcesso => Set<RegistroAcesso>();
    public DbSet<Setor> Setores => Set<Setor>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Fornecedor> Fornecedores => Set<Fornecedor>();
    public DbSet<CadastroBancario> CadastrosBancarios => Set<CadastroBancario>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Deposito> Depositos => Set<Deposito>();
    public DbSet<SaldoEstoque> Saldos => Set<SaldoEstoque>();
    public DbSet<Movimentacao> Movimentacoes => Set<Movimentacao>();
    public DbSet<ItemMovimentacao> ItensMovimentacao => Set<ItemMovimentacao>();
    public DbSet<Venda> Vendas => Set<Venda>();
    public DbSet<ItemVenda> ItensVenda => Set<ItemVenda>();
    public DbSet<PagamentoVenda> PagamentosVenda => Set<PagamentoVenda>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<ItemPedido> ItensPedido => Set<ItemPedido>();
    public DbSet<LancamentoFinanceiro> Lancamentos => Set<LancamentoFinanceiro>();
    public DbSet<Documento> Documentos => Set<Documento>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);

        // SQLite não ordena nem soma colunas decimal no servidor; guardamos como REAL.
        // No SQL Server continua decimal(18,2).
        if (Database.IsSqlite())
            configurationBuilder.Properties<decimal>().HaveConversion<double>();
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Usuario>(e =>
        {
            e.HasIndex(u => u.Cpf).IsUnique();
            e.HasIndex(u => u.Login).IsUnique();
            e.Property(u => u.Cpf).HasMaxLength(11);
            e.Property(u => u.Login).HasMaxLength(60);
            e.Property(u => u.Email).HasMaxLength(150);
            e.Property(u => u.Perfil).HasConversion<string>().HasMaxLength(30);
            e.ComplexProperty(u => u.Endereco);
            e.HasOne(u => u.Setor).WithMany().HasForeignKey(u => u.SetorId).OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<RegistroAcesso>(e => e.HasIndex(r => r.CriadoEm));

        b.Entity<Setor>(e =>
        {
            e.HasIndex(s => s.Nome).IsUnique();
            e.Property(s => s.Nome).HasMaxLength(100);
        });

        b.Entity<Cliente>(e =>
        {
            e.HasIndex(c => c.Email).IsUnique();
            e.HasIndex(c => c.CpfCnpj);
            e.Property(c => c.Email).HasMaxLength(150);
            e.Property(c => c.CpfCnpj).HasMaxLength(14);
            e.ComplexProperty(c => c.Endereco);
        });

        b.Entity<Fornecedor>(e =>
        {
            e.HasIndex(f => f.Cnpj).IsUnique();
            e.Property(f => f.Cnpj).HasMaxLength(14);
        });

        b.Entity<Categoria>(e =>
        {
            e.HasIndex(c => c.Nome).IsUnique();
            e.Property(c => c.Nome).HasMaxLength(100);
        });

        b.Entity<Produto>(e =>
        {
            e.HasIndex(p => p.Sku).IsUnique();
            e.HasIndex(p => p.CodigoBarras);
            e.HasIndex(p => p.Nome);
            e.Property(p => p.Sku).HasMaxLength(40);
            e.Property(p => p.CodigoBarras).HasMaxLength(20);
            e.Property(p => p.Nome).HasMaxLength(200);
            e.Property(p => p.Descricao).HasMaxLength(2000);
            e.Property(p => p.TeorAlcoolico).HasPrecision(5, 2);
            e.HasOne(p => p.Categoria).WithMany().HasForeignKey(p => p.CategoriaId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Deposito>(e => e.Property(d => d.Tipo).HasConversion<string>().HasMaxLength(30));

        b.Entity<SaldoEstoque>(e =>
        {
            e.HasIndex(s => new { s.ProdutoId, s.DepositoId }).IsUnique();
            e.HasOne(s => s.Produto).WithMany(p => p.Saldos).HasForeignKey(s => s.ProdutoId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Deposito).WithMany().HasForeignKey(s => s.DepositoId).OnDelete(DeleteBehavior.Restrict);
            // Controle otimista: duas vendas simultâneas do mesmo item não "furam" o estoque.
            e.Property(s => s.AtualizadoEm).IsConcurrencyToken();
        });

        b.Entity<Movimentacao>(e =>
        {
            e.HasIndex(m => m.Data);
            e.Property(m => m.Tipo).HasConversion<string>().HasMaxLength(30);
            e.Property(m => m.Observacao).HasMaxLength(1000);
            e.HasOne(m => m.DepositoOrigem).WithMany().HasForeignKey(m => m.DepositoOrigemId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.DepositoDestino).WithMany().HasForeignKey(m => m.DepositoDestinoId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Fornecedor).WithMany().HasForeignKey(m => m.FornecedorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(m => m.Usuario).WithMany().HasForeignKey(m => m.UsuarioId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(m => m.Itens).WithOne().HasForeignKey(i => i.MovimentacaoId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ItemMovimentacao>(e =>
            e.HasOne(i => i.Produto).WithMany().HasForeignKey(i => i.ProdutoId).OnDelete(DeleteBehavior.Restrict));

        b.Entity<Venda>(e =>
        {
            e.HasIndex(v => v.Data);
            e.Property(v => v.Canal).HasConversion<string>().HasMaxLength(20);
            e.Property(v => v.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(v => v.Cliente).WithMany().HasForeignKey(v => v.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.Usuario).WithMany().HasForeignKey(v => v.UsuarioId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(v => v.Deposito).WithMany().HasForeignKey(v => v.DepositoId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(v => v.Itens).WithOne().HasForeignKey(i => i.VendaId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(v => v.Pagamentos).WithOne().HasForeignKey(p => p.VendaId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ItemVenda>(e =>
            e.HasOne(i => i.Produto).WithMany().HasForeignKey(i => i.ProdutoId).OnDelete(DeleteBehavior.Restrict));

        b.Entity<PagamentoVenda>(e => e.Property(p => p.Forma).HasConversion<string>().HasMaxLength(30));

        b.Entity<Pedido>(e =>
        {
            e.HasIndex(p => p.Status);
            e.HasIndex(p => p.CriadoEm);
            e.Property(p => p.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.Modalidade).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(30);
            e.Property(p => p.FormaPagamento).HasConversion<string>().HasMaxLength(30);
            e.Property(p => p.Observacao).HasMaxLength(1000);
            e.HasOne(p => p.Cliente).WithMany().HasForeignKey(p => p.ClienteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(p => p.Deposito).WithMany().HasForeignKey(p => p.DepositoId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(p => p.Itens).WithOne().HasForeignKey(i => i.PedidoId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ItemPedido>(e =>
            e.HasOne(i => i.Produto).WithMany().HasForeignKey(i => i.ProdutoId).OnDelete(DeleteBehavior.Restrict));

        b.Entity<LancamentoFinanceiro>(e =>
        {
            e.HasIndex(l => l.Vencimento);
            e.HasIndex(l => l.Status);
            e.Property(l => l.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(l => l.Categoria).HasConversion<string>().HasMaxLength(30);
            e.Property(l => l.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(l => l.ConsumoQuantidade).HasPrecision(18, 3);
            e.Property(l => l.Observacao).HasMaxLength(1000);
            e.HasOne(l => l.Setor).WithMany().HasForeignKey(l => l.SetorId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(l => l.Fornecedor).WithMany().HasForeignKey(l => l.FornecedorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(l => l.CadastroBancario).WithMany().HasForeignKey(l => l.CadastroBancarioId).OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<Documento>(e =>
        {
            e.Property(d => d.Tipo).HasConversion<string>().HasMaxLength(20);
            e.Property(d => d.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(d => d.Pendencias).HasMaxLength(1000);
            e.HasOne(d => d.Setor).WithMany().HasForeignKey(d => d.SetorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(d => d.Responsavel).WithMany().HasForeignKey(d => d.ResponsavelId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
