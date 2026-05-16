public class Produto {

    private int id;
    private String nome;
    private double preco;

    public Produto(int id, String nome, double preco) {

        if(nome == null || nome.isEmpty()){
            throw new IllegalArgumentException("Nome não pode ser vazio");
        }

        if(preco < 0){
            throw new IllegalArgumentException("Preço não pode ser negativo");
        }

        this.id = id;
        this.nome = nome;
        this.preco = preco;
    }

    public int getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public double getPreco() {
        return preco;
    }
}