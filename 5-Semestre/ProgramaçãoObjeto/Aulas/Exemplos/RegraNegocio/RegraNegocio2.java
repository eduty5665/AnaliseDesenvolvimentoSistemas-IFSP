
package com.mycompany.regranegocio2;

import java.util.Scanner;

public class RegraNegocio2 {
    
    static Scanner scanner = new Scanner(System.in);
    
    public static void main(String[] args) {
        int opcao;
        
        do{
            System.out.println("\n=== MENU DE OPCAO ===");
            System.out.println("1 - Cadastro de veiculo!");
            System.out.println("2 - Consulta de veiculo");
            System.out.println("0 - Sair/Fechar");
            System.out.print("Selecione um opcao: ");
            
            opcao = scanner.nextInt(); scanner.nextLine(); // remover buffer
            
            switch (opcao) {
                case 1:
                    cadastro();
                    break;
                case 2:
                    consultar();
                    break;
                case 0:
                    System.out.println("Saindo...");
                    break;
                default:
                    System.out.println("Selecione uma opcao valida");
                    break;
            }
        }while(opcao != 0);
    }
    
    static public void consultar(){
        System.out.print("Informe o ID para consulta: ");
        int id = scanner.nextInt(); 
        if((new Carro()).carroConsulta(id) != null){
            System.out.println((new Carro()).carroConsulta(id));
        }else{
            System.out.println("Nenhum i1tem encontrato");
        }
    }
    
    static public void cadastro(){
        System.out.print("Informe o ID: ");
        int id = scanner.nextInt(); scanner.nextLine();
        System.out.print("Informe a Cor: ");
        String cor = scanner.nextLine();
        System.out.print("Informe o Modelo: ");
        String modelo = scanner.nextLine();
        System.out.print("Informe a Marca: ");
        String marca = scanner.nextLine();
        
        (new Carro()).carroCadastro(id, cor, modelo, marca);
    }
}
