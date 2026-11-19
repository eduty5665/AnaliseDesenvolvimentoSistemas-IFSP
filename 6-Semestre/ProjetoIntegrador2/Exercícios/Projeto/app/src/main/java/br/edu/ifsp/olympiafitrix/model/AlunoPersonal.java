package br.edu.ifsp.olympiafitrix.model;

/** Dados do aluno usados nas telas administrativas do personal. */
public class AlunoPersonal {

    private int idAluno;
    private int idSolicitacao;
    private String nome;
    private String cpf;
    private String telefone;
    private int idade;
    private double peso;
    private double altura;
    private double imc;
    private int score;
    private String doenca;
    private String lesao;
    private boolean sexo;
    private String fotoUrl;

    public AlunoPersonal(
            int idAluno,
            int idSolicitacao,
            String nome,
            String cpf,
            String telefone,
            int idade,
            double peso,
            double altura,
            double imc,
            int score,
            String doenca,
            String lesao,
            boolean sexo,
            String fotoUrl
    ) {
        this.idAluno = idAluno;
        this.idSolicitacao = idSolicitacao;
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.idade = idade;
        this.peso = peso;
        this.altura = altura;
        this.imc = imc;
        this.score = score;
        this.doenca = doenca;
        this.lesao = lesao;
        this.sexo = sexo;
        this.fotoUrl = fotoUrl;
    }

    public int getIdAluno() {
        return idAluno;
    }

    public int getIdSolicitacao() {
        return idSolicitacao;
    }

    public String getNome() {
        return nome;
    }

    public String getCpf() {
        return cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public int getIdade() {
        return idade;
    }

    public double getPeso() {
        return peso;
    }

    public double getAltura() {
        return altura;
    }

    public double getImc() {
        return imc;
    }

    public int getScore() {
        return score;
    }

    public String getDoenca() {
        return doenca;
    }

    public String getLesao() {
        return lesao;
    }

    public boolean isSexo() {
        return sexo;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }
}
