package com.mycompany.exercicio1;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);
        ContaBancaria conta = new ContaBancaria("123", "Eduardo", 100.00);
        //Não teria como pedir para o usuario cadastrar, porque não tem lógica usuário digitar próprio saldo

        int opcao = -1; // valor inicial

        while (opcao != 0) {

            System.out.println("\n-- Bem Vindo ao Banco IFSP --");
            System.out.println("1 - Ver Saldo");
            System.out.println("2 - Depositar");
            System.out.println("3 - Sacar");
            System.out.println("0 - Sair");
            System.out.print("Digite a operaçao que deseja realizar: ");

            opcao = scanner.nextInt();

            switch(opcao){

                case 1:
                    System.out.println("Saldo atual: " + conta.consultarSaldo());
                    break;

                case 2:
                    System.out.print("Quanto deseja depositar: ");
                    double dep = scanner.nextDouble();
                    conta.depositar(dep);
                    System.out.println("Saldo apos deposito: " + conta.consultarSaldo());
                    opcao = 0;
                    break;

                case 3:
                    System.out.print("Quanto deseja sacar: ");
                    double sac = scanner.nextDouble();
                    conta.sacar(sac);
                    System.out.println("Saldo apos saque: " + conta.consultarSaldo());
                    opcao = 0;
                    break;

                case 0:
                    System.out.println("Encerrando o sistema... Obrigado! 👋");
                    break;

                default:
                    System.out.println("Opção inválida!");
                    break;
            }
        }
        scanner.close();
    }
}