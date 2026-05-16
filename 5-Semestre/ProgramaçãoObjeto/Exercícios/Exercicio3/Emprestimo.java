import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Emprestimo implements IEmprestimo {
    private Aluno aluno;
    private List<Livro> livros;
    private TicketEmprestimo ticket;

    public Emprestimo(Aluno aluno) {
        this.aluno = aluno;
        this.livros = new ArrayList<>();

        this.ticket = new TicketEmprestimo(gerarCodigoTicket());
    }

    private int gerarCodigoTicket() {
        Random random = new Random();
        return 1000 + random.nextInt(9000);
    }

    @Override
    public void adicionarLivro(Livro l) {
        if (l != null) {
            livros.add(l);
        }
    }

    @Override
    public void imprimirDetalhes() {
        System.out.println("---------- Detalhes do Empréstimo ---------");
        System.out.println("Ticket: " + ticket.getCodigo());
        System.out.println("Aluno: " + aluno.getNome());
        System.out.println("Livros Emprestados:");
        if (livros.isEmpty()) {
            System.out.println("  Nenhum livro adicionado.");
        } else {
            for (Livro livro : livros) {
                System.out.println("  - " + livro.getTitulo());
            }
        }
        System.out.println("--------------------------------");
    }

    public Aluno getAluno() {
        return aluno;
    }

    public List<Livro> getLivros() {
        return livros;
    }

    public TicketEmprestimo getTicket() {
        return ticket;
    }
}
