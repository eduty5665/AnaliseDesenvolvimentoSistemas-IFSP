package br.edu.ifsp.olympiafitrix.model;

import java.io.Serializable;

public class Nivel implements Serializable {
    private int idNivel;
    private String nome;
    private String descricao;
    private boolean isSelected = false;

    public Nivel(String nome, String descricao) {
        this(-1, nome, descricao);
    }

    public Nivel(int idNivel, String nome, String descricao) {
        this.idNivel = idNivel;
        this.nome = nome;
        this.descricao = descricao;
    }

    public int getIdNivel() { return idNivel; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public boolean isSelected() { return isSelected; }
    public void setSelected(boolean selected) { isSelected = selected; }
}
