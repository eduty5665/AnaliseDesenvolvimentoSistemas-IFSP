namespace VinoBebidas.Infrastructure.Services;

/// <summary>
/// Projeção de séries diárias com Holt-Winters aditivo (nível + tendência amortecida + sazonalidade semanal).
/// Os parâmetros são escolhidos por busca em grade minimizando o erro de previsão um passo à frente.
/// </summary>
public static class Previsao
{
    public sealed record Resultado(double[] Previsto, double[] Minimo, double[] Maximo, string Metodo, double ErroMedioPercentual);

    private const double Phi = 0.95;   // amortecimento da tendência
    private const double Z80 = 1.2816; // intervalo de 80%

    public static Resultado Prever(IReadOnlyList<double> serie, int horizonte, int sazonalidade = 7)
    {
        if (horizonte <= 0) return new([], [], [], "nenhum", 0);
        var y = serie.ToArray();
        if (y.Length < sazonalidade * 2)
            return MediaSimples(y, horizonte);

        double[] alfas = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
        double[] betas = [0.0, 0.01, 0.05, 0.1];
        double[] gamas = [0.05, 0.1, 0.2, 0.3, 0.4];

        Ajuste? melhor = null;
        foreach (var a in alfas)
        foreach (var b in betas)
        foreach (var g in gamas)
        {
            var ajuste = Ajustar(y, sazonalidade, a, b, g);
            if (melhor is null || ajuste.Sse < melhor.Sse) melhor = ajuste;
        }

        var m = melhor!;
        var previsto = new double[horizonte];
        var minimo = new double[horizonte];
        var maximo = new double[horizonte];
        var sigma = Math.Sqrt(m.Sse / Math.Max(1, m.Passos));
        double somaPhi = 0;
        for (var h = 1; h <= horizonte; h++)
        {
            somaPhi += Math.Pow(Phi, h);
            var s = m.Sazonais[y.Length - sazonalidade + (h - 1) % sazonalidade];
            var valor = Math.Max(0, m.Nivel + somaPhi * m.Tendencia + s);
            var largura = Z80 * sigma * Math.Sqrt(1 + (h - 1) * m.Alfa * m.Alfa);
            previsto[h - 1] = valor;
            minimo[h - 1] = Math.Max(0, valor - largura);
            maximo[h - 1] = valor + largura;
        }

        return new Resultado(previsto, minimo, maximo,
            $"Holt-Winters aditivo (α={m.Alfa:0.##}, β={m.Beta:0.##}, γ={m.Gama:0.##}, sazonalidade {sazonalidade} dias)",
            Math.Round(m.Mape, 1));
    }

    private sealed record Ajuste(double Alfa, double Beta, double Gama, double Nivel, double Tendencia, double[] Sazonais, double Sse, int Passos, double Mape);

    private static Ajuste Ajustar(double[] y, int m, double a, double b, double g)
    {
        var n = y.Length;
        var s = new double[n];
        double media1 = 0, media2 = 0;
        for (var i = 0; i < m; i++) { media1 += y[i]; media2 += y[i + m]; }
        media1 /= m; media2 /= m;
        var nivel = media1;
        var tendencia = (media2 - media1) / m;
        for (var i = 0; i < m; i++) s[i] = y[i] - nivel;

        double sse = 0, somaPct = 0;
        int passos = 0, passosPct = 0;
        for (var t = m; t < n; t++)
        {
            var previsto = nivel + Phi * tendencia + s[t - m];
            var erro = y[t] - previsto;
            sse += erro * erro;
            passos++;
            if (y[t] > 0) { somaPct += Math.Abs(erro) / y[t]; passosPct++; }

            var novoNivel = a * (y[t] - s[t - m]) + (1 - a) * (nivel + Phi * tendencia);
            tendencia = b * (novoNivel - nivel) + (1 - b) * Phi * tendencia;
            s[t] = g * (y[t] - novoNivel) + (1 - g) * s[t - m];
            nivel = novoNivel;
        }

        return new Ajuste(a, b, g, nivel, tendencia, s, sse, passos, passosPct == 0 ? 0 : somaPct / passosPct * 100);
    }

    private static Resultado MediaSimples(double[] y, int horizonte)
    {
        var janela = y.Length == 0 ? [0d] : y[^Math.Min(y.Length, 14)..];
        var media = janela.Average();
        var desvio = Math.Sqrt(janela.Select(v => (v - media) * (v - media)).Average());
        var p = Enumerable.Repeat(media, horizonte).ToArray();
        return new Resultado(p, p.Select(v => Math.Max(0, v - Z80 * desvio)).ToArray(), p.Select(v => v + Z80 * desvio).ToArray(),
            "Média móvel (histórico curto)", 0);
    }
}
