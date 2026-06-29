package view;

import controller.HotelController;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.text.NumberFormat;
import java.util.Locale;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingConstants;

import model.Cliente;
import model.Quarto;
import model.QuartoLuxo;
import model.QuartoSimples;
import model.Reserva;

public class TelaRelatorio extends JFrame {

    private final HotelController controller;
    private final TelaPrincipal telaPrincipal;

    private final JComboBox<String> tipoRelatorio = new JComboBox<>(
            new String[]{"Resumo geral", "Clientes", "Quartos", "Reservas"});
    private final JTextArea area = new JTextArea();

    public TelaRelatorio(HotelController controller, TelaPrincipal telaPrincipal) {
        this.controller = controller;
        this.telaPrincipal = telaPrincipal;

        initComponents();
        gerarRelatorio();
    }

    private void initComponents() {
        setTitle("Relatorios");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(780, 520);

        JPanel raiz = new JPanel(new BorderLayout(14, 14));
        raiz.setBorder(BorderFactory.createEmptyBorder(18, 18, 18, 18));
        raiz.setBackground(new Color(241, 245, 249));

        JLabel titulo = new JLabel("Relatorios");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 22));

        JButton gerar = new JButton("Gerar");
        gerar.addActionListener(event -> gerarRelatorio());
        JButton voltar = new JButton("Voltar");
        voltar.setVerticalAlignment(SwingConstants.TOP);

        JPanel topo = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.LEFT));
        topo.setOpaque(false);
        topo.add(titulo);
        topo.add(tipoRelatorio);
        topo.add(gerar);
        topo.add(voltar);
        voltar.addActionListener(event -> {
            if (telaPrincipal != null) {
                telaPrincipal.setVisible(true);
            }
            dispose();
        });

        area.setEditable(false);
        area.setFont(new Font("Consolas", Font.PLAIN, 14));

        raiz.add(topo, BorderLayout.NORTH);
        raiz.add(new JScrollPane(area), BorderLayout.CENTER);
        add(raiz);
    }

    private void gerarRelatorio() {
        String tipo = String.valueOf(tipoRelatorio.getSelectedItem());
        if ("Clientes".equals(tipo)) {
            relatorioClientes();
        } else if ("Quartos".equals(tipo)) {
            relatorioQuartos();
        } else if ("Reservas".equals(tipo)) {
            relatorioReservas();
        } else {
            relatorioGeral();
        }
    }

    private void relatorioGeral() {
        NumberFormat moeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        StringBuilder texto = new StringBuilder();
        texto.append("RESUMO GERAL\n\n");
        texto.append("Clientes cadastrados: ").append(controller.getClientes().size()).append("\n");
        texto.append("Quartos cadastrados: ").append(controller.getQuartos().size()).append("\n");
        texto.append("Quartos disponiveis: ").append(controller.contarQuartosDisponiveis()).append("\n");
        texto.append("Reservas cadastradas: ").append(controller.getReservas().size()).append("\n");
        texto.append("Receita total: ").append(moeda.format(controller.calcularReceitaTotal())).append("\n");
        area.setText(texto.toString());
    }

    private void relatorioClientes() {
        StringBuilder texto = new StringBuilder("CLIENTES\n\n");
        for (Cliente cliente : controller.getClientes()) {
            texto.append(cliente.apresentar()).append("\n");
            texto.append(cliente.gerarResumo()).append("\n\n");
        }
        area.setText(texto.toString());
    }

    private void relatorioQuartos() {
        NumberFormat moeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        StringBuilder texto = new StringBuilder("QUARTOS\n\n");
        for (Quarto quarto : controller.getQuartos()) {
            texto.append("Quarto: ").append(quarto.getNumero()).append("\n");
            texto.append("Tipo: ").append(quarto.getTipo()).append("\n");
            texto.append("Preco base: ").append(moeda.format(quarto.getPrecoDiaria())).append("\n");
            texto.append("Diaria calculada: ").append(moeda.format(quarto.calcularDiaria())).append("\n");
            texto.append("Disponivel: ").append(quarto.isDisponivel() ? "Sim" : "Nao").append("\n");
            if (quarto instanceof QuartoSimples simples) {
                texto.append("Capacidade: ").append(simples.getCapacidadePessoas()).append("\n");
            }
            if (quarto instanceof QuartoLuxo luxo) {
                texto.append("Taxa luxo: ").append(moeda.format(luxo.getTaxaLuxo())).append("\n");
                texto.append("Jacuzzi: ").append(luxo.getTemJacuzzi() ? "Sim" : "Nao").append("\n");
                texto.append("Hidromassagem: ").append(luxo.getHidromsg() ? "Sim" : "Nao").append("\n");
            }
            texto.append("\n");
        }
        area.setText(texto.toString());
    }

    private void relatorioReservas() {
        StringBuilder texto = new StringBuilder("RESERVAS\n\n");
        for (Reserva reserva : controller.getReservas()) {
            texto.append(reserva.gerarResumo()).append("\n");
        }
        area.setText(texto.toString());
    }
}
