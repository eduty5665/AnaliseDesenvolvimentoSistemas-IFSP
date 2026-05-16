package br.edu.ifsp.aulafirebase2026.model.entity;

import androidx.annotation.NonNull;

public class Carro {

    private String id;
    @NonNull
    private String nome;
    private String cor;
    private int ano;
    private float valor;
    private boolean vendido;


    public Carro() {

    }

    public Carro(String id, @NonNull String nome,
                 String cor, int ano, float valor, boolean vendido) {
        this.id = id;
        this.nome = nome;
        this.cor = cor;
        this.ano = ano;
        this.valor = valor;
        this.vendido = vendido;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @NonNull
    public String getNome() {
        return nome;
    }

    public void setNome(@NonNull String nome) {
        this.nome = nome;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public int getAno() {
        return ano;
    }

    public void setAno(int ano) {
        this.ano = ano;
    }

    public float getValor() {
        return valor;
    }

    public void setValor(float valor) {
        this.valor = valor;
    }

    public boolean isVendido() {
        return vendido;
    }

    public void setVendido(boolean vendido) {
        this.vendido = vendido;
    }

}
