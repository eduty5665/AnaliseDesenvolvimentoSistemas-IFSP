package controller;

import java.util.ArrayList;
import java.util.List;

import model.Cliente;
import model.Quarto;
import model.Reserva;


public class HotelController {
    private List<Cliente> clientes;
    private List<Quarto> quartos;
    private List<Reserva> reservas;

    public HotelController() {
        this.clientes = new ArrayList<>();
        this.quartos = new ArrayList<>();
        this.reservas = new ArrayList<>();
    }
    public void adicionarCliente(Cliente cliente){
        clientes.add(cliente);
    }
    
    public List<Cliente> getClientes(){
        return clientes;
    }

    public Cliente buscarClientePorId(int idCliente) {
        for (Cliente cliente : clientes) {
            if (cliente.getIdCliente() == idCliente) {
                return cliente;
            }
        }
        return null;
    }
    
    public void adicionarQuarto(Quarto quarto){
        quartos.add(quarto);
    }
    
    public List<Quarto> getQuartos(){
        return quartos;
    }

    public Quarto buscarQuartoPorNumero(int numero) {
        for (Quarto quarto : quartos) {
            if (quarto.getNumero() == numero) {
                return quarto;
            }
        }
        return null;
    }

    public List<Quarto> getQuartosDisponiveis() {

        List<Quarto> disponiveis = new ArrayList<>();

        for (Quarto quarto : quartos) {
            if (quarto.isDisponivel()) {
                disponiveis.add(quarto);
            }
        }

        return disponiveis;
    }
    
    public void adicionarReserva(Reserva reserva){
        reservas.add(reserva);
        reserva.getQuarto().setDisponivel(false);
    }
    
    public List<Reserva> getReservas(){
        return reservas;
    }
    public void listarDiariasDisponiveis() {
        List<Quarto> disponiveis = getQuartosDisponiveis();
        for (Quarto q : disponiveis) {
            System.out.println("Quarto " + q.getNumero()
                + " | Tipo: " + q.getTipo()
                + " | Diaria: R$ " + q.calcularDiaria());
        }
    }
    public int contarQuartosDisponiveis() {

        int contador = 0;

        for (Quarto quarto : quartos) {
            if (quarto.isDisponivel()) {
                contador++;
            }
        }

        return contador;
    }

    public double calcularReceitaTotal() {

        double total = 0;

        for (Reserva reserva : reservas) {
            total += reserva.calcularTotal();
        }

        return total;
    }
}
