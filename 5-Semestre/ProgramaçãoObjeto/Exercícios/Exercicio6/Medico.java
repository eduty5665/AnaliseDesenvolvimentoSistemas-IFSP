package com.mycompany.hospital;

public class Medico extends Funcionario {

    private String crm;

    public Medico(String nome, double salarioBase, String crm) {
        super(nome, salarioBase); // obrigatório ser a primeira linha
        this.crm = crm;
    }

    public String getCrm() {
        return crm;
    }

    public void mostrarRelatorioMedico() {
        System.out.println("--- RELATÓRIO MÉDICO (Método da Subclasse)");
        System.out.println("CRM: " + getCrm());
        System.out.println("Status de Pagamento: Processando valor de R$ "
                + getSalarioBase() + " via sistema hospitalar.");
    }
}