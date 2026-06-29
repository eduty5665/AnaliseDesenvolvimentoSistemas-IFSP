package model;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;


public class Reserva implements Relatorio{
	
	public static int proximoId = 1;
	
	
    private int idReserva;
    private Cliente cliente;
    private Quarto quarto;
    private LocalDate dataEntrada;
    private LocalDate dataSaida;

    public Reserva(Cliente cliente, Quarto quarto,
            LocalDate dataEntrada,
            LocalDate dataSaida) {

        this.idReserva = proximoId++;
        this.cliente = cliente;
        this.quarto = quarto;
        this.dataEntrada = dataEntrada;
        this.dataSaida = dataSaida;
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

    public LocalDate getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDate dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public LocalDate getDataSaida() {
        return dataSaida;
    }

    public void setDataSaida(LocalDate dataSaida) {
        this.dataSaida = dataSaida;
    }

    public int getNumeroDias() {
        return (int) ChronoUnit.DAYS.between(dataEntrada, dataSaida);
    }
    
    public double calcularTotal(){
        return getNumeroDias() * quarto.calcularDiaria();
    }
    
    @Override
    public String gerarResumo(){
        return "Reserva " + getIdReserva()
                + "\nCliente: " + cliente.getNome()
                + "\nQuarto: " + quarto.getNumero()
                + "\nData Entrada: " + getDataEntrada()
                + "\nData Saida: " + getDataSaida()
                + "\nQuantidade de Dias: " + getNumeroDias()       
                + "\nValor: R$ " + calcularTotal(); 
    }
    
    
}
