    package view;

    import java.util.Scanner;

    public class MenuView {
        private Scanner scanner = new Scanner(System.in);

        public void exibirMenuPrincipal() {
            System.out.println("\n===== HOTEL/POUSADA =====");
            System.out.println("1 - Cadastrar cliente");
            System.out.println("2 - Listar clientes");
            System.out.println("3 - Cadastrar quarto");
            System.out.println("4 - Listar quartos disponíveis");
            System.out.println("5 - Fazer reserva");
            System.out.println("6 - Cancelar reserva");
            System.out.println("7 - Listar reservas");
            System.out.println("0 - Sair");
            System.out.print("Escolha: ");
        }

        public int lerOpcao() { return scanner.nextInt(); }

        public String lerTexto(String label) {
            System.out.print(label + ": ");
            return scanner.next();
        }

        public double lerDouble(String label) {
            System.out.print(label + ": ");
            return scanner.nextDouble();
        }

        public int lerInt(String label) {
            System.out.print(label + ": ");
            return scanner.nextInt();
        }

        public void exibirMensagem(String msg) { System.out.println(msg); }
    }