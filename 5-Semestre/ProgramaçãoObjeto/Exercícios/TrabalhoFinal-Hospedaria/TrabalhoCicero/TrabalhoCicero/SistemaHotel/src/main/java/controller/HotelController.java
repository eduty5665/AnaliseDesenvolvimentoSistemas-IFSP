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

    public HotelController(List<Cliente> clientes, List<Quarto> quartos, List<Reserva> reservas) {
        this.clientes = clientes;
        this.quartos = quartos;
        this.reservas = reservas;
    }
    
    public void adicionarCliente(Cliente cliente){
        clientes.add(cliente);
    }
    
    public List<Cliente> getClientes(){
        return clientes;
    }
    
    public void adicionarQuarto(Quarto quarto){
        quartos.add(quarto);
    }
    
    public List<Quarto> getQuartos(){
        return quartos;
    }
    
    public void adicionarReserva(Reserva reserva){
        reservas.add(reserva);
    }
    
    public List<Reserva> getReservas(){
        return reservas;
    }
}
