using VinoBebidas.Domain.Common;
using VinoBebidas.Domain.Enums;

namespace VinoBebidas.Domain.Entities;

/// <summary>Funcionário que acessa o ERP/PDV e o painel (classe "Usuário" do diagrama).</summary>
public class Usuario : Entidade
{
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string? Rg { get; set; }
    public string? EmissorRg { get; set; }
    public string? UfRg { get; set; }
    public DateOnly? DataNascimento { get; set; }
    public string? Telefone { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Login { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public PerfilUsuario Perfil { get; set; }
    public string? Cargo { get; set; }
    public decimal Salario { get; set; }
    public int HorasSemanais { get; set; } = 44;
    public Endereco Endereco { get; set; } = new();
    public int? SetorId { get; set; }
    public Setor? Setor { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime? UltimoAcesso { get; set; }

    public string NomeCompleto => $"{Nome} {Sobrenome}".Trim();
}

/// <summary>Endereço (tipo complexo/owned, reutilizado por várias entidades).</summary>
public class Endereco
{
    public string? Cep { get; set; }
    public string? Logradouro { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? Uf { get; set; }

    public override string ToString() =>
        string.Join(", ", new[] { Logradouro, Numero, Complemento, Bairro, Cidade, Uf, Cep }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
}

/// <summary>Registro de login (RF02 - Controle de acesso / ponto).</summary>
public class RegistroAcesso : Entidade
{
    public int? UsuarioId { get; set; }
    public int? ClienteId { get; set; }
    public string LoginInformado { get; set; } = string.Empty;
    public bool Sucesso { get; set; }
    public string? Ip { get; set; }
    public string Origem { get; set; } = "api";
}

public class Setor : Entidade
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
}

public class Cliente : Entidade
{
    public const int IdadeMinima = 18;

    public string Nome { get; set; } = string.Empty;
    public string? CpfCnpj { get; set; }
    public string? Email { get; set; }
    public string? Telefone { get; set; }
    public DateOnly? DataNascimento { get; set; }
    /// <summary>Preenchido apenas para clientes com conta na loja online.</summary>
    public string? SenhaHash { get; set; }
    public Endereco Endereco { get; set; } = new();
    public bool AceitaMarketing { get; set; }
    public bool Ativo { get; set; } = true;

    public static int CalcularIdade(DateOnly nascimento, DateOnly hoje)
    {
        var idade = hoje.Year - nascimento.Year;
        if (nascimento > hoje.AddYears(-idade)) idade--;
        return idade;
    }

    /// <summary>Venda de bebida alcoólica é proibida para menores de 18 anos (Lei 13.106/2015).</summary>
    public static void ValidarMaioridade(DateOnly? nascimento, DateOnly hoje)
    {
        if (nascimento is null)
            throw new RegraNegocioException("Informe a data de nascimento.");
        if (CalcularIdade(nascimento.Value, hoje) < IdadeMinima)
            throw new RegraNegocioException("A venda de bebidas alcoólicas é permitida apenas para maiores de 18 anos.");
    }
}

public class Fornecedor : Entidade
{
    public string RazaoSocial { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
    public string Cnpj { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefone { get; set; }
    public string? Contato { get; set; }
    public bool Ativo { get; set; } = true;
}

/// <summary>Dados bancários de favorecidos (classe "Cadastro Bancário" / caso de uso CadastrarDadosBancarios).</summary>
public class CadastroBancario : Entidade
{
    public string NomeFavorecido { get; set; } = string.Empty;
    public string CpfCnpj { get; set; } = string.Empty;
    public string Banco { get; set; } = string.Empty;
    public string Agencia { get; set; } = string.Empty;
    public string Conta { get; set; } = string.Empty;
    public string? ChavePix { get; set; }
    public int? UsuarioId { get; set; }
    public int? FornecedorId { get; set; }
}
