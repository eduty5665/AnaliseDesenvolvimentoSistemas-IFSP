
package com.mycompany.relacionamento_exercicico;

public class Relacionamento_Exercicico {

    public static void main(String[] args) {
        // Criando componentes independentes
        Estoque t1 = new Estoque(1, "Entrada Principal");
        Produto p1 = new Produto("Coxinha", 6.50);
        Produto p2 = new Produto("Suco de Laranja", 5.00);

        // Criando o pedido (Associação com Terminal ocorre aqui)
        Pedido novoPedido = new Pedido(t1);

        // Agregando produtos
        novoPedido.adicionarProduto(p1);
        novoPedido.adicionarProduto(p2);

        // Resultado
        System.out.println(novoPedido.resumoPedido());
    }
}
