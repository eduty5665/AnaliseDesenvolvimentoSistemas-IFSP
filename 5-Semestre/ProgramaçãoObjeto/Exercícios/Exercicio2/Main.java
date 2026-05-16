public class Main {

    public static void main(String[] args) {

        GerenciadorProdutos sistema = new GerenciadorProdutos();

        sistema.adicionarProduto(new Produto(1,"Mouse",50));
        sistema.adicionarProduto(new Produto(2,"Teclado",120));
        sistema.adicionarProduto(new Produto(3,"Monitor",900));

        System.out.println("LISTA DE PRODUTOS");

        for(Produto p : sistema.listarProdutos()){
            System.out.println(p.getId() + " - " + p.getNome() + " - R$" + p.getPreco());
        }

        System.out.println("\nCONSULTA ID 2");
        Produto p = sistema.consultarProduto(2);
        System.out.println(p.getNome());

        System.out.println("\nREMOVENDO ID 1");
        sistema.removerProduto(1);

        System.out.println("\nLISTA ATUALIZADA");

        for(Produto prod : sistema.listarProdutos()){
            System.out.println(prod.getId() + " - " + prod.getNome());
        }

    }
}