using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Domain.Enums;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Infrastructure.Seed;

/// <summary>
/// Popula o banco com dados de demonstração: catálogo, depósitos, usuários, clientes,
/// ~6 meses de vendas (para os gráficos e projeções) e contas a pagar/receber.
/// Senha de todos os usuários de demonstração: Vino@123
/// </summary>
public class DadosIniciais(AppDbContext db, SenhaService senhas, Calendario calendario, ILogger<DadosIniciais> log)
{
    public const string SenhaDemo = "Vino@123";
    private readonly Random _rnd = new(2026);

    public async Task ExecutarAsync(bool incluirHistorico, CancellationToken ct = default)
    {
        if (await db.Usuarios.AnyAsync(ct)) return;
        log.LogInformation("Banco vazio: criando dados iniciais...");

        var setores = CriarSetores();
        var categorias = CriarCategorias();
        var depositos = CriarDepositos();
        await db.SaveChangesAsync(ct);

        var usuarios = CriarUsuarios(setores);
        var fornecedores = CriarFornecedores();
        var produtos = CriarProdutos(categorias);
        var clientes = CriarClientes();
        await db.SaveChangesAsync(ct);

        CriarSaldos(produtos, depositos, usuarios["estoque"]);
        await db.SaveChangesAsync(ct);

        if (incluirHistorico)
        {
            await CriarHistoricoVendasAsync(produtos, depositos, clientes, usuarios, ct);
            CriarLancamentos(setores, fornecedores);
            await db.SaveChangesAsync(ct);
            await CriarPedidosAbertosAsync(produtos, depositos, clientes, ct);
        }

        log.LogInformation("Dados iniciais criados. Usuário: admin / senha: {Senha}", SenhaDemo);
    }

    // ───────────────────────── Cadastros básicos ─────────────────────────

    private Dictionary<string, Setor> CriarSetores()
    {
        var nomes = new[] { "Administrativo", "Financeiro", "Comercial", "Logística", "Loja Centro", "Loja Shopping", "Manutenção", "Marketing" };
        var setores = nomes.ToDictionary(n => n, n => new Setor { Nome = n });
        db.Setores.AddRange(setores.Values);
        return setores;
    }

    private Dictionary<string, Categoria> CriarCategorias()
    {
        var lista = new[]
        {
            new Categoria { Nome = "Tinto", EhVinho = true, Cor = "#7b1e3a", Descricao = "Vinhos tintos" },
            new Categoria { Nome = "Branco", EhVinho = true, Cor = "#c9a227", Descricao = "Vinhos brancos" },
            new Categoria { Nome = "Rosé", EhVinho = true, Cor = "#e07a8e", Descricao = "Vinhos rosés" },
            new Categoria { Nome = "Espumante", EhVinho = true, Cor = "#b8a06a", Descricao = "Espumantes e champagnes" },
            new Categoria { Nome = "Fortificado", EhVinho = true, Cor = "#8a4b2a", Descricao = "Portos, Madeiras e vinhos de sobremesa" },
            new Categoria { Nome = "Cervejas", EhVinho = false, Cor = "#d88c1a", Descricao = "Cervejas especiais" },
            new Categoria { Nome = "Destilados", EhVinho = false, Cor = "#5b6470", Descricao = "Gin, whisky, cachaça" },
            new Categoria { Nome = "Sem álcool", EhVinho = false, Cor = "#2f8fb3", Descricao = "Águas, sucos e refrigerantes" },
        };
        db.Categorias.AddRange(lista);
        return lista.ToDictionary(c => c.Nome);
    }

    private Dictionary<string, Deposito> CriarDepositos()
    {
        var d = new Dictionary<string, Deposito>
        {
            ["centro"] = new() { Nome = "Loja Centro", Tipo = TipoDeposito.Loja, Endereco = "Rua Brasil, 1200 - Centro, Catanduva/SP", PermiteRetirada = true },
            ["shopping"] = new() { Nome = "Loja Shopping", Tipo = TipoDeposito.Loja, Endereco = "Av. São Domingos, 3000 - Loja 112, Catanduva/SP", PermiteRetirada = true },
            ["cd"] = new() { Nome = "Centro de Distribuição", Tipo = TipoDeposito.CentroDistribuicao, Endereco = "Rod. Washington Luís, km 385", AtendeOnline = true },
        };
        db.Depositos.AddRange(d.Values);
        return d;
    }

