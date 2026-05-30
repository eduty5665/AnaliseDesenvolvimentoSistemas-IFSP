package model;

public class Funcionario extends Pessoa{
    private int idFuncionario;
    private String cargo;
    private double salario;
    
    public Funcionario(String nome, String cpf, String telefone, int idFuncionario, String cargo, double salario){
        super(nome, cpf, telefone);
        this.idFuncionario = idFuncionario;
        this.cargo = cargo;
        this.salario = salario;
    }

    public int getIdFuncionario() {
        return idFuncionario;
    }

    public void setIdFuncionario(int idFuncionario) {
        this.idFuncionario = idFuncionario;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public double getSalario() {
        return salario;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }
    
    @Override
    public String apresentar(){
        return "Funcionário: " + getNome();
    }
}
