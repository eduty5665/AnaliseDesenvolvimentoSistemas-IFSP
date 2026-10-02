using Microsoft.EntityFrameworkCore;
using VinoBebidas.Contracts;
using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Entities;
using VinoBebidas.Infrastructure.Data;

namespace VinoBebidas.Infrastructure.Services;

public record UsuarioAutenticado(int Id, string Nome, string Tipo, string? Perfil, string? Email);

/// <summary>Valida credenciais e registra cada tentativa de acesso (RF02).</summary>
public class AuthService(AppDbContext db, SenhaService senhas, Calendario calendario)
{
    /// <summary>Login de funcionário: aceita o login ou o CPF (conforme especificação do caso de uso Login).</summary>
    public async Task<UsuarioAutenticado?> AutenticarFuncionarioAsync(string login, string senha, string? ip, string origem, CancellationToken ct = default)
    {
        var informado = (login ?? string.Empty).Trim();
        var cpf = Documentos.SomenteDigitos(informado);
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Login == informado.ToLower() || (cpf.Length == 11 && u.Cpf == cpf), ct);

        var ok = usuario is { Ativo: true } && senhas.Conferir(usuario.SenhaHash, senha ?? string.Empty);
        db.RegistrosAcesso.Add(new RegistroAcesso
        {
            UsuarioId = usuario?.Id,
            LoginInformado = informado.Length > 60 ? informado[..60] : informado,
            Sucesso = ok,
            Ip = ip,
            Origem = origem,
            CriadoEm = calendario.AgoraUtc
        });
        if (ok) usuario!.UltimoAcesso = calendario.AgoraUtc;
        await db.SaveChangesAsync(ct);

        return ok ? new UsuarioAutenticado(usuario!.Id, usuario.NomeCompleto, TiposSessao.Funcionario, usuario.Perfil.ToString(), usuario.Email) : null;
    }

    public async Task<UsuarioAutenticado?> AutenticarClienteAsync(string email, string senha, string? ip, CancellationToken ct = default)
    {
        var e = (email ?? string.Empty).Trim().ToLowerInvariant();
        var cliente = await db.Clientes.FirstOrDefaultAsync(c => c.Email == e, ct);
        var ok = cliente is { Ativo: true, SenhaHash: not null } && senhas.Conferir(cliente.SenhaHash!, senha ?? string.Empty);
        db.RegistrosAcesso.Add(new RegistroAcesso
        {
            ClienteId = cliente?.Id,
            LoginInformado = e.Length > 60 ? e[..60] : e,
            Sucesso = ok,
            Ip = ip,
            Origem = "loja",
            CriadoEm = calendario.AgoraUtc
        });
        await db.SaveChangesAsync(ct);
        return ok ? new UsuarioAutenticado(cliente!.Id, cliente.Nome, TiposSessao.Cliente, null, cliente.Email) : null;
    }

    public async Task<UsuarioAutenticado> RegistrarClienteAsync(RegistrarClienteRequest r, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(r.Nome)) throw new RegraNegocioException("Informe o nome.");
        var email = (r.Email ?? string.Empty).Trim().ToLowerInvariant();
        if (!email.Contains('@') || email.Length < 5) throw new RegraNegocioException("E-mail inválido.");
        Cliente.ValidarMaioridade(r.DataNascimento, calendario.Hoje);
        var cpf = Documentos.SomenteDigitos(r.Cpf);
        if (cpf.Length > 0 && !Documentos.CpfValido(cpf)) throw new RegraNegocioException("CPF inválido.");

        var existente = await db.Clientes.FirstOrDefaultAsync(c => c.Email == email, ct);
        if (existente is { SenhaHash: not null }) throw new RegraNegocioException("Já existe uma conta com este e-mail.");

        // Cliente já cadastrado no balcão (sem senha) ganha acesso à loja online.
        var cliente = existente ?? new Cliente();
        cliente.Nome = r.Nome.Trim();
        cliente.Email = email;
        cliente.CpfCnpj = cpf.Length > 0 ? cpf : cliente.CpfCnpj;
        cliente.Telefone = r.Telefone ?? cliente.Telefone;
        cliente.DataNascimento = r.DataNascimento;
        cliente.AceitaMarketing = r.AceitaMarketing;
        if (r.Endereco is not null) cliente.Endereco = r.Endereco.ToEntity();
        cliente.SenhaHash = senhas.Gerar(r.Senha);
        if (existente is null) db.Clientes.Add(cliente);
        await db.SaveChangesAsync(ct);

        return new UsuarioAutenticado(cliente.Id, cliente.Nome, TiposSessao.Cliente, null, cliente.Email);
    }
}
