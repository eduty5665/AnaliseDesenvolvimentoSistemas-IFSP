import java.time.LocalDate;
import java.util.*;

public class Main {
    public static void main(String[] args) {

        Usuario user = new Usuario(1, "Ana", "ana@email.com", "123",
                LocalDate.now(), "ativo");

        System.out.println("Login válido: " + user.fazerLogin("ana@email.com", "123"));

        user.atualizarPerfil("\nAna Silva", "ana@email.com", "456");


        List<String> permissoes = Arrays.asList("CRIAR", "EDITAR", "EXCLUIR");

        Administrador admin = new Administrador(
                2, "Danyell", "admin@email.com", "admin123",
                LocalDate.now(), "ativo",
                "alto", permissoes
        );

        Map<String, Object> novoUsuario = new HashMap<>();
        novoUsuario.put("nome", "Guilherme");
        novoUsuario.put("email", "guilherme@email.com");

        admin.criarUsuario(novoUsuario);
        admin.gerenciarPermissoes();

        Editor editor = new Editor(3, "Danyell", "danyell@email.com", "123", LocalDate.now(), "ativo", "Tecnologia", true);

        Map<String, Object> conteudo = new HashMap<>();
        conteudo.put("titulo", "Java Básico");

        editor.criarConteudo(conteudo);
        editor.editarConteudo(101);
        editor.exibirResumo();

        List<Integer> equipe = Arrays.asList(10, 20, 30);

        Gerente gerente = new Gerente(4, "Cícero", "gerente@email.com", "123", LocalDate.now(), "ativo", "TI", equipe);

        gerente.gerarRelatorio();
        gerente.aprovarConteudo(200);
        gerente.aprovarConteudo(199, "TI");

        List<Integer> historico = new ArrayList<>();

        Leitor leitor = new Leitor(5, "Julia", "leitor@email.com", "123", LocalDate.now(), "ativo", "Premium", historico);


        leitor.lerConteudo(50);
        leitor.lerConteudo(50, "Premium");
        leitor.favoritarConteudo(50);

        System.out.println("\nHistórico de leitura: " + historico);


        System.out.println("Login válido: " + admin.fazerLogin("admin@email.com", "admin123"));

    }
}