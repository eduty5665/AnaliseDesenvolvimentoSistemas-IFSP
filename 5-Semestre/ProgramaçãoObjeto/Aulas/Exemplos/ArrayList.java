package br.com.cicerosnt.aula06_menu;

import java.util.ArrayList;
import java.util.Scanner;

public class Aula06_menu {
    
    
    static class Registro {
        int id;
        String nome;

        Registro(int id, String nome) {
            this.id = id;
            this.nome = nome;
        }

        @Override
        public String toString() {
            return "ID: " + id + " | Nome: " + nome;
        }
    }
    
    static ArrayList<Registro> registros = new ArrayList<>();
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        int opcao;
        do {
            System.out.println("\n=== MENU CRUD ===");
            System.out.println("1 - Inserir registro");
            System.out.println("2 - Consultar registros");
            System.out.println("3 - Alterar registro");
            System.out.println("4 - Excluir registro");
            System.out.println("0 - Sair");
            System.out.print("Escolha uma opção: ");
            opcao = scanner.nextInt();
            scanner.nextLine(); // consumir quebra de linha, lixo.

            switch (opcao) {
                case 1:
                    inserir();
                    break;
                case 2:
                    consultar();
                    break;
                case 3:
                    alterar();
                    break;
                case 4:
                    excluir();
                    break;
                case 0:
                    System.out.println("Encerrando...");
                    break;
                default:
                    System.out.println("Opção inválida!");
            }
        } while (opcao != 0);
    }
    
    public static void inserir() {
        System.out.print("Digite o ID: ");
        int id = scanner.nextInt();
        scanner.nextLine();
        System.out.print("Digite o nome: ");
        String nome = scanner.nextLine();
        registros.add(new Registro(id, nome));
        System.out.println("Registro inserido com sucesso!");
    }

    public static void consultar() {
        if (registros.isEmpty()) {
            System.out.println("Nenhum registro encontrado.");
        } else {
            System.out.println("\n--- Lista de Registros ---");
            for (Registro r : registros) {
                System.out.println(r);
            }
        }
    }

    public static void alterar() {
        System.out.print("Digite o ID do registro a alterar: ");
        int id = scanner.nextInt();
        //scanner.nextLine();  // consumir quebra de linha, lixo.
        for (Registro r : registros) {
            if (r.id == id) {
                System.out.print("Digite o novo nome: ");
                r.nome = scanner.nextLine();
                System.out.println("Registro alterado com sucesso!");
                return;
            }
        }
        System.out.println("Registro não encontrado.");
    }

    public static void excluir() {
        System.out.print("Digite o ID do registro a excluir: ");
        int id = scanner.nextInt();
        //scanner.nextLine(); // consumir quebra de linha, lixo.
        for (Registro r : registros) {
            if (r.id == id) {
                registros.remove(r);
                System.out.println("Registro excluído com sucesso!");
                return;
            }
        }
        System.out.println("Registro não encontrado.");
    }
}