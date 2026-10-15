namespace VinoBebidas.Domain.Common;

public abstract class Entidade
{
    public int Id { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}

/// <summary>Violação de regra de negócio. A API converte em HTTP 400/409 com a mensagem.</summary>
public class RegraNegocioException(string mensagem) : Exception(mensagem);

public class NaoEncontradoException(string mensagem) : Exception(mensagem);

public static class Documentos
{
    public static string SomenteDigitos(string? valor) =>
        new((valor ?? string.Empty).Where(char.IsDigit).ToArray());

    public static bool CpfValido(string? cpf)
    {
        var d = SomenteDigitos(cpf);
        if (d.Length != 11 || d.Distinct().Count() == 1) return false;
        int Digito(int len)
        {
            var soma = 0;
            for (var i = 0; i < len; i++) soma += (d[i] - '0') * (len + 1 - i);
            var r = soma % 11;
            return r < 2 ? 0 : 11 - r;
        }
        return Digito(9) == d[9] - '0' && Digito(10) == d[10] - '0';
    }

    public static bool CnpjValido(string? cnpj)
    {
        var d = SomenteDigitos(cnpj);
        if (d.Length != 14 || d.Distinct().Count() == 1) return false;
        int[] p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        int[] p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        int Digito(int[] pesos)
        {
            var soma = 0;
            for (var i = 0; i < pesos.Length; i++) soma += (d[i] - '0') * pesos[i];
            var r = soma % 11;
            return r < 2 ? 0 : 11 - r;
        }
        return Digito(p1) == d[12] - '0' && Digito(p2) == d[13] - '0';
    }
}

/// <summary>Parâmetro de sistema (chave/valor). Guarda, entre outros, a versão do esquema do banco.</summary>
public class ParametroSistema
{
    public const string ChaveVersaoEsquema = "VersaoEsquema";

    public string Chave { get; set; } = string.Empty;
    public string Valor { get; set; } = string.Empty;
}
