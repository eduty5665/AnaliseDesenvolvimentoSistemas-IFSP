package com.mycompany.exercicio1;

public class ContaBancaria {
    
    
    // Atributos privados (encapsulamento)
    private final String numeroConta; // final = não pode ser alterado após criação
    private String titular;
    private double saldo;

    // Construtor
    public ContaBancaria(String numeroConta, String titular, Double saldoInicial) {

        // valida número da conta
        if (numeroConta == null || numeroConta.trim().isEmpty()) {
            throw new IllegalArgumentException("Número da conta não pode ser vazio.");
        }
        this.numeroConta = numeroConta;

        // valida titular
        setTitular(titular);

        // valida saldo inicial
        if (saldoInicial == null || saldoInicial < 0) {
            this.saldo = 0;
        } else {
            this.saldo = saldoInicial;
        }
    }

    // Getter do número da conta (sem setter pois não pode ser alterado)
    public String getNumeroConta() {
        return numeroConta;
    }

    // Getter do titular
    public String getTitular() {
        return titular;
    }

    // Setter do titular com validação
    public void setTitular(String titular) {
        if (titular == null || titular.trim().isEmpty()) {
            throw new IllegalArgumentException("Titular não pode ser vazio.");
        }
        this.titular = titular;
    }

    // Getter do saldo (sem setter público)
    public double consultarSaldo() {
        return saldo;
    }

    // Método depositar
    public boolean depositar(double valor) {

        if (valor <= 0) {
            System.out.println("Valor de depósito deve ser maior que zero.");
            return false;
        }

        saldo += valor;
        return true;
    }

    // Método sacar
    public boolean sacar(double valor) {

        if (valor <= 0) {
            System.out.println("Valor de saque deve ser maior que zero.");
            return false;
        }

        if (valor > saldo) {
            System.out.println("Saldo insuficiente.");
            return false;
        }

        saldo -= valor;
        return true;
    }
}