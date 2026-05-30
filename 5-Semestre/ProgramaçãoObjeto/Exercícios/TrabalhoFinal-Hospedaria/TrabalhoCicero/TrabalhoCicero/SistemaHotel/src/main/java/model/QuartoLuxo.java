package model;

public class QuartoLuxo extends Quarto{
    private boolean temJacuzzi;
    private boolean hidromsg;
    private double taxaLuxo;
    
    public QuartoLuxo(int numero, double precoDiaria, boolean disponivel, boolean temJacuzzi){
        super(numero, precoDiaria, disponivel);
        this.temJacuzzi = false;
        this.hidromsg = false;
        this.taxaLuxo = taxaLuxo;
    }

    public boolean getTemJacuzzi() {
        return temJacuzzi;
    }

    public void setTemJacuzzi(boolean temJacuzzi) {
        this.temJacuzzi = temJacuzzi;
    }

    public boolean getHidromsg() {
        return hidromsg;
    }

    public void setHidromsg(boolean hidromsg) {
        this.hidromsg = hidromsg;
    }

    public double getTaxaLuxo() {
        return taxaLuxo;
    }

    public void setTaxaLuxo(double taxaLuxo) {
        this.taxaLuxo = taxaLuxo;
    }
    
    @Override
    public String getTipo(){
        return "Luxo";
    }
    
    @Override
    public double calcularDiaria(){
        return getPrecoDiaria() + getTaxaLuxo();
    }
    
    
}
