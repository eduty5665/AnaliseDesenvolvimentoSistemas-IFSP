import java.time.LocalDate;
import java.util.Date;
import java.util.Map;

public class Editor extends Usuario {

    private String areaAtuacao;
    private boolean publicaConteudo;

    public Editor(int id, String nome, String email, String senha, LocalDate dataCadastro, String status,
                  String areaAtuacao, boolean publicaConteudo) {

        super(id, nome, email, senha, dataCadastro, status);
        this.areaAtuacao = areaAtuacao;
        this.publicaConteudo = publicaConteudo;
    }

    public void criarConteudo(Map<String, Object> conteudo) {
        System.out.println("\nConteúdo Criado");
    }

    public void editarConteudo(int id) {
        System.out.println("Conteúdo Alterado: " + id);
    }
    public void exibirResumo() {
        System.out.println("\nEditor ");
        System.out.println("Nome: " + this.nome);
        System.out.println("Email: " + this.email);
        System.out.println("Área de Atuação: " + this.areaAtuacao);
        System.out.println("Pode publicar: " + this.publicaConteudo);
    }
}