package com.mycompany.poo1;

public class Main {
    public static void main(String[] args) {
        MouseClass mouse = new MouseClass();
        
        mouse.cor = "Rosa";
        mouse.tipo = "Ergonomico";
        mouse.marca = "Redragon";        
        mouse.qtdBotoes = 5;
        mouse.dpi = 500;
        mouse.preco = 800;
        mouse.peso = 250;
        
        System.out.println("Cor: " + mouse.cor);
        
    }
}
