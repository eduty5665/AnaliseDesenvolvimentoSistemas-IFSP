
package br.com.cicerosnt.aula03_visibilidade;


public class Conta {

    // Atributos protected: visíveis para subclasses e mesmo pacote
    protected String numero;
    protected String titular;
    private double saldo;
    protected boolean ativa;

    // Construtir
    public Conta(String numero, String titular) {
        this.numero = numero;
        this.titular = titular;
        this.saldo = 0.0;
        this.ativa = true;
    }

    public boolean deposito(double valor) {
        if (!ativa) {
            System.out.println("Conta inativa. Depósito não permitido.");
            return false;
        }

        if (valor > 0) {
            saldo += valor;
            return true;
        } else {
            System.out.println("Valor de depósito deve ser maior que zero.");
            return false;
        }
    }

    public boolean saque(double valor) {
        if (!ativa) {
            System.out.println("Conta inativa. Saque não permitido.");
            return false;
        }

        if (valor <= 0) {
            System.out.println("Valor de saque deve ser maior que zero.");
            return false;
        }

        if (valor <= saldo) {
            saldo -= valor;
            return true;
        } else {
            System.out.println("Saldo insuficiente.");
            return false;
        }
    }

    public double getSaldo() {
        return saldo;
    }

    public String getNumero() {
        return numero;
    }

    public String getTitular() {
        return titular;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public void desativar() {
        this.ativa = false;
    }
}
