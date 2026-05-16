package com.mycompany.hospital;

public class Funcionario {

    private String nome;
    private double salarioBase;

    public Funcionario(String nome, double salarioBase) {
        this.nome = nome;
        this.salarioBase = salarioBase;
    }

    public String getNome() {
        return nome;
    }

    public double getSalarioBase() {
        return salarioBase;
    }

    public void exibirDados() {
        System.out.println("--- DADOS GERAIS (Método da Superclasse)");
        System.out.println("Nome do Funcionário: " + getNome());
        System.out.println("Salário Base: R$ " + getSalarioBase());
    }
}