package model;

public class Reserva implements Relatorio{
    private int idReserva;
    private Cliente cliente;
    private Quarto quarto;
    private String dataEntrada;
    private String dataSaida;
    private int numeroDias;
    private String status;

    public Reserva(int idReserva, Cliente cliente, Quarto quarto, String dataEntrada, String dataSaida, int numeroDias) {
        this.idReserva = idReserva;
        this.cliente = cliente;
        this.quarto = quarto;
        this.dataEntrada = dataEntrada;
        this.dataSaida = dataSaida;
        this.numeroDias = numeroDias;
        this.status = "OCUPADO";
    }

    public int getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(int idReserva) {
        this.idReserva = idReserva;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Quarto getQuarto() {
        return quarto;
    }

    public void setQuarto(Quarto quarto) {
        this.quarto = quarto;
    }

    public String getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(String dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public String getDataSaida() {
        return dataSaida;
    }

    public void setDataSaida(String dataSaida) {
        this.dataSaida = dataSaida;
    }

    public int getNumeroDias() {
        return numeroDias;
    }

    public void setNumeroDias(int numeroDias) {
        this.numeroDias = numeroDias;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    
    public double calcularTotal(){
        return numeroDias * quarto.calcularDiaria();
    }
    
    @Override
    public String gerarResumo(){
        return "Reserva " + getIdReserva()
                + "\nCliente: " + cliente.getNome()
                + "\nQuarto: " + quarto.getNumero()
                + "\nStatus: " + getStatus()
                + "\nData Entrada: " + getDataEntrada()
                + "\nData Saída: " + getDataSaida()
                + "\nQuantidade de Dias: " + getNumeroDias()
                + "\nValor: " + calcularTotal();
    }
    
    
}
