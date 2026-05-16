package com.mycompany.relacionamento_exercicico;

public class Estoque {
    private int id;
    private String localizacao;

    public Estoque(int id, String localizacao) {
        this.id = id;
        this.localizacao = localizacao;
    }

    public String getInfo() { return "Terminal " + id + " (" + localizacao + ")"; }
} 