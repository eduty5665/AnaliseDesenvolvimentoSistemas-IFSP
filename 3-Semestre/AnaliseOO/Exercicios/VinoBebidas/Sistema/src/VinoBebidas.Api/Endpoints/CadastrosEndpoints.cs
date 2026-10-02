using Microsoft.EntityFrameworkCore;
using VinoBebidas.Api.Auth;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Infrastructure.Data;
using VinoBebidas.Infrastructure.Services;

namespace VinoBebidas.Api.Endpoints;

/// <summary>Clientes, fornecedores, usuários (RF01), setores e registro de acessos (RF02).</summary>
public static class CadastrosEndpoints
{
    public static void MapCadastros(this IEndpointRouteBuilder app)
    {
        // ── Clientes ──
        var cli = app.MapGroup("/api/clientes").WithTags("Clientes").RequireAuthorization(Politicas.Funcionario);

        cli.MapGet("/", async (AppDbContext db, string? busca, int? limite, CancellationToken ct) =>
        {
            var q = db.Clientes.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(busca))
            {
                var padrao = Busca.Padrao(busca);
                var digitos = Documentos.SomenteDigitos(busca);
                q = q.Where(c => EF.Functions.Like(c.Nome, padrao) || EF.Functions.Like(c.Email!, padrao) ||
                                 (digitos.Length >= 3 && EF.Functions.Like(c.CpfCnpj!, "%" + digitos + "%")));
            }
            var lista = await q.OrderBy(c => c.Nome).Take(Math.Clamp(limite ?? 100, 1, 1000)).ToListAsync(ct);
            return Results.Ok(lista.Select(c => c.ToDto()));
        });

