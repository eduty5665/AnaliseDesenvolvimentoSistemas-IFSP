package com.mycompany.entradaesaida;
import java.util.Scanner;

public class SwitchCase {

    public static void main(String[] args) {
        
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("--Operacoess Matematicas--");
        System.out.println("1 - Adicao");
        System.out.println("2 - Subtracao");
        System.out.println("3 - Multiplicacao");
        System.out.println("4 - Divisao");
        System.out.println("Escolha a operacao: ");
        int esc = scanner.nextInt();
        if (esc < 5){
            System.out.println("Digite um valor para a operacao: ");
            double valor1 = scanner.nextDouble();
            System.out.println("Digite outro valor: ");
            double valor2 = scanner.nextDouble();
            double result = 0;
            switch (esc) {
                case 1: 
                    result = valor1 + valor2;
                    System.out.println("A soma de " + valor1 + " e " + valor2 + " e: " + result);
                    break;
                case 2: 
                    result = valor1 - valor2;
                    System.out.println("A subtracao de " + valor1 + " e " + valor2 + " e: " + result);
                    break;
                case 3: 
                    result = valor1 * valor2;
                    System.out.println("A multiplicacao de " + valor1 + " e " + valor2 + " e: " + result);
                    break;
                case 4: 
                    if(valor1 == 0 || valor2 == 0){
                        System.out.println("Não podemos fazer esta divisão.");
                    }else{
                        result = valor1 / valor2;
                        System.out.println("A divisao de " + valor1 + " e " + valor2 + " e: " + result);
                        break;
                    }                               
                default:
                    System.out.println("Opcao Invalida!");
            }
        }else{
            System.out.println("ERRO! Opcao Invalida! ");
        }        
    }
}