    private Dictionary<string, Usuario> CriarUsuarios(Dictionary<string, Setor> setores)
    {
        var hash = senhas.Gerar(SenhaDemo);
        Usuario U(string login, string nome, string sobrenome, PerfilUsuario perfil, string cargo, decimal salario, string setor) => new()
        {
            Login = login, Nome = nome, Sobrenome = sobrenome, Perfil = perfil, Cargo = cargo, Salario = salario,
            Cpf = GerarCpf(), Email = $"{login}@vinobebidas.com.br", SenhaHash = hash, Setor = setores[setor],
            Telefone = $"(17) 9{_rnd.Next(8000, 9999)}-{_rnd.Next(1000, 9999)}",
            DataNascimento = new DateOnly(_rnd.Next(1970, 2004), _rnd.Next(1, 13), _rnd.Next(1, 28)),
            Endereco = new Endereco { Cidade = "Catanduva", Uf = "SP" }
        };

        var u = new Dictionary<string, Usuario>
        {
            ["admin"] = U("admin", "Administrador", "do Sistema", PerfilUsuario.Administrador, "Administrador de TI", 9500, "Administrativo"),
            ["gerente"] = U("gerente", "Mariana", "Albuquerque", PerfilUsuario.Gerente, "Gerente Comercial", 8200, "Comercial"),
            ["financeiro"] = U("financeiro", "Ricardo", "Menezes", PerfilUsuario.DiretorFinanceiro, "Diretor Financeiro (CFO)", 18500, "Financeiro"),
            ["caixa"] = U("caixa", "Juliana", "Prado", PerfilUsuario.Caixa, "Operadora de Caixa", 2300, "Loja Centro"),
            ["vendedor"] = U("vendedor", "Felipe", "Tavares", PerfilUsuario.Vendedor, "Consultor de Vinhos", 3100, "Comercial"),
            ["estoque"] = U("estoque", "Carlos", "Nogueira", PerfilUsuario.Estoquista, "Estoquista", 2600, "Logística"),
            ["estagiario"] = U("estagiario", "Bianca", "Lopes", PerfilUsuario.Estagiario, "Estagiária Financeiro", 1500, "Financeiro"),
        };
        db.Usuarios.AddRange(u.Values);
        return u;
    }

    private List<Fornecedor> CriarFornecedores()
    {
        var lista = new List<Fornecedor>
        {
            new() { RazaoSocial = "Importadora Vale do Douro Ltda", NomeFantasia = "Vale do Douro", Cnpj = GerarCnpj(), Email = "pedidos@valedodouro.com.br", Contato = "Antônio" },
            new() { RazaoSocial = "Andes Vinhos Importação S.A.", NomeFantasia = "Andes Vinhos", Cnpj = GerarCnpj(), Email = "comercial@andesvinhos.com.br", Contato = "Paula" },
            new() { RazaoSocial = "Serra Gaúcha Distribuidora Ltda", NomeFantasia = "Serra Gaúcha", Cnpj = GerarCnpj(), Email = "vendas@serragaucha.com.br", Contato = "Giovani" },
            new() { RazaoSocial = "Bebidas Paulista Atacado Ltda", NomeFantasia = "Paulista Atacado", Cnpj = GerarCnpj(), Email = "sac@paulistaatacado.com.br", Contato = "Renata" },
        };
        db.Fornecedores.AddRange(lista);
        return lista;
    }

    private sealed record Modelo(string Nome, string Cat, string Produtor, string Pais, string Regiao, string Uva, int? Safra, decimal Teor,
        decimal Preco, int Pontos, string Harmonizacao, string Temp, string Descricao, bool Destaque = false, decimal? Promo = null);

