package br.edu.ifsp.olympiafitrix.model;

/** Versão enxuta do aluno para filtros e seletores que precisam apenas de id e nome. */
public class AlunoSimples {

    private int idAluno;
    private String nome;

    public AlunoSimples(int idAluno, String nome) {
        this.idAluno = idAluno;
        this.nome = nome;
    }

    public int getIdAluno() {
        return idAluno;
    }

    public String getNome() {
        return nome;
    }

    @Override
    public String toString() {
        return nome;
    }
}
