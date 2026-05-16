import java.time.LocalDate;
import java.util.Date;

public class Usuario {
    protected int id;
    protected String nome;
    protected String email;
    protected String senha;
    protected LocalDate dataCadastro;
    protected String status;

    public Usuario(int id, String nome, String email, String senha, LocalDate dataCadastro, String status) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.dataCadastro = dataCadastro;
        this.status = status;
    }

    public boolean fazerLogin(String email, String senha) {
        return this.email.equals(email) && this.senha.equals(senha);
    }

    public void atualizarPerfil(String nome, String email, String senha) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }
}