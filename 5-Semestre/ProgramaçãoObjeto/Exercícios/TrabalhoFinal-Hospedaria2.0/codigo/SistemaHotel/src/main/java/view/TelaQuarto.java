package view;

import controller.HotelController;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import java.text.NumberFormat;
import java.util.Locale;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
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
import model.Quarto;
import model.QuartoLuxo;
import model.QuartoSimples;

public class TelaQuarto extends JFrame {

    private final HotelController controller;
    private final TelaPrincipal telaPrincipal;
    private final JTextField campoNumero = new JTextField();
    private final JTextField campoPreco = new JTextField();
    private final JTextField campoCapacidade = new JTextField();
    private final JTextField campoTaxaLuxo = new JTextField();
    private final JComboBox<String> campoTipo = new JComboBox<>(new String[]{"Simples", "Luxo"});
    private final JCheckBox campoJacuzzi = new JCheckBox("Jacuzzi");
    private final JCheckBox campoHidromsg = new JCheckBox("Hidromassagem");
    private final DefaultTableModel modelo = new DefaultTableModel(
            new Object[]{"Numero", "Tipo", "Diaria", "Disponivel", "Detalhes"}, 0);

    public TelaQuarto(HotelController controller, TelaPrincipal telaPrincipal) {
        this.controller = controller;
        this.telaPrincipal = telaPrincipal;
        initComponents();
        carregarTabela();
    }

