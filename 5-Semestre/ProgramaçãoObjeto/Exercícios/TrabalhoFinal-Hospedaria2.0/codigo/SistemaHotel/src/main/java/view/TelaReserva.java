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
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.table.DefaultTableModel;
import model.Cliente;
import model.Quarto;
import model.Reserva;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class TelaReserva extends JFrame {

    private final HotelController controller;
    private final TelaPrincipal telaPrincipal;
    private final JComboBox<String> campoCliente = new JComboBox<>();
    private final JComboBox<String> campoQuarto = new JComboBox<>();
    private final JTextField campoEntrada = new JTextField();
    private final JTextField campoSaida = new JTextField();
    private final DefaultTableModel modelo = new DefaultTableModel(
            new Object[]{"ID", "Cliente", "Quarto", "Entrada", "Saida", "Dias", "Total"}, 0);

    public TelaReserva(HotelController controller, TelaPrincipal telaPrincipal) {
        this.controller = controller;
        this.telaPrincipal = telaPrincipal;
        initComponents();
        carregarCombos();
        carregarTabela();
    }

    private void initComponents() {
        setTitle("Cadastro de Reservas");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(920, 520);

        JPanel raiz = new JPanel(new BorderLayout(14, 14));
        raiz.setBorder(BorderFactory.createEmptyBorder(18, 18, 18, 18));
        raiz.setBackground(new Color(241, 245, 249));

        JLabel titulo = new JLabel("Reservas");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 22));

        JPanel formulario = new JPanel(new java.awt.GridLayout(6, 2, 10, 8));
        formulario.setOpaque(false);
        adicionarCampo(formulario, "Cliente", campoCliente);
        adicionarCampo(formulario, "Quarto disponivel", campoQuarto);
        adicionarCampo(formulario, "Data entrada", campoEntrada);
        adicionarCampo(formulario, "Data saida", campoSaida);
    

        JPanel botoes = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.LEFT));
        botoes.setOpaque(false);
        JButton salvar = new JButton("Cadastrar");
        JButton total = new JButton("Calcular Total");
        JButton limpar = new JButton("Limpar");
        JButton voltar = new JButton("Voltar");
        voltar.setVerticalAlignment(SwingConstants.TOP);
        salvar.addActionListener(event -> cadastrarReserva());
        total.addActionListener(event -> calcularTotalPrevisto());
        limpar.addActionListener(event -> limparCampos());
        
        voltar.addActionListener(event -> {
            if (telaPrincipal != null) {
                telaPrincipal.setVisible(true);
            }
            dispose();
        });
        
        botoes.add(salvar);
        botoes.add(total);
        botoes.add(limpar);
        botoes.add(voltar);

        JPanel topo = new JPanel(new BorderLayout(0, 12));
        topo.setOpaque(false);
        topo.add(titulo, BorderLayout.NORTH);
        topo.add(formulario, BorderLayout.CENTER);
        topo.add(botoes, BorderLayout.SOUTH);

        JTable tabela = new JTable(modelo);
        tabela.setFillsViewportHeight(true);

        raiz.add(topo, BorderLayout.NORTH);
        raiz.add(new JScrollPane(tabela), BorderLayout.CENTER);
        add(raiz);
    }

    private void adicionarCampo(JPanel painel, String label, java.awt.Component campo) {
        painel.add(new JLabel(label));
        painel.add(campo);
    }

    private void carregarCombos() {
        campoCliente.removeAllItems();
        for (Cliente cliente : controller.getClientes()) {
            campoCliente.addItem(cliente.getIdCliente() + " - " + cliente.getNome());
        }

        campoQuarto.removeAllItems();
        for (Quarto quarto : controller.getQuartosDisponiveis()) {
            campoQuarto.addItem(quarto.getNumero() + " - " + quarto.getTipo());
        }
    }

    private void cadastrarReserva() {
            if (campoCliente.getSelectedItem() == null || campoQuarto.getSelectedItem() == null) {
                JOptionPane.showMessageDialog(this, "Cadastre ao menos um cliente e um quarto disponivel.");
                return;
            }
            Cliente cliente =
            		controller.buscarClientePorId(idSelecionado(campoCliente));

            Quarto quarto =
            	    controller.buscarQuartoPorNumero(idSelecionado(campoQuarto));
           
            DateTimeFormatter formato =
                    DateTimeFormatter.ofPattern("dd/MM/yyyy");

            LocalDate entrada =
                    LocalDate.parse(campoEntrada.getText().trim(), formato);

            LocalDate saida =
                    LocalDate.parse(campoSaida.getText().trim(), formato);

            if (!saida.isAfter(entrada)) {
                JOptionPane.showMessageDialog(
                        this,
                        "A data de saída deve ser posterior à data de entrada.");
                return;
            }

            Reserva reserva = new Reserva(
                    cliente,
                    quarto,
                    entrada,
                    saida);
            
            controller.adicionarReserva(reserva);
            carregarCombos();
            carregarTabela();
            limparCampos();
            atualizarPrincipal();

    }

    private void calcularTotalPrevisto() {
        try {

            if (campoQuarto.getSelectedItem() == null) {
                JOptionPane.showMessageDialog(this, "Selecione um quarto disponivel.");
                return;
            }

            Quarto quarto =
                    controller.buscarQuartoPorNumero(idSelecionado(campoQuarto));

            DateTimeFormatter formato =
                    DateTimeFormatter.ofPattern("dd/MM/yyyy");

            LocalDate entrada =
                    LocalDate.parse(campoEntrada.getText().trim(), formato);

            LocalDate saida =
                    LocalDate.parse(campoSaida.getText().trim(), formato);

            Reserva reservaTemp = new Reserva(
                    null,
                    quarto,
                    entrada,
                    saida);

            double total = reservaTemp.calcularTotal();

            NumberFormat moeda =
                    NumberFormat.getCurrencyInstance(
                            new Locale("pt", "BR"));

            JOptionPane.showMessageDialog(this,
                    "Dias: " + reservaTemp.getNumeroDias()
                    + "\nTotal previsto: "
                    + moeda.format(total));

        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this,
                    "Informe as datas no formato dd/MM/yyyy");
        }
    }

    private int idSelecionado(JComboBox<String> combo) {
        String item = String.valueOf(combo.getSelectedItem());
        return Integer.parseInt(item.substring(0, item.indexOf(" - ")).trim());
    }

    private void carregarTabela() {
        NumberFormat moeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        modelo.setRowCount(0);
        for (Reserva reserva : controller.getReservas()) {
            modelo.addRow(new Object[]{
                reserva.getIdReserva(),
                reserva.getCliente().getNome(),
                reserva.getQuarto().getNumero(),
                reserva.getDataEntrada(),
                reserva.getDataSaida(),
                reserva.getNumeroDias(),
                moeda.format(reserva.calcularTotal())
            });
        }
    }

    private void limparCampos() {
        campoEntrada.setText("");
        campoSaida.setText("");
    }

    private void atualizarPrincipal() {
        if (telaPrincipal != null) {
            telaPrincipal.atualizarIndicadores();
        }
    }
}
