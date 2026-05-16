
package br.com.cicerosnt.aula03_visibilidade;

public class Aula03_Visibilidade {

    public static void main(String[] args) {
        Conta c = new Conta("12345-6", "João Silva");

        c.deposito(500);
        c.saque(200);

        System.out.println("Saldo atual: " + c.getSaldo());
    }
}
