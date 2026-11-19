package br.edu.ifsp.olympiafitrix.model;

import java.io.Serializable;

public class Exercicio implements Serializable {
    private int idExercicio;
    private String nome;
    private String descricao;
    private String repeticoes;
    private String peso;
    private String numSeries;
    private boolean isSelected = false;

    public Exercicio(String nome, String descricao, String numSeries, String repeticoes, String peso) {
        this(-1, nome, descricao, numSeries, repeticoes, peso);
    }

    public Exercicio(int idExercicio, String nome, String descricao, String numSeries, String repeticoes, String peso) {
        this.idExercicio = idExercicio;
        this.nome = nome;
        this.descricao = descricao;
        this.numSeries = numSeries;
        this.repeticoes = repeticoes;
        this.peso = peso;
    }

    public int getIdExercicio() { return idExercicio; }
    public void setIdExercicio(int idExercicio) { this.idExercicio = idExercicio; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getRepeticoes() { return repeticoes; }
    public void setRepeticoes(String repeticoes) { this.repeticoes = repeticoes; }

    public String getPeso() { return peso; }
    public void setPeso(String peso) { this.peso = peso; }

    public String getNumSeries() { return numSeries; }
    public void setNumSeries(String numSeries) { this.numSeries = numSeries; }

    public boolean isSelected() { return isSelected; }
    public void setSelected(boolean selected) { isSelected = selected; }
}
