package br.edu.ifsp.olympiafitrix.model;

/**
 * Resultado calculado do ranking, incluindo os valores usados nos critérios de desempate.
 */
public class AlunoRanking {

    private String nome;
    private double score;
    private int idAluno;
    private int treinosPlanejadosSemana;
    private int treinosRealizadosSemana;
    private int semanasConsecutivasMetaCumprida;
    private int totalTreinosRealizados;
    private String fotoUrl;

    public AlunoRanking(String nome, double score) {
        this(-1, nome, score);
    }

    public AlunoRanking(int idAluno, String nome, double score) {
        this(idAluno, nome, score, 0, 0, 0, 0, "");
    }

    public AlunoRanking(
            int idAluno,
            String nome,
            double score,
            int treinosPlanejadosSemana,
            int treinosRealizadosSemana,
            int semanasConsecutivasMetaCumprida,
            int totalTreinosRealizados
    ) {
        this(idAluno, nome, score, treinosPlanejadosSemana, treinosRealizadosSemana,
                semanasConsecutivasMetaCumprida, totalTreinosRealizados, "");
    }

    public AlunoRanking(
            int idAluno,
            String nome,
            double score,
            int treinosPlanejadosSemana,
            int treinosRealizadosSemana,
            int semanasConsecutivasMetaCumprida,
            int totalTreinosRealizados,
            String fotoUrl
    ) {
        this.idAluno = idAluno;
        this.nome = nome;
        this.score = score;
        this.treinosPlanejadosSemana = treinosPlanejadosSemana;
        this.treinosRealizadosSemana = treinosRealizadosSemana;
        this.semanasConsecutivasMetaCumprida = semanasConsecutivasMetaCumprida;
        this.totalTreinosRealizados = totalTreinosRealizados;
        this.fotoUrl = fotoUrl;
    }

    public String getNome() {
        return nome;
    }

    public double getScore() {
        return score;
    }

    public int getIdAluno() {
        return idAluno;
    }

    public int getTreinosPlanejadosSemana() {
        return treinosPlanejadosSemana;
    }

    public int getTreinosRealizadosSemana() {
        return treinosRealizadosSemana;
    }

    public int getSemanasConsecutivasMetaCumprida() {
        return semanasConsecutivasMetaCumprida;
    }

    public int getTotalTreinosRealizados() {
        return totalTreinosRealizados;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public String getScoreFormatado() {
        if (score == Math.rint(score)) {
            return String.valueOf((int) score);
        }
        return String.format(java.util.Locale.getDefault(), "%.2f", score);
    }
}