    private List<Produto> CriarProdutos(Dictionary<string, Categoria> cat)
    {
        var modelos = new List<Modelo>
        {
            new("Quinta do Vale Alto Reserva", "Tinto", "Quinta do Vale Alto", "Portugal", "Douro", "Touriga Nacional, Touriga Franca", 2019, 14m, 219.90m, 93, "Cordeiro, queijos curados", "16-18 °C", "Tinto encorpado, frutas negras maduras, notas de esteva e taninos firmes. Estagiou 14 meses em carvalho francês.", true),
            new("Herdade Monte Sereno Colheita", "Tinto", "Herdade Monte Sereno", "Portugal", "Alentejo", "Aragonez, Trincadeira, Alicante Bouschet", 2021, 14.5m, 119.90m, 90, "Carnes vermelhas, embutidos", "16-18 °C", "Alentejano macio e generoso, com ameixa, especiarias e final aveludado."),
            new("Cordillera Alta Gran Reserva Malbec", "Tinto", "Bodega Cordillera Alta", "Argentina", "Valle de Uco", "Malbec", 2020, 14.5m, 189.90m, 94, "Churrasco, costela", "16-18 °C", "Malbec de altitude com violeta, amora e cacau; taninos finos e acidez vibrante.", true),
            new("Cordillera Alta Malbec Clásico", "Tinto", "Bodega Cordillera Alta", "Argentina", "Mendoza", "Malbec", 2022, 13.5m, 79.90m, 88, "Hambúrguer, massas", "15-17 °C", "Frutado e fácil de beber, com cereja e ameixa frescas.", false, 69.90m),
            new("Viña Los Robles Carménère Reserva", "Tinto", "Viña Los Robles", "Chile", "Valle de Colchagua", "Carménère", 2021, 13.5m, 89.90m, 89, "Frango ao molho, pimentões", "15-17 °C", "Carménère com pimentão assado, frutas vermelhas e toque defumado."),
            new("Viña Los Robles Cabernet Sauvignon Gran Reserva", "Tinto", "Viña Los Robles", "Chile", "Valle del Maipo", "Cabernet Sauvignon", 2019, 14m, 169.90m, 92, "Picanha, cortes grelhados", "17-18 °C", "Cassis, menta e cedro; estrutura firme para guarda."),
            new("Tenuta San Lorenzo Chianti Classico", "Tinto", "Tenuta San Lorenzo", "Itália", "Toscana", "Sangiovese", 2020, 13.5m, 179.90m, 91, "Massas ao sugo, pizza", "16-18 °C", "Cereja, violeta e ervas secas com a acidez típica da Sangiovese."),
            new("Tenuta San Lorenzo Brunello di Montalcino", "Tinto", "Tenuta San Lorenzo", "Itália", "Montalcino", "Sangiovese Grosso", 2017, 14.5m, 549.90m, 95, "Risoto de funghi, caça", "17-18 °C", "Grande tinto toscano: complexo, com couro, tabaco e fruta madura. Guarda de 15+ anos.", true),
            new("Masseria del Sole Primitivo", "Tinto", "Masseria del Sole", "Itália", "Puglia", "Primitivo", 2021, 14.5m, 109.90m, 89, "Lasanha, carnes ao forno", "16-18 °C", "Maduro e intenso, geleia de frutas vermelhas e baunilha."),
            new("Château Belle Rive Bordeaux Supérieur", "Tinto", "Château Belle Rive", "França", "Bordeaux", "Merlot, Cabernet Sauvignon", 2019, 13.5m, 239.90m, 91, "Pato, carnes assadas", "17-18 °C", "Corte bordalês elegante, com frutas negras, grafite e taninos polidos."),
            new("Domaine des Collines Côtes du Rhône", "Tinto", "Domaine des Collines", "França", "Vale do Rhône", "Grenache, Syrah", 2021, 14m, 139.90m, 89, "Ensopados, cogumelos", "16-17 °C", "Especiado e suculento, com framboesa, pimenta-preta e garrigue."),
            new("Bodegas Solar de Rioja Crianza", "Tinto", "Bodegas Solar", "Espanha", "Rioja", "Tempranillo", 2020, 13.5m, 129.90m, 90, "Tapas, jamón", "16-18 °C", "Tempranillo com morango, baunilha e coco do carvalho americano."),
            new("Bodegas Solar Ribera del Duero Reserva", "Tinto", "Bodegas Solar", "Espanha", "Ribera del Duero", "Tinta del País", 2018, 14.5m, 289.90m, 93, "Cordeiro assado", "17-18 °C", "Potente e profundo, frutas negras, alcaçuz e tosta fina."),
            new("Vinícola Serra Alta Merlot", "Tinto", "Vinícola Serra Alta", "Brasil", "Serra Gaúcha", "Merlot", 2022, 13m, 74.90m, 87, "Frango assado, massas", "15-17 °C", "Merlot brasileiro macio, frutas vermelhas e ervas."),
            new("Campanha Gaúcha Tannat Reserva", "Tinto", "Estância do Pampa", "Brasil", "Campanha Gaúcha", "Tannat", 2020, 14m, 129.90m, 90, "Churrasco gaúcho", "17-18 °C", "Tannat estruturado com amora, cacau e taninos marcantes."),
            new("Bodega Oriental Tannat Premium", "Tinto", "Bodega Oriental", "Uruguai", "Canelones", "Tannat", 2019, 14m, 159.90m, 91, "Carnes de fogo de chão", "17-18 °C", "Referência uruguaia: intenso, frutas escuras e final longo."),
            new("Cape Ridge Pinotage", "Tinto", "Cape Ridge Estate", "África do Sul", "Stellenbosch", "Pinotage", 2021, 14m, 119.90m, 88, "Costelinha barbecue", "16-17 °C", "Pinotage com frutas escuras, café e leve defumado."),

            new("Quinta do Vale Alto Branco", "Branco", "Quinta do Vale Alto", "Portugal", "Douro", "Viosinho, Rabigato", 2023, 12.5m, 99.90m, 89, "Peixes grelhados", "8-10 °C", "Branco mineral e fresco, cítrico com toque floral."),
            new("Alvarinho Monção e Melgaço", "Branco", "Adega Rio Minho", "Portugal", "Vinho Verde", "Alvarinho", 2023, 13m, 139.90m, 91, "Frutos do mar, bacalhau", "8-10 °C", "Alvarinho vibrante com pêssego, maracujá e salinidade.", true),
            new("Viña Los Robles Sauvignon Blanc", "Branco", "Viña Los Robles", "Chile", "Valle de Casablanca", "Sauvignon Blanc", 2024, 12.5m, 79.90m, 88, "Ceviche, saladas", "7-9 °C", "Refrescante, maracujá, limão e ervas verdes.", false, 64.90m),
            new("Cordillera Alta Chardonnay Reserva", "Branco", "Bodega Cordillera Alta", "Argentina", "Valle de Uco", "Chardonnay", 2022, 13.5m, 129.90m, 90, "Salmão, risoto", "9-11 °C", "Chardonnay com abacaxi, manteiga e tosta sutil."),
            new("Domaine Saint-Clair Chablis", "Branco", "Domaine Saint-Clair", "França", "Borgonha", "Chardonnay", 2022, 12.5m, 299.90m, 93, "Ostras, peixes nobres", "9-11 °C", "Chablis clássico: mineralidade de giz, maçã verde e limão siciliano.", true),
            new("Weingut Sonnenhang Riesling Trocken", "Branco", "Weingut Sonnenhang", "Alemanha", "Mosel", "Riesling", 2022, 11.5m, 159.90m, 92, "Culinária asiática", "8-10 °C", "Riesling seco com lima, pêssego branco e notas de ardósia."),
            new("Tenuta San Lorenzo Pinot Grigio", "Branco", "Tenuta San Lorenzo", "Itália", "Veneto", "Pinot Grigio", 2023, 12m, 89.90m, 87, "Antepastos, massas leves", "8-10 °C", "Leve e fresco, pera e amêndoa."),
            new("Vinícola Serra Alta Gewürztraminer", "Branco", "Vinícola Serra Alta", "Brasil", "Serra Gaúcha", "Gewürztraminer", 2023, 12m, 84.90m, 88, "Comida tailandesa", "8-10 °C", "Aromático com lichia, rosas e especiarias."),

            new("Côte Azur Rosé de Provence", "Rosé", "Domaine Côte Azur", "França", "Provence", "Grenache, Cinsault", 2023, 12.5m, 169.90m, 91, "Saladas, peixes, sushi", "8-10 °C", "Rosé pálido e elegante, morango fresco, pêssego e final salino.", true),
            new("Herdade Monte Sereno Rosé", "Rosé", "Herdade Monte Sereno", "Portugal", "Alentejo", "Aragonez, Touriga Nacional", 2024, 12.5m, 79.90m, 87, "Aperitivos, pizzas", "8-10 °C", "Frutado e leve, framboesa e cereja."),
            new("Vinícola Serra Alta Rosé Pinot Noir", "Rosé", "Vinícola Serra Alta", "Brasil", "Serra Gaúcha", "Pinot Noir", 2024, 12m, 69.90m, 86, "Entradas leves", "8-10 °C", "Delicado com morango e acidez refrescante."),

            new("Maison Delacroix Champagne Brut", "Espumante", "Maison Delacroix", "França", "Champagne", "Chardonnay, Pinot Noir, Pinot Meunier", null, 12m, 489.90m, 93, "Celebrações, frutos do mar", "6-8 °C", "Champagne com brioche, maçã assada e perlage fina e persistente.", true),
            new("Serra Alta Nature Método Tradicional", "Espumante", "Vinícola Serra Alta", "Brasil", "Serra Gaúcha", "Chardonnay, Pinot Noir", 2021, 12m, 119.90m, 91, "Canapés, frituras", "6-8 °C", "Espumante brasileiro de 24 meses sobre borras: seco, cítrico e tostado."),
            new("Serra Alta Moscatel", "Espumante", "Vinícola Serra Alta", "Brasil", "Farroupilha", "Moscato Giallo", null, 7.5m, 59.90m, 87, "Sobremesas com frutas", "5-7 °C", "Doce, perfumado e leve; uva fresca e flores brancas.", false, 49.90m),
            new("Tenuta San Lorenzo Prosecco DOC", "Espumante", "Tenuta San Lorenzo", "Itália", "Veneto", "Glera", null, 11m, 99.90m, 88, "Aperitivo, spritz", "6-8 °C", "Prosecco fresco com maçã verde e pera."),
            new("Bodegas Solar Cava Brut Reserva", "Espumante", "Bodegas Solar", "Espanha", "Penedès", "Macabeo, Xarel·lo, Parellada", null, 11.5m, 109.90m, 89, "Tapas, frutos do mar", "6-8 °C", "Cava cremoso com notas de amêndoa e cítricos."),

            new("Quinta do Vale Alto Porto Tawny 10 Anos", "Fortificado", "Quinta do Vale Alto", "Portugal", "Porto", "Touriga Nacional, Tinta Roriz", null, 20m, 259.90m, 92, "Queijos azuis, doces de nozes", "12-14 °C", "Tawny com frutos secos, caramelo e casca de laranja.", true),
            new("Quinta do Vale Alto Porto Ruby", "Fortificado", "Quinta do Vale Alto", "Portugal", "Porto", "Touriga Franca", null, 19.5m, 109.90m, 87, "Chocolate amargo", "14-16 °C", "Frutado e intenso, frutas vermelhas em compota."),
            new("Madeira Reserva 5 Anos Bual", "Fortificado", "Companhia da Ilha", "Portugal", "Madeira", "Bual", null, 19m, 199.90m, 90, "Tortas, foie gras", "12-14 °C", "Madeira meio doce com mel, figo e acidez vivaz."),
        };

        var outros = new[]
        {
            ("Cerveja IPA Artesanal 500ml", "Cervejas", 24.90m, 500),
            ("Cerveja Pilsen Premium 600ml", "Cervejas", 14.90m, 600),
            ("Cerveja Weiss 500ml", "Cervejas", 21.90m, 500),
            ("Gin London Dry 750ml", "Destilados", 149.90m, 750),
            ("Whisky Blended 12 Anos 1L", "Destilados", 219.90m, 1000),
            ("Cachaça Envelhecida Amburana 700ml", "Destilados", 89.90m, 700),
            ("Água com Gás 500ml", "Sem álcool", 4.90m, 500),
            ("Suco de Uva Integral 1L", "Sem álcool", 19.90m, 1000),
            ("Tônica Premium 269ml", "Sem álcool", 7.90m, 269),
        };

        var lista = new List<Produto>();
        var seq = 1;
        foreach (var m in modelos)
        {
            var prefixo = m.Cat switch { "Tinto" => "TIN", "Branco" => "BRA", "Rosé" => "ROS", "Espumante" => "ESP", _ => "FOR" };
            lista.Add(new Produto
            {
                Sku = $"{prefixo}-{seq:D4}",
                CodigoBarras = GerarEan13(seq),
                Nome = m.Nome,
                Descricao = m.Descricao,
                Categoria = cat[m.Cat],
                Produtor = m.Produtor,
                Pais = m.Pais,
                Regiao = m.Regiao,
                Uva = m.Uva,
                Safra = m.Safra,
                TeorAlcoolico = m.Teor,
                VolumeMl = 750,
                Harmonizacao = m.Harmonizacao,
                TemperaturaServico = m.Temp,
                Pontuacao = m.Pontos,
                PrecoVenda = m.Preco,
                PrecoPromocional = m.Promo,
                PrecoCusto = Math.Round(m.Preco * (decimal)(0.48 + _rnd.NextDouble() * 0.12), 2),
                EstoqueMinimo = m.Preco > 300 ? 4 : m.Preco > 150 ? 8 : 12,
                VisivelLoja = true,
                Destaque = m.Destaque
            });
            seq++;
        }
        foreach (var (nome, c, preco, volume) in outros)
        {
            lista.Add(new Produto
            {
                Sku = $"OUT-{seq:D4}",
                CodigoBarras = GerarEan13(seq),
                Nome = nome,
                Categoria = cat[c],
                VolumeMl = volume,
                PrecoVenda = preco,
                PrecoCusto = Math.Round(preco * 0.55m, 2),
                EstoqueMinimo = 24,
                VisivelLoja = false
            });
            seq++;
        }
        db.Produtos.AddRange(lista);
        return lista;
    }

