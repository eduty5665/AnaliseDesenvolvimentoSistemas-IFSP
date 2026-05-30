package controller;

import model.*;
import view.MenuView;
import java.util.ArrayList;
import java.util.List;

public class ReservaController {
    private List<Cliente> clientes = new ArrayList<>();
    private List<Quarto> quartos = new ArrayList<>();
    private List<Reserva> reservas = new ArrayList<>();
    private int proximoIdCliente = 1;
    private int proximoIdReserva = 1;

    public void cadastrarCliente(String nome, String cpf, String telefone, String email) {
        clientes.add(new Cliente(proximoIdCliente++, nome, cpf, telefone, email));
        System.out.println("Cliente cadastrado com sucesso!");
    }

    public void listarClientes() {
        if (clientes.isEmpty()) { System.out.println("Nenhum cliente cadastrado."); return; }
        // POLIMORFISMO: referência comum Pessoa chamando apresentar()
        List<Pessoa> pessoas = new ArrayList<>(clientes);
        for (Pessoa p : pessoas) {
            System.out.println(p.apresentar());
        }
    }

    public void cadastrarQuartoSimples(int numero, double precoDiaria, int capacidadePessoas) {
        quartos.add(new QuartoSimples(numero, precoDiaria, capacidadePessoas));
        System.out.println("Quarto simples cadastrado!");
    }

    public void cadastrarQuartoLuxo(int numero, double precoDiaria, boolean temJacuzzi, boolean hidromsg) {
        quartos.add(new QuartoLuxo(numero, precoDiaria, temJacuzzi, hidromsg));
        System.out.println("Quarto luxo cadastrado!");
    }

    public void listarQuartosDisponiveis() {
        // POLIMORFISMO: referência comum Quarto chamando getTipo() e calcularDiaria()
        for (Quarto q : quartos) {
            if (q.isDisponivel()) {
                System.out.println("Quarto " + q.getNumero() + " | Tipo: " + q.getTipo() + " | Diária: R$ " + q.calcularDiaria());
            }
        }
    }

    public void fazerReserva(int idCliente, Quarto quarto, String dataEntrada, String dataSaida, int numeroDias) {
        Cliente cliente = buscarCliente(idCliente);
        if (cliente == null) { System.out.println("Cliente não encontrado."); return; }
        if (!quarto.isDisponivel()) { System.out.println("Quarto indisponível."); return; }
        quarto.setDisponivel(false);
        reservas.add(new Reserva(proximoIdReserva++, cliente, quarto, dataEntrada, dataSaida, numeroDias));
        System.out.println("Reserva realizada com sucesso!");
    }
    

    public void cancelarReserva(int idReserva) {
        for (Reserva r : reservas) {
            if (r.getIdReserva() == idReserva) {
                r.setStatus("CANCELADA");
                r.getQuarto().setDisponivel(true);
                System.out.println("Reserva cancelada.");
                return;
            }
        }
        System.out.println("Reserva não encontrada.");
    }

    public void listarReservas() {
        if (reservas.isEmpty()) { System.out.println("Nenhuma reserva encontrada."); return; }
        // POLIMORFISMO: gerarResumo() via interface Relatorio
        List<Relatorio> relatorios = new ArrayList<>(reservas);
        for (Relatorio r : relatorios) {
            System.out.println(r.gerarResumo());
        }
    }

    private Cliente buscarCliente(int id) {
        for (Cliente c : clientes) {
            if (c.getIdCliente() == id) return c;
        }
        return null;
    }

    public List<Quarto> getQuartos() { return quartos; }
}