        cli.MapGet("/{id:int}", async (int id, AppDbContext db, CancellationToken ct) =>
            await db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct) is { } c ? Results.Ok(c.ToDto()) : Results.NotFound());

        cli.MapPost("/", async (ClienteSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var c = new Cliente();
            await AplicarCliente(c, r, db, ct);
            db.Clientes.Add(c);
            await db.SaveChangesAsync(ct);
            return Results.Ok(c.ToDto());
        });

        cli.MapPut("/{id:int}", async (int id, ClienteSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var c = await db.Clientes.FindAsync([id], ct) ?? throw new NaoEncontradoException("Cliente não encontrado.");
            await AplicarCliente(c, r, db, ct);
            await db.SaveChangesAsync(ct);
            return Results.Ok(c.ToDto());
        });

        // ── Fornecedores ──
        var forn = app.MapGroup("/api/fornecedores").WithTags("Fornecedores").RequireAuthorization(Politicas.Funcionario);

        forn.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            Results.Ok((await db.Fornecedores.AsNoTracking().OrderBy(f => f.RazaoSocial).ToListAsync(ct)).Select(f => f.ToDto())));

        forn.MapPost("/", async (FornecedorSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var f = new Fornecedor();
            AplicarFornecedor(f, r);
            db.Fornecedores.Add(f);
            await db.SaveChangesAsync(ct);
            return Results.Ok(f.ToDto());
        }).RequireAuthorization(Politicas.Estoque);

        forn.MapPut("/{id:int}", async (int id, FornecedorSalvarRequest r, AppDbContext db, CancellationToken ct) =>
        {
            var f = await db.Fornecedores.FindAsync([id], ct) ?? throw new NaoEncontradoException("Fornecedor não encontrado.");
            AplicarFornecedor(f, r);
            await db.SaveChangesAsync(ct);
            return Results.Ok(f.ToDto());
        }).RequireAuthorization(Politicas.Estoque);

        // ── Setores ──
        var set = app.MapGroup("/api/setores").WithTags("Usuários e setores").RequireAuthorization(Politicas.Funcionario);
        set.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            Results.Ok((await db.Setores.AsNoTracking().OrderBy(s => s.Nome).ToListAsync(ct)).Select(s => s.ToDto())));
        set.MapPost("/", async (SetorDto r, AppDbContext db, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(r.Nome)) throw new RegraNegocioException("Informe o nome do setor.");
            var s = new Setor { Nome = r.Nome.Trim(), Descricao = r.Descricao };
            db.Setores.Add(s);
            await db.SaveChangesAsync(ct);
            return Results.Ok(s.ToDto());
        }).RequireAuthorization(Politicas.Administrador);

        // ── Usuários (funcionários) ──
        var usu = app.MapGroup("/api/usuarios").WithTags("Usuários e setores").RequireAuthorization(Politicas.Administrador);

        usu.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
            Results.Ok((await db.Usuarios.AsNoTracking().Include(u => u.Setor).OrderBy(u => u.Nome).ToListAsync(ct)).Select(u => u.ToDto())));

        usu.MapPost("/", async (UsuarioSalvarRequest r, AppDbContext db, SenhaService senhas, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(r.Senha)) throw new RegraNegocioException("Informe a senha inicial.");
            var u = new Usuario();
            await AplicarUsuario(u, r, db, senhas, ct);
            db.Usuarios.Add(u);
            await db.SaveChangesAsync(ct);
            return Results.Ok(u.ToDto());
        });

        usu.MapPut("/{id:int}", async (int id, UsuarioSalvarRequest r, AppDbContext db, SenhaService senhas, CancellationToken ct) =>
        {
            var u = await db.Usuarios.FindAsync([id], ct) ?? throw new NaoEncontradoException("Usuário não encontrado.");
            await AplicarUsuario(u, r, db, senhas, ct);
            await db.SaveChangesAsync(ct);
            return Results.Ok(u.ToDto());
        });

        usu.MapGet("/acessos", async (AppDbContext db, int? usuarioId, int? limite, CancellationToken ct) =>
        {
            var q = db.RegistrosAcesso.AsNoTracking().Where(r => r.UsuarioId != null || r.ClienteId == null);
            if (usuarioId is not null) q = q.Where(r => r.UsuarioId == usuarioId);
            var lista = await q.OrderByDescending(r => r.CriadoEm).Take(Math.Clamp(limite ?? 200, 1, 2000)).ToListAsync(ct);
            var ids = lista.Where(r => r.UsuarioId != null).Select(r => r.UsuarioId!.Value).Distinct().ToList();
            var nomes = await db.Usuarios.AsNoTracking().Where(u => ids.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Nome + " " + u.Sobrenome, ct);
            return Results.Ok(lista.Select(r => new RegistroAcessoDto(r.Id, r.CriadoEm, r.LoginInformado, r.Sucesso, r.Ip,
                r.UsuarioId is null ? null : nomes.GetValueOrDefault(r.UsuarioId.Value), r.Origem)));
        }).WithSummary("Registro de logins (controle de acesso / ponto)");
    }

    private static async Task AplicarCliente(Cliente c, ClienteSalvarRequest r, AppDbContext db, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(r.Nome)) throw new RegraNegocioException("Informe o nome do cliente.");
        var doc = Documentos.SomenteDigitos(r.CpfCnpj);
        if (doc.Length == 11 && !Documentos.CpfValido(doc)) throw new RegraNegocioException("CPF inválido.");
        if (doc.Length == 14 && !Documentos.CnpjValido(doc)) throw new RegraNegocioException("CNPJ inválido.");
        if (doc.Length is > 0 and not (11 or 14)) throw new RegraNegocioException("Informe CPF (11 dígitos) ou CNPJ (14 dígitos).");
        var email = string.IsNullOrWhiteSpace(r.Email) ? null : r.Email.Trim().ToLowerInvariant();
        if (email is not null && await db.Clientes.AnyAsync(x => x.Email == email && x.Id != c.Id, ct))
            throw new RegraNegocioException("E-mail já cadastrado para outro cliente.");
        c.Nome = r.Nome.Trim();
        c.CpfCnpj = doc.Length > 0 ? doc : null;
        c.Email = email;
        c.Telefone = r.Telefone;
        c.DataNascimento = r.DataNascimento;
        c.Endereco = r.Endereco.ToEntity();
        c.AceitaMarketing = r.AceitaMarketing;
        c.Ativo = r.Ativo;
    }

    private static void AplicarFornecedor(Fornecedor f, FornecedorSalvarRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.RazaoSocial)) throw new RegraNegocioException("Informe a razão social.");
        var cnpj = Documentos.SomenteDigitos(r.Cnpj);
        if (!Documentos.CnpjValido(cnpj)) throw new RegraNegocioException("CNPJ inválido.");
        f.RazaoSocial = r.RazaoSocial.Trim();
        f.NomeFantasia = r.NomeFantasia;
        f.Cnpj = cnpj;
        f.Email = r.Email;
        f.Telefone = r.Telefone;
        f.Contato = r.Contato;
        f.Ativo = r.Ativo;
    }

    private static async Task AplicarUsuario(Usuario u, UsuarioSalvarRequest r, AppDbContext db, SenhaService senhas, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(r.Nome) || string.IsNullOrWhiteSpace(r.Login)) throw new RegraNegocioException("Nome e login são obrigatórios.");
        var cpf = Documentos.SomenteDigitos(r.Cpf);
        if (!Documentos.CpfValido(cpf)) throw new RegraNegocioException("CPF inválido.");
        var login = r.Login.Trim().ToLowerInvariant();
        if (await db.Usuarios.AnyAsync(x => (x.Login == login || x.Cpf == cpf) && x.Id != u.Id, ct))
            throw new RegraNegocioException("Já existe usuário com este login ou CPF.");
        u.Nome = r.Nome.Trim();
        u.Sobrenome = r.Sobrenome.Trim();
        u.Cpf = cpf;
        u.Email = r.Email.Trim();
        u.Login = login;
        u.Perfil = r.Perfil;
        u.Cargo = r.Cargo;
        u.Salario = r.Salario;
        u.HorasSemanais = r.HorasSemanais;
        u.Telefone = r.Telefone;
        u.DataNascimento = r.DataNascimento;
        u.SetorId = r.SetorId;
        u.Ativo = r.Ativo;
        if (!string.IsNullOrWhiteSpace(r.Senha)) u.SenhaHash = senhas.Gerar(r.Senha);
    }
}
