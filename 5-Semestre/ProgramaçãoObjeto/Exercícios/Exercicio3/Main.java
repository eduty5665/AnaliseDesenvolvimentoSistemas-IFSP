public class Main {
    public static void main(String[] args) {

        Aluno aluno = new Aluno("Eduardo Lucas Lemes", "2023001");

        Livro livro1 = new Livro("As 48 leis do poder", "Robert Greene");
        Livro livro2 = new Livro("Arsène Lupin, o Ladrão de Casaca", "Maurice Leblanc");

        IEmprestimo emprestimo = new Emprestimo(aluno);

        emprestimo.adicionarLivro(livro1);
        emprestimo.adicionarLivro(livro2);

        emprestimo.imprimirDetalhes();
    }
}
