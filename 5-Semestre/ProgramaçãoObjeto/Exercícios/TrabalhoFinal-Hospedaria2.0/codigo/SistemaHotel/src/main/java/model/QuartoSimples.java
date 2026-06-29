package model;

public class QuartoSimples extends Quarto{
    private int capacidadePessoas;
    
    public QuartoSimples(int numero, double precoDiaria, boolean disponivel, int capacidadePessoas){
        super(numero, precoDiaria, disponivel);
        this.capacidadePessoas = capacidadePessoas;
    }

    public int getCapacidadePessoas() {
        return capacidadePessoas;
    }

    public void setCapacidadePessoas(int capacidadePessoas) {
        this.capacidadePessoas = capacidadePessoas;
    }
    
    @Override
    public String getTipo(){
        return "Quarto Simples";
    }
    
    @Override
    public double calcularDiaria(){
        return getPrecoDiaria();
    }
}
