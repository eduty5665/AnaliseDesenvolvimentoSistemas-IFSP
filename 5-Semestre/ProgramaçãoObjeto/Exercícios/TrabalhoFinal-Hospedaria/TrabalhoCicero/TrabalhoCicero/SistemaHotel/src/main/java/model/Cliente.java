package model;

public class Cliente extends Pessoa implements Relatorio{
    private int idCliente;
    private String email;
    
    public Cliente(int idCliente, String nome, String cpf, String telefone, String email){
        super(nome, cpf, telefone);
        this.idCliente = idCliente;
        this.email = email;
    }

    public int getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(int idCliente) {
        this.idCliente = idCliente;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
    @Override
    public String apresentar(){
        return "Cliente: " + getNome();
    }
    
    @Override
    public String gerarResumo(){
        return "Resumo do Cliente \n Nome: " + getNome() +
                "\nId: " + getIdCliente() + 
                "\nCPF: " + getCpf() + 
                "\nTelefone: " + getTelefone() + 
                "\nE-mail: " + getEmail();
    }
    
}
