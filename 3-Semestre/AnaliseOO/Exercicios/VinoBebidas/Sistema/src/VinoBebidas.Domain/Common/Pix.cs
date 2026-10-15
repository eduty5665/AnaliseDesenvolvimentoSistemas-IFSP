using System.Globalization;
using System.Text;

namespace VinoBebidas.Domain.Common;

/// <summary>
/// Gera o "Pix Copia e Cola" (BR Code estático, padrão EMV do Banco Central) para um valor.
/// O PDV mostra esse código como QR para o cliente pagar; a confirmação é conferida no app do banco da loja.
/// </summary>
public static class PixBrCode
{
    public static string Gerar(string chave, string nomeRecebedor, string cidade, decimal valor, string identificador)
    {
        static string Campo(string id, string valor) => $"{id}{valor.Length:D2}{valor}";

        var conta = Campo("00", "br.gov.bcb.pix") + Campo("01", chave.Trim());
        var txid = new string(identificador.Where(char.IsLetterOrDigit).Take(25).ToArray());
        if (txid.Length == 0) txid = "***";

        var payload =
            Campo("00", "01") +
            Campo("26", conta) +
            Campo("52", "0000") +
            Campo("53", "986") +
            Campo("54", valor.ToString("0.00", CultureInfo.InvariantCulture)) +
            Campo("58", "BR") +
            Campo("59", Limpar(nomeRecebedor, 25)) +
            Campo("60", Limpar(cidade, 15)) +
            Campo("62", Campo("05", txid)) +
            "6304";
        return payload + Crc16(payload);
    }

    private static string Limpar(string texto, int maximo)
    {
        var semAcento = new string(texto.Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark && c < 128).ToArray());
        semAcento = semAcento.Trim().ToUpperInvariant();
        return semAcento.Length > maximo ? semAcento[..maximo] : semAcento;
    }

    /// <summary>CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF).</summary>
    private static string Crc16(string texto)
    {
        ushort crc = 0xFFFF;
        foreach (var b in Encoding.ASCII.GetBytes(texto))
        {
            crc ^= (ushort)(b << 8);
            for (var i = 0; i < 8; i++)
                crc = (crc & 0x8000) != 0 ? (ushort)((crc << 1) ^ 0x1021) : (ushort)(crc << 1);
        }
        return crc.ToString("X4");
    }
}
