package com.mycompany.entradaesaida;

import java.util.Scanner;

public class EntradaEsaida {

    public static void main(String[] args) {
        
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Digite um valor entre 0 e 10: ");
        int nota1 = scanner.nextInt();
        
        if (nota1 >= 0 && nota1 <= 4){
            System.out.println("Reprovado!");
        }else{
            if(nota1 >= 5 && nota1 <= 6)
                System.out.println("Recuperacao!");
            else{
                if(nota1 >= 7 && nota1 <= 8)
                    System.out.println("Aprovado!");
                else{
                    if(nota1 >= 9 && nota1 <= 10)
                        System.out.println("Aprovado com excelencia!");
                    else{
                        System.out.println("ERRO! Nota Invalida!");
                    }
                }
            }
        }     
    }
}
