import java.util.ArrayList;
import java.util.List;

public class GerenciadorProdutos {

    private List<Produto> produtos;

    public GerenciadorProdutos() {
        produtos = new ArrayList<>();
    }

    // Adicionar produto
    public void adicionarProduto(Produto produto) {

        for(Produto p : produtos){
            if(p.getId() == produto.getId()){
                throw new IllegalArgumentException("Já existe produto com esse ID");
            }
        }

        produtos.add(produto);
    }

    // Consultar por ID
    public Produto consultarProduto(int id){

        for(Produto p : produtos){
            if(p.getId() == id){
                return p;
            }
        }

        return null;
    }

    // Listar produtos
    public List<Produto> listarProdutos(){
        return new ArrayList<>(produtos);
    }

    // Remover por ID
    public boolean removerProduto(int id){

        Produto produto = consultarProduto(id);

        if(produto != null){
            produtos.remove(produto);
            return true;
        }

        return false;
    }
}