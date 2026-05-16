
package com.mycompany.regradenegocio;

import java.util.Scanner;

public class RegradeNegocio {
    static Scanner scanner = new Scanner(System.in);
    

    public static void main(String[] args) {
        int opcao;
        do{
            System.out.println("\n== SELKECIONE UM ITEM DE MENU");
            System.out.println("1 - Cadastro de veiculo");
            System.out.println("2 - Consultar veiculo");
            System.out.print("Selecione um opção: ");
            
            opcao = scanner.nextInt();
            
            switch (opcao) {
                case 1:
                    cadastro();
                    break;
                case 2:
                    consultar();
                    break;
                default:
                    System.out.println("Selecionar um opçaõ valida!");;
            }
        }while(opcao != 0);
    }
    
    public static void consultar(){
        System.out.print("Informe o ID que deseja consultar: ");
        int id = scanner.nextInt();
        
        if((new Carro()).carroConsulta(id) != null){
            System.out.println((new Carro()).carroConsulta(id));
        }else{
            System.out.println("Nenhum item encontrado");
        }
    }
    
    public static void cadastro(){
        System.out.print("Informe o ID: ");
        int id = scanner.nextInt();
        scanner.nextLine();                     // cosumir buffer
        System.out.print("Informe a Cor: ");
        String cor = scanner.nextLine();
        System.out.print("Informe o Modelo: ");
        String modelo = scanner.nextLine();
        System.out.print("Informe a Marca: ");
        String marca = scanner.nextLine();
        (new Carro()).carroCadastro(id, cor, modelo, marca);
    }
}
