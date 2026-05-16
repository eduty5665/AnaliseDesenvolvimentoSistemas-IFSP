import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class Administrador extends Usuario {

    private String nivelAcesso;
    private List<String> permissoes;


    public Administrador(int id, String nome, String email, String senha, LocalDate dataCadastro, String status,
                         String nivelAcesso, List<String> permissoes) {

        super(id, nome, email, senha, dataCadastro, status);
        this.nivelAcesso = nivelAcesso;
        this.permissoes = permissoes;
    }

    @Override
    public boolean fazerLogin(String email, String senha) {
        return this.email.equals(email) && this.senha.equals(senha);
    }

    public void criarUsuario(Map<String, Object> usuario) {
        System.out.println("\nAdministrador: " + this.nome);

        if (this.nivelAcesso.equalsIgnoreCase("alto")) {
            System.out.println("\nUsuário criado com sucesso.");
            System.out.println("Dados: " + usuario);
        } else {
            System.out.println("\nAcesso negado para criar usuário.");
        }
    }

    public void gerenciarPermissoes() {
        System.out.println("\nGerenciando permissões do admin: " + this.nome);

        if (permissoes != null && !permissoes.isEmpty()) {
            for (String p : permissoes) {
                System.out.println("Permissão: " + p);
            }
        } else {
            System.out.println("Nenhuma permissão cadastrada.");
        }
    }
}