    private List<Cliente> CriarClientes()
    {
        string[] nomes = ["Ana", "Bruno", "Camila", "Daniel", "Eduarda", "Fernando", "Gabriela", "Henrique", "Isabela", "João", "Karina", "Lucas",
            "Marina", "Nicolas", "Olívia", "Pedro", "Rafaela", "Samuel", "Tatiane", "Vinícius", "Larissa", "Rodrigo", "Patrícia", "Gustavo"];
        string[] sobrenomes = ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Lima",
            "Araújo", "Fernandes", "Carvalho", "Gomes", "Martins", "Rocha", "Ribeiro", "Barbosa"];
        string[] bairros = ["Centro", "Jardim Soto", "Parque Iracema", "Vila Rodrigues", "Higienópolis", "Jardim Alpino"];

        var lista = new List<Cliente>();
        var hoje = calendario.Hoje;
        for (var i = 0; i < 80; i++)
        {
            var nome = $"{nomes[_rnd.Next(nomes.Length)]} {sobrenomes[_rnd.Next(sobrenomes.Length)]}";
            var email = $"{Normalizar(nome).Replace(' ', '.')}{i}@email.com";
            lista.Add(new Cliente
            {
                Nome = nome,
                CpfCnpj = GerarCpf(),
                Email = email,
                Telefone = $"(17) 9{_rnd.Next(8000, 9999)}-{_rnd.Next(1000, 9999)}",
                DataNascimento = hoje.AddYears(-_rnd.Next(22, 70)).AddDays(-_rnd.Next(0, 365)),
                AceitaMarketing = _rnd.NextDouble() < 0.6,
                Endereco = new Endereco
                {
                    Logradouro = $"Rua {sobrenomes[_rnd.Next(sobrenomes.Length)]}", Numero = _rnd.Next(10, 2500).ToString(),
                    Bairro = bairros[_rnd.Next(bairros.Length)], Cidade = "Catanduva", Uf = "SP", Cep = "15800-000"
                }
            });
        }

