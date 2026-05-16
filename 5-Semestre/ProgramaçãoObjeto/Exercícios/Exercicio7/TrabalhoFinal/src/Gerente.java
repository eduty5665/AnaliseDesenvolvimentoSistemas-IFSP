import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public class Gerente extends Usuario {

    private String departamento;
    private List<Integer> equipe;

    public Gerente(int id, String nome, String email, String senha, LocalDate dataCadastro, String status,
                   String departamento, List<Integer> equipe) {

        super(id, nome, email, senha, dataCadastro, status);
        this.departamento = departamento;
        this.equipe = equipe;
    }

    public void gerarRelatorio() {
        StringBuilder sb = new StringBuilder();

        sb.append("\nRelatório do Gerente \n");
        sb.append("ID: ").append(this.id).append("\n");
        sb.append("Nome: ").append(this.nome).append("\n");
        sb.append("Email: ").append(this.email).append("\n");
        sb.append("Departamento: ").append(this.departamento).append("\n");

        if (equipe != null && !equipe.isEmpty()) {
            sb.append("Equipe: ");
            for (Integer e : equipe) {
                sb.append(e).append(" ");
            }
        } else {
            sb.append("\nEquipe não cadastrada.");
        }

        System.out.println(sb.toString());
    }

    public void aprovarConteudo(int id) {
            System.out.println("\nConteúdo aprovado: " + id);

    }
    public void aprovarConteudo(int id, String departamento) {
        if (departamento == "TI") {
            System.out.println("\nConteúdo aprovado: " + id);
        }
    }
}