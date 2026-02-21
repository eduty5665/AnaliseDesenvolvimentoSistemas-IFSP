package br.com.cicerosnt.exercicio.cliente.conta;

public class ClienteCliente {

    public static void main(String[] args) {
        Cliente cliente1 = new Cliente(1, "Ana", 5000, 700);
        cliente1.abrirConta(123, "001", 1000);
        cliente1.infoCliente();

        cliente1.conta.depositar(1000);
        cliente1.conta.sacar(1500);       
        
        Cliente cliente2 = new Cliente(2, "Bruno", 3000, 650);
        cliente2.abrirConta(456, "001", 500);
        
        cliente2.infoCliente();

        cliente1.conta.transferir(cliente2.conta, 300);

        cliente1.solicitarEmprestimo(2000);

        System.out.println("Saldo Cliente 1: " + cliente1.conta.consultarSaldo());
        System.out.println("Saldo Cliente 2: " + cliente2.conta.consultarSaldo());
    }
}