        // Cliente de demonstração da loja online
        lista.Add(new Cliente
        {
            Nome = "Cliente Demonstração",
            Email = "cliente@vinobebidas.com.br",
            CpfCnpj = GerarCpf(),
            Telefone = "(17) 99999-0000",
            DataNascimento = new DateOnly(1990, 5, 20),
            SenhaHash = senhas.Gerar(SenhaDemo),
            AceitaMarketing = true,
            Endereco = new Endereco { Logradouro = "Rua Minas Gerais", Numero = "450", Bairro = "Centro", Cidade = "Catanduva", Uf = "SP", Cep = "15800-120" }
        });

        db.Clientes.AddRange(lista);
        return lista;
    }

    private void CriarSaldos(List<Produto> produtos, Dictionary<string, Deposito> depositos, Usuario estoquista)
    {
        var dataImplantacao = calendario.InicioDoDiaUtc(calendario.Hoje.AddDays(-1)).AddHours(8);
        var movs = depositos.Values.ToDictionary(d => d.Id, d => new Movimentacao
        {
            Tipo = TipoMovimentacao.Entrada,
            Data = dataImplantacao,
            DepositoDestinoId = d.Id,
            UsuarioId = estoquista.Id,
            NumeroDocumento = "IMPLANTACAO",
            Observacao = "Saldo inicial de implantação do sistema"
        });

        foreach (var p in produtos)
        {
            var caro = p.PrecoVenda > 300;
            // Alguns itens propositalmente baixos para aparecerem no alerta de ruptura
            var baixo = _rnd.NextDouble() < 0.15;
            var qtds = new Dictionary<string, int>
            {
                ["cd"] = baixo ? _rnd.Next(0, 6) : caro ? _rnd.Next(10, 30) : _rnd.Next(40, 160),
                ["centro"] = baixo ? _rnd.Next(0, 4) : caro ? _rnd.Next(3, 10) : _rnd.Next(12, 48),
                ["shopping"] = baixo ? _rnd.Next(0, 3) : caro ? _rnd.Next(2, 8) : _rnd.Next(8, 36),
            };
            foreach (var (chave, qtd) in qtds)
            {
                var dep = depositos[chave];
                db.Saldos.Add(new SaldoEstoque { ProdutoId = p.Id, DepositoId = dep.Id, Quantidade = qtd, AtualizadoEm = dataImplantacao });
                if (qtd > 0)
                    movs[dep.Id].Itens.Add(new ItemMovimentacao { ProdutoId = p.Id, Quantidade = qtd, CustoUnitario = p.PrecoCusto });
            }
        }
        db.Movimentacoes.AddRange(movs.Values.Where(m => m.Itens.Count > 0));
    }

    // ───────────────────────── Histórico de vendas ─────────────────────────

    private async Task CriarHistoricoVendasAsync(List<Produto> produtos, Dictionary<string, Deposito> depositos, List<Cliente> clientes,
        Dictionary<string, Usuario> usuarios, CancellationToken ct)
    {
        const int dias = 180;
        var hoje = calendario.Hoje;
        var agoraLocal = calendario.AgoraLocal;
        var pesos = produtos.Select(p => p.VisivelLoja ? 60.0 / Math.Sqrt((double)p.PrecoVenda) * (p.Destaque ? 1.6 : 1) : 1.4).ToArray();
        var somaPesos = pesos.Sum();
        var vinhos = produtos.Where(p => p.VisivelLoja).ToList();
        double[] basePorDia = [14, 18, 20, 22, 26, 38, 46]; // domingo..sábado

        var receitaPorDia = new Dictionary<DateOnly, decimal>();
        var lote = 0;

        for (var d = dias; d >= 0; d--)
        {
            var dia = hoje.AddDays(-d);
            var progresso = (dias - d) / (double)dias;
            var tendencia = 1 + 0.28 * progresso;                        // crescimento no semestre
            var sazonal = 1 + 0.12 * Math.Sin((dia.DayOfYear / 365.0) * 2 * Math.PI - 1.2); // inverno/fim de ano mais forte
            var quinzena = dia.Day <= 10 ? 1.12 : 1.0;                  // salário no início do mês
            var qtdVendas = (int)Math.Round(basePorDia[(int)dia.DayOfWeek] * tendencia * sazonal * quinzena * (0.8 + _rnd.NextDouble() * 0.4));

            for (var n = 0; n < qtdVendas; n++)
            {
                var hora = SortearHora();
                var momentoLocal = dia.ToDateTime(new TimeOnly(hora, _rnd.Next(0, 60), _rnd.Next(0, 60)));
                if (d == 0 && momentoLocal > agoraLocal) continue; // hoje: só até agora

                var canalSorteio = _rnd.NextDouble();
                var canal = canalSorteio < 0.70 ? CanalVenda.Loja : canalSorteio < 0.88 ? CanalVenda.Online : CanalVenda.Consultor;
                var deposito = canal switch
                {
                    CanalVenda.Online => depositos["cd"],
                    CanalVenda.Consultor => depositos["centro"],
                    _ => _rnd.NextDouble() < 0.6 ? depositos["centro"] : depositos["shopping"]
                };

                var venda = new Venda
                {
                    Data = TimeZoneInfo.ConvertTimeToUtc(momentoLocal, calendario.Fuso),
                    Canal = canal,
                    DepositoId = deposito.Id,
                    UsuarioId = canal == CanalVenda.Consultor ? usuarios["vendedor"].Id : usuarios["caixa"].Id,
                    ClienteId = canal == CanalVenda.Online || _rnd.NextDouble() < 0.5 ? clientes[_rnd.Next(clientes.Count)].Id : null
                };

                var qtdItens = _rnd.NextDouble() switch { < 0.45 => 1, < 0.78 => 2, < 0.93 => 3, _ => 4 };
                var escolhidos = new HashSet<int>();
                for (var k = 0; k < qtdItens; k++)
                {
                    var produto = canal == CanalVenda.Online ? vinhos[_rnd.Next(vinhos.Count)] : Sortear(produtos, pesos, somaPesos);
                    if (!escolhidos.Add(produto.Id)) continue;
                    var espumanteNoFimDeAno = produto.Categoria?.Nome == "Espumante" && dia.Month is 12 or 1;
                    var qtd = _rnd.NextDouble() < 0.7 ? 1 : _rnd.Next(2, espumanteNoFimDeAno ? 7 : 4);
                    venda.Itens.Add(new ItemVenda
                    {
                        ProdutoId = produto.Id,
                        Quantidade = qtd,
                        PrecoUnitario = produto.PrecoAtual,
                        CustoUnitario = produto.PrecoCusto,
                        Desconto = _rnd.NextDouble() < 0.08 ? Math.Round(produto.PrecoAtual * qtd * 0.05m, 2) : 0
                    });
                }
                venda.CalcularTotais();
                venda.Pagamentos.Add(new PagamentoVenda { Forma = SortearForma(canal), Valor = venda.Total });
                db.Vendas.Add(venda);
                receitaPorDia[dia] = receitaPorDia.GetValueOrDefault(dia) + venda.Total;
                lote++;
            }

            if (lote > 800)
            {
                await db.SaveChangesAsync(ct);
                db.ChangeTracker.Clear();
                lote = 0;
            }
        }
        await db.SaveChangesAsync(ct);
        db.ChangeTracker.Clear();

        // Receita consolidada por dia no financeiro (vendas novas geram um lançamento por venda)
        foreach (var (dia, valor) in receitaPorDia)
        {
            db.Lancamentos.Add(new LancamentoFinanceiro
            {
                Tipo = TipoLancamento.Receita,
                Categoria = CategoriaLancamento.Venda,
                Descricao = $"Vendas do dia {dia:dd/MM/yyyy} (histórico)",
                Valor = valor,
                Competencia = new DateOnly(dia.Year, dia.Month, 1),
                Vencimento = dia,
                DataPagamento = dia,
                Status = StatusLancamento.Pago
            });
        }
        await db.SaveChangesAsync(ct);
        db.ChangeTracker.Clear();
    }

    private int SortearHora()
    {
        // Pico no fim da tarde
        double[] pesos = [2, 3, 4, 5, 5, 5, 6, 8, 11, 13, 12, 9, 5]; // 9h..21h
        var total = pesos.Sum();
        var r = _rnd.NextDouble() * total;
        for (var i = 0; i < pesos.Length; i++)
        {
            r -= pesos[i];
            if (r <= 0) return 9 + i;
        }
        return 18;
    }

    private FormaPagamento SortearForma(CanalVenda canal)
    {
        var r = _rnd.NextDouble();
        if (canal == CanalVenda.Online) return r < 0.55 ? FormaPagamento.Pix : FormaPagamento.CartaoCredito;
        return r switch
        {
            < 0.35 => FormaPagamento.CartaoCredito,
            < 0.62 => FormaPagamento.Pix,
            < 0.85 => FormaPagamento.CartaoDebito,
            _ => FormaPagamento.Dinheiro
        };
    }

    private Produto Sortear(List<Produto> produtos, double[] pesos, double soma)
    {
        var r = _rnd.NextDouble() * soma;
        for (var i = 0; i < produtos.Count; i++)
        {
            r -= pesos[i];
            if (r <= 0) return produtos[i];
        }
        return produtos[^1];
    }

    // ───────────────────────── Financeiro ─────────────────────────

    private void CriarLancamentos(Dictionary<string, Setor> setores, List<Fornecedor> fornecedores)
    {
        var hoje = calendario.Hoje;
        var inicio = new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(-6);

        for (var mes = inicio; mes <= new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(1); mes = mes.AddMonths(1))
        {
            var kwh = _rnd.Next(4800, 6600);
            var m3 = _rnd.Next(36, 54);
            Add(TipoLancamento.Despesa, CategoriaLancamento.EnergiaEletrica, $"Energia elétrica {mes:MM/yyyy}", Math.Round(kwh * 0.72m, 2), mes.AddDays(9), setores["Administrativo"], kwh, "kWh");
            Add(TipoLancamento.Despesa, CategoriaLancamento.Agua, $"Água e esgoto {mes:MM/yyyy}", Math.Round(m3 * 10.4m, 2), mes.AddDays(14), setores["Administrativo"], m3, "m³");
            Add(TipoLancamento.Despesa, CategoriaLancamento.Aluguel, $"Aluguel Loja Shopping {mes:MM/yyyy}", 12800m, mes.AddDays(4), setores["Loja Shopping"]);
            Add(TipoLancamento.Despesa, CategoriaLancamento.FolhaPagamento, $"Folha de pagamento {mes:MM/yyyy}", 48750m + _rnd.Next(-800, 1500), mes.AddDays(4), setores["Financeiro"]);
            Add(TipoLancamento.Despesa, CategoriaLancamento.Impostos, $"Simples Nacional {mes:MM/yyyy}", 9800m + _rnd.Next(-900, 2400), mes.AddDays(19), setores["Financeiro"]);
            if (mes.Month is >= 2 and <= 11)
                Add(TipoLancamento.Despesa, CategoriaLancamento.IPTU, $"IPTU parcela {mes.Month - 1}/10", 1250m, mes.AddDays(19), setores["Administrativo"]);
            Add(TipoLancamento.Despesa, CategoriaLancamento.Marketing, $"Mídia e redes sociais {mes:MM/yyyy}", 2500m, mes.AddDays(24), setores["Marketing"]);
            for (var c = 0; c < 2; c++)
            {
                var f = fornecedores[_rnd.Next(fornecedores.Count)];
                var l = Add(TipoLancamento.Despesa, CategoriaLancamento.CompraMercadoria, $"NF {_rnd.Next(10000, 99999)} - {f.NomeFantasia}",
                    Math.Round(24000m + (decimal)_rnd.NextDouble() * 36000m, 2), mes.AddDays(c == 0 ? 11 : 26), setores["Logística"]);
                l.FornecedorId = f.Id;
            }
            if (_rnd.NextDouble() < 0.7)
                Add(TipoLancamento.Despesa, CategoriaLancamento.Manutencao, "Manutenção da câmara climatizada", Math.Round(800m + (decimal)_rnd.NextDouble() * 2200m, 2), mes.AddDays(_rnd.Next(5, 27)), setores["Manutenção"]);
        }

        // Situações para os alertas do diretor financeiro
        var atrasado = Add(TipoLancamento.Despesa, CategoriaLancamento.Manutencao, "Conserto do ar-condicionado Loja Centro", 1890m, hoje.AddDays(-3), setores["Manutenção"]);
        atrasado.Status = StatusLancamento.Aberto;
        atrasado.DataPagamento = null;
        Add(TipoLancamento.Receita, CategoriaLancamento.Outros, "Evento corporativo - degustação (a receber)", 6400m, hoje.AddDays(5), setores["Comercial"]);

        LancamentoFinanceiro Add(TipoLancamento tipo, CategoriaLancamento cat, string desc, decimal valor, DateOnly venc, Setor setor, decimal? consumo = null, string? unidade = null)
        {
            var l = new LancamentoFinanceiro
            {
                Tipo = tipo, Categoria = cat, Descricao = desc, Valor = valor, Vencimento = venc,
                Competencia = new DateOnly(venc.Year, venc.Month, 1), SetorId = setor.Id,
                ConsumoQuantidade = consumo, ConsumoUnidade = unidade
            };
            if (venc < hoje) l.Pagar(venc);
            db.Lancamentos.Add(l);
            return l;
        }
    }

    private async Task CriarPedidosAbertosAsync(List<Produto> produtos, Dictionary<string, Deposito> depositos, List<Cliente> clientes, CancellationToken ct)
    {
        var vinhos = produtos.Where(p => p.VisivelLoja).ToList();
        var agora = calendario.AgoraUtc;
        var cenarios = new[]
        {
            (TipoPedido.Reserva, ModalidadeEntrega.Retirada, StatusPedido.Confirmado, "centro"),
            (TipoPedido.Compra, ModalidadeEntrega.Entrega, StatusPedido.Confirmado, "cd"),
            (TipoPedido.Compra, ModalidadeEntrega.Entrega, StatusPedido.EmSeparacao, "cd"),
            (TipoPedido.Compra, ModalidadeEntrega.Retirada, StatusPedido.ProntoParaRetirada, "shopping"),
            (TipoPedido.Reserva, ModalidadeEntrega.Retirada, StatusPedido.Confirmado, "shopping"),
        };

        var i = 0;
        foreach (var (tipo, modalidade, status, dep) in cenarios)
        {
            var cliente = clientes[_rnd.Next(clientes.Count - 1)];
            var deposito = depositos[dep];
            var pedido = new Pedido
            {
                ClienteId = cliente.Id, Tipo = tipo, Modalidade = modalidade, Status = status, DepositoId = deposito.Id,
                FormaPagamento = tipo == TipoPedido.Reserva ? FormaPagamento.PagamentoNaEntrega : FormaPagamento.Pix,
                EnderecoEntrega = modalidade == ModalidadeEntrega.Entrega ? cliente.Endereco.ToString() : null,
                CriadoEm = agora.AddHours(-(i * 5 + 2)),
                ValidoAte = tipo == TipoPedido.Reserva ? agora.AddDays(2) : null
            };
            var saldos = await db.Saldos.Where(s => s.DepositoId == deposito.Id && s.Quantidade - s.Reservado >= 2).Select(s => s.ProdutoId).ToListAsync(ct);
            foreach (var produto in vinhos.Where(v => saldos.Contains(v.Id)).OrderBy(_ => _rnd.Next()).Take(_rnd.Next(1, 4)))
            {
                var saldo = await db.Saldos.FirstAsync(s => s.ProdutoId == produto.Id && s.DepositoId == deposito.Id, ct);
                saldo.Reservar(1, produto.Nome);
                pedido.Itens.Add(new ItemPedido { ProdutoId = produto.Id, Quantidade = 1, PrecoUnitario = produto.PrecoAtual });
            }
            if (pedido.Itens.Count == 0) continue;
            pedido.CalcularTotais();
            if (modalidade == ModalidadeEntrega.Entrega && pedido.Subtotal < PedidoService.FreteGratisAcimaDe)
            {
                pedido.TaxaEntrega = PedidoService.TaxaEntregaPadrao;
                pedido.CalcularTotais();
            }
            db.Pedidos.Add(pedido);
            i++;
        }
        await db.SaveChangesAsync(ct);
    }

    // ───────────────────────── Utilitários ─────────────────────────

    private string GerarCpf()
    {
        while (true)
        {
            var d = Enumerable.Range(0, 9).Select(_ => _rnd.Next(10)).ToList();
            for (var len = 9; len <= 10; len++)
            {
                var soma = 0;
                for (var i = 0; i < len; i++) soma += d[i] * (len + 1 - i);
                var r = soma % 11;
                d.Add(r < 2 ? 0 : 11 - r);
            }
            var cpf = string.Concat(d);
            if (Documentos.CpfValido(cpf)) return cpf;
        }
    }

    private string GerarCnpj()
    {
        var d = Enumerable.Range(0, 8).Select(_ => _rnd.Next(10)).Concat([0, 0, 0, 1]).ToList();
        int[] p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        int[] p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        foreach (var pesos in new[] { p1, p2 })
        {
            var soma = pesos.Select((p, i) => p * d[i]).Sum();
            var r = soma % 11;
            d.Add(r < 2 ? 0 : 11 - r);
        }
        return string.Concat(d);
    }

    /// <summary>EAN-13 com prefixo 789 (Brasil) e dígito verificador válido.</summary>
    private static string GerarEan13(int sequencia)
    {
        var corpo = $"789{7310:D4}{sequencia:D5}";
        var soma = corpo.Select((c, i) => (c - '0') * (i % 2 == 0 ? 1 : 3)).Sum();
        var dv = (10 - soma % 10) % 10;
        return corpo + dv;
    }

    private static string Normalizar(string texto)
    {
        var semAcento = new string(texto.Normalize(System.Text.NormalizationForm.FormD)
            .Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            .ToArray());
        return semAcento.ToLowerInvariant();
    }
}
