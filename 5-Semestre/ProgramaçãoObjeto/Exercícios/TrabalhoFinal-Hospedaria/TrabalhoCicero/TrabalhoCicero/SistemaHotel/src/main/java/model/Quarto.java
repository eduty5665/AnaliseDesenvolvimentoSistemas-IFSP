package model;

public abstract class Quarto {
    private int numero;
    private double precoDiaria;
    boolean disponivel;
    
    public Quarto(int numero, double precoDiaria, boolean disponivel){
        this.numero = numero;
        this.precoDiaria = precoDiaria;
        this.disponivel = true;
    }

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public double getPrecoDiaria() {
        return precoDiaria;
    }

    public void setPrecoDiaria(double precoDiaria) {
        this.precoDiaria = precoDiaria;
    }

    public boolean isDisponivel() {
        return disponivel;
    }

    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
    }
    
    public abstract String getTipo();
    
    public abstract double calcularDiaria();
}