    private void initComponents() {
        setTitle("Cadastro de Quartos");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(820, 500);

        JPanel raiz = new JPanel(new BorderLayout(14, 14));
        raiz.setBorder(BorderFactory.createEmptyBorder(18, 18, 18, 18));
        raiz.setBackground(new Color(241, 245, 249));

        JLabel titulo = new JLabel("Quartos");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 22));

        JPanel formulario = new JPanel(new java.awt.GridLayout(5, 2, 10, 8));
        formulario.setOpaque(false);
        adicionarCampo(formulario, "Numero", campoNumero);
        adicionarCampo(formulario, "Preco diaria", campoPreco);
        adicionarCampo(formulario, "Tipo", campoTipo);
        adicionarCampo(formulario, "Capacidade", campoCapacidade);
        adicionarCampo(formulario, "Taxa luxo", campoTaxaLuxo);

        JPanel extras = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.LEFT));
        extras.setOpaque(false);
        extras.add(campoJacuzzi);
        extras.add(campoHidromsg);

        JPanel botoes = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.LEFT));
        botoes.setOpaque(false);
        JButton salvar = new JButton("Cadastrar");
        JButton limpar = new JButton("Limpar");
        JButton voltar = new JButton("Voltar");
        salvar.addActionListener(event -> cadastrarQuarto());
        limpar.addActionListener(event -> limparCampos());
        botoes.add(salvar);
        botoes.add(limpar);
        botoes.add(voltar);
        voltar.setVerticalAlignment(SwingConstants.TOP);
        voltar.addActionListener(event -> {
            if (telaPrincipal != null) {
                telaPrincipal.setVisible(true);
            }
            dispose();
        });

        JPanel topo = new JPanel(new BorderLayout(0, 12));
        topo.setOpaque(false);
        topo.add(titulo, BorderLayout.NORTH);
        topo.add(formulario, BorderLayout.CENTER);
        topo.add(extras, BorderLayout.WEST);
        topo.add(botoes, BorderLayout.SOUTH);

        JTable tabela = new JTable(modelo);
        tabela.setFillsViewportHeight(true);

        raiz.add(topo, BorderLayout.NORTH);
        raiz.add(new JScrollPane(tabela), BorderLayout.CENTER);

        campoTipo.addActionListener(e -> atualizarCamposPorTipo());

        campoJacuzzi.addActionListener(e -> atualizarTaxaLuxo());

        campoHidromsg.addActionListener(e -> atualizarTaxaLuxo());
        
        atualizarCamposPorTipo();
        add(raiz);
    }

    private void adicionarCampo(JPanel painel, String label, java.awt.Component campo) {
        painel.add(new JLabel(label));
        painel.add(campo);
    }
    private void atualizarCamposPorTipo() {

        if ("Simples".equals(campoTipo.getSelectedItem())) {

            campoPreco.setText("250,00");
            campoTaxaLuxo.setText("0");

            campoTaxaLuxo.setEnabled(false);

            campoJacuzzi.setSelected(false);
            campoHidromsg.setSelected(false);

            campoJacuzzi.setEnabled(false);
            campoHidromsg.setEnabled(false);

        } else {

            campoTaxaLuxo.setEnabled(true);

            campoJacuzzi.setEnabled(true);
            campoHidromsg.setEnabled(true);

            atualizarTaxaLuxo();
        }
    }
    private void atualizarTaxaLuxo() {

        double taxa = 0;

        if (campoJacuzzi.isSelected()) {
            taxa += 50;
        }

        if (campoHidromsg.isSelected()) {
            taxa += 50;
        }

        campoTaxaLuxo.setText(String.valueOf(taxa));
    }

    private void cadastrarQuarto() {
        try {
            int numero = Integer.parseInt(campoNumero.getText().trim());
            if (controller.buscarQuartoPorNumero(numero) != null) {
            	JOptionPane.showMessageDialog(this, "Ja existe um quarto com esse numero.");
                return;
            }

            double precoBase = Double.parseDouble(
                    campoPreco.getText().trim().replace(",", "."));

            double taxaLuxo;

            if (campoTaxaLuxo.getText().isBlank()) {
                taxaLuxo = 0;
            } else {
                taxaLuxo = Double.parseDouble(
                        campoTaxaLuxo.getText().trim().replace(",", "."));
            }

            double preco = precoBase + taxaLuxo;
            Quarto quarto;
            if ("Luxo".equals(campoTipo.getSelectedItem())) {
            	double taxa;

            	if (campoTaxaLuxo.getText().isBlank()) {
            	    taxa = 0;
            	} else {
            	    taxa = Double.parseDouble(
            	            campoTaxaLuxo.getText().trim().replace(",", "."));
            	}
                quarto = new QuartoLuxo(numero, preco, true,
                        campoJacuzzi.isSelected(), campoHidromsg.isSelected(), taxa);
            } else {
            	int capacidade;

            	if (campoCapacidade.getText().isBlank()) {
            	    capacidade = 1;
            	} else {
            	    capacidade = Integer.parseInt(
            	            campoCapacidade.getText().trim());
            	}
                quarto = new QuartoSimples(numero, preco,
                        true, capacidade);
                }

            controller.adicionarQuarto(quarto);
            carregarTabela();
            limparCampos();
            atualizarPrincipal();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Confira numero, preco, capacidade e taxa.");
        }
    }

    private void carregarTabela() {
        NumberFormat moeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        modelo.setRowCount(0);
        for (Quarto quarto : controller.getQuartos()) {
            modelo.addRow(new Object[]{
                quarto.getNumero(),
                quarto.getTipo(),
                moeda.format(quarto.calcularDiaria()),
                quarto.isDisponivel() ? "Sim" : "Nao",
                detalhes(quarto)
            });
        }
    }

    private String detalhes(Quarto quarto) {
        if (quarto instanceof QuartoSimples simples) {
            return "Capacidade: " + simples.getCapacidadePessoas();
        }
        if (quarto instanceof QuartoLuxo luxo) {
            return "Taxa: " + luxo.getTaxaLuxo()
                    + ", Jacuzzi: " + (luxo.getTemJacuzzi() ? "Sim" : "Nao")
                    + ", Hidro: " + (luxo.getHidromsg() ? "Sim" : "Nao");
        }
        return "";
    }

    private void limparCampos() {
        campoNumero.setText("");
        campoPreco.setText("");
        campoCapacidade.setText("");
        campoTaxaLuxo.setText("");
        campoTipo.setSelectedIndex(0);
        campoJacuzzi.setSelected(false);
        campoHidromsg.setSelected(false);
    }

    private void atualizarPrincipal() {
        if (telaPrincipal != null) {
            telaPrincipal.atualizarIndicadores();
        }
    }
}
