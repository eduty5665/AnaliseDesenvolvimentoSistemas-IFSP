package br.com.cicerosnt.exercicio.cliente.conta;

public class Cliente {
    int id;
    String nome;
    double renda;
    int score;

    Conta conta; // associação 1:1 para simplificação

    public Cliente(int id, String nome, double renda, int score) {
        this.id = id;
        this.nome = nome;
        this.renda = renda;
        this.score = score;
    }

    public void abrirConta(int numero, String agencia, double limite) {
        if (conta == null) {
            conta = new Conta(numero, agencia, limite, this);
            System.out.println("Conta criada para " + nome);
        } else {
            System.out.println("Cliente já possui conta.");
        }
    }

    public boolean solicitarEmprestimo(double valor) {

        if (conta == null) {
            System.out.println("Cliente nao possui conta.");
            return false;
        }

        if (!conta.status) {
            System.out.println("Conta inativa.");
            return false;
        }

        if (score >= 600 && renda >= valor * 0.3) {
            conta.saldo += valor;
            diminuirScore(50);
            System.out.println("Emprestimo aprovado.");
            return true;
        }

        System.out.println("Emprestimo negado.");
        return false;
    }

    public int consultarScore() {
        return score;
    }

    public void aumentarScore(int pontos) {
        score += pontos;
    }

    public void diminuirScore(int pontos) {
        score -= pontos;
        if (score < 0) {
            score = 0;
        }
    }
    
    void infoCliente(){
        System.out.println("\n## INFORMACAOES DO CLIETE ##");
        System.out.println("Nome: " + this.nome);
        System.out.println("Cpf: " + this.nome);
        System.out.println("Score: " + this.score);
        System.out.println("Renda: " + this.renda);
        System.out.println("Conta: " + this.conta.numero);
        System.out.println("Saldo: " + this.conta.saldo);
        System.out.println("\n");
    }
}
