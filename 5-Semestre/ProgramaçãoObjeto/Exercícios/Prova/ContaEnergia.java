package com.mycompany.contaenergia;

    // desenvolva sua lógica aqui!
public class ContaEnergia {

    // Atributos privados (encapsulamento)
    private String codigoIdentificador;
    private double leituraAnterior;
    private double leituraAtual;

    // Construtor com validações
    public ContaEnergia(String codigoIdentificador, double leituraAnterior, double leituraAtual) {
        this.codigoIdentificador = codigoIdentificador;

        // Validação da leitura anterior
        if (leituraAnterior >= 0) {
            this.leituraAnterior = leituraAnterior;
        } else {
            this.leituraAnterior = 0;
        }

        // Validação da leitura atual
        if (leituraAtual >= this.leituraAnterior) {
            this.leituraAtual = leituraAtual;
        } else {
            this.leituraAtual = this.leituraAnterior; // consumo zero
        }
    }

    // Métodos GET
    public String getCodigoIdentificador() {
        return codigoIdentificador;
    }

    public double getLeituraAnterior() {
        return leituraAnterior;
    }

    public double getLeituraAtual() {
        return leituraAtual;
    }

    // Métodos SET (somente para leituras)

    public void setLeituraAnterior(double leituraAnterior) {
        if (leituraAnterior >= 0 && leituraAnterior <= this.leituraAtual) {
            this.leituraAnterior = leituraAnterior;
        }
    }

    public void setLeituraAtual(double leituraAtual) {
        if (leituraAtual >= this.leituraAnterior) {
            this.leituraAtual = leituraAtual;
        }
    }

    // Método para calcular consumo
    public double calcularConsumo() {
        return this.leituraAtual - this.leituraAnterior;
    }

    // Método para exibir resumo
    public String exibirResumo() {
        StringBuilder sb = new StringBuilder();
    
        sb.append("Unidade Consumidora: ").append(this.codigoIdentificador).append("\n");
        sb.append("Leitura anterior: ").append(this.leituraAnterior).append("\n");
        sb.append("Leitura atual: ").append(this.leituraAtual).append("\n");
        sb.append("Calculo consumo: ").append(this.calcularConsumo());
    
        return sb.toString();
    }
}

