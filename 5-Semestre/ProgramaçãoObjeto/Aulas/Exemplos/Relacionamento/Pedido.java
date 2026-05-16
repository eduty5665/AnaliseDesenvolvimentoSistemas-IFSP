
package com.mycompany.relacionamento_exercicico;

import java.util.ArrayList;
import java.util.List;

public class Pedido {
    private Estoque estoque;        // associação
    private List<Produto> produtos; // agregação
    private NotaFiscal nota;        // composição

    public Pedido(Estoque estoque) {
        this.estoque = estoque;
        this.produtos = new ArrayList<>();
        
        // COMPOSICAO: A nota nasce junto com o pedido
        this.nota = new NotaFiscal("NF-" + Math.floor(10000 + (int) Math.random() * 90000));
    }
    
    // agregação: recebe um objeto pronto de froa
    public void adicionarProduto(Produto p){
        this.produtos.add(p);
    }
    
    public String resumoPedido(){
        String resumo = "=== RESUMO DO PEDIDO ===\n";
        resumo += "Venda realizada no: " + estoque.getInfo() + "\n";
        resumo += "Nota fiscal: " + nota.getCodigo() + "\n";
        resumo += "Itens:\n";

        for (Produto p : produtos) {
            resumo += " - " + p.getNome() + ": R$ " + p.getPreco() + "\n";
        }

        return resumo;
    }   
}
