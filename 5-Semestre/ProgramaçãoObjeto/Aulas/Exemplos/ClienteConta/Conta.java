package br.com.cicerosnt.exercicio.cliente.conta;

public class Conta {
    int numero;
    String agencia;
    double saldo;
    double limite;
    boolean status; // true = ativa / false = bloqueada
    Cliente titular;

    public Conta(int numero, String agencia, double limite, Cliente titular) {
        this.numero = numero;
        this.agencia = agencia;
        this.limite = limite;
        this.titular = titular;
        this.saldo = 0.0;
        this.status = true;
    }

    void depositar(double valor) {
        if (status && valor > 0) {
            saldo += valor;
            System.out.println("Deposito realizado.");
        } else {
            System.out.println("Operacao inválida.");
        }
    }

    public void sacar(double valor) {
        if (!status) {
            System.out.println("Conta bloqueada.");
            return;
        }

        if (valor <= 0) {
            System.out.println("Valor invalido.");
            return;
        }

        if (saldo + limite >= valor) {
            saldo -= valor;
            System.out.println("Saque realizado.");
        } else {
            System.out.println("Saldo insuficiente.");
        }
    }

    public boolean transferir(Conta destino, double valor) {

        if (!status || !destino.status) {
            System.out.println("Contas esta bloqueada.");
            return false;
        }

        if (saldo + limite >= valor && valor > 0) {
            saldo -= valor;
            destino.saldo += valor;
            System.out.println("Transferencia realizada.");
            return true;
        }

        System.out.println("Transferencia não realizada.");
        return false;
    }

    public double consultarSaldo() {
        return saldo;
    }

    public boolean bloquearConta() {
        if (status) {
            status = false;
            return true;
        }
        return false;
    }

    public boolean ativarConta() {
        if (!status) {
            status = true;
            return true;
        }
        return false;
    }
}
