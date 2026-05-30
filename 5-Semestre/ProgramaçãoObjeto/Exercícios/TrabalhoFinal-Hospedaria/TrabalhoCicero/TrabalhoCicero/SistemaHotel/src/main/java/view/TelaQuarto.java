package view;

import java.awt.Color;
import java.awt.Font;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import model.Quarto;
import model.QuartoLuxo;
import model.QuartoSimples;

public class TelaQuarto extends javax.swing.JFrame {

    private static final List<QuartoCadastro> QUARTOS = new ArrayList<>();
    private static final DecimalFormat FORMATO_MOEDA = new DecimalFormat("0.00");

    private JButton btnListar;
    private JButton btnSalvar;
    private JButton btnVoltar;
    private JComboBox<String> cbTipo;
    private JLabel jLabelCapacidade;
    private JLabel jLabelNumero;
    private JLabel jLabelPreco;
    private JLabel jLabelTipo;
    private JLabel jLabelTitulo;
    private JPanel jPanelPrincipal;
    private JScrollPane jScrollPane1;
    private JTextArea txtAreaResultado;
    private JTextField txtCapacidade;
    private JTextField txtNumero;
    private JTextField txtPreco;

    public TelaQuarto() {
        initComponents();
        setLocationRelativeTo(null);
    }

    public static String gerarRelatorioQuartos() {
        if (QUARTOS.isEmpty()) {
            return "Nenhum quarto cadastrado.";
        }

        StringBuilder resultado = new StringBuilder("Relatorio de quartos:\n");
        for (QuartoCadastro cadastro : QUARTOS) {
            Quarto quarto = cadastro.quarto;
            resultado.append("Numero: ").append(quarto.getNumero())
                    .append(" | Tipo: ").append(cadastro.tipo)
                    .append(" | Diaria: R$ ").append(FORMATO_MOEDA.format(quarto.calcularDiaria()))
                    .append(" | Capacidade: ").append(cadastro.capacidade)
                    .append("\n");
        }
        return resultado.toString();
    }

    @SuppressWarnings("unchecked")
    private void initComponents() {
        jPanelPrincipal = new JPanel();
        jLabelTitulo = new JLabel();
        jLabelNumero = new JLabel();
        jLabelPreco = new JLabel();
        jLabelTipo = new JLabel();
        jLabelCapacidade = new JLabel();
        txtNumero = new JTextField();
        txtPreco = new JTextField();
        cbTipo = new JComboBox<>();
        txtCapacidade = new JTextField();
        btnSalvar = new JButton();
        btnListar = new JButton();
        btnVoltar = new JButton();
        jScrollPane1 = new JScrollPane();
        txtAreaResultado = new JTextArea();

        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setTitle("Quartos");

        jPanelPrincipal.setBackground(new Color(241, 245, 249));

        jLabelTitulo.setFont(new Font("Segoe UI", Font.BOLD, 20));
        jLabelTitulo.setForeground(new Color(30, 41, 59));
        jLabelTitulo.setText("GERENCIAMENTO DE QUARTOS");

        configurarLabel(jLabelNumero, "Numero:");
        configurarLabel(jLabelPreco, "Preco diaria:");
        configurarLabel(jLabelTipo, "Tipo:");
        configurarLabel(jLabelCapacidade, "Capacidade:");

        cbTipo.setModel(new DefaultComboBoxModel<>(new String[] { "Simples", "Luxo" }));

        configurarBotaoPrincipal(btnSalvar, "Salvar");
        btnSalvar.addActionListener(this::btnSalvarActionPerformed);

        configurarBotaoPrincipal(btnListar, "Listar");
        btnListar.addActionListener(this::btnListarActionPerformed);

        btnVoltar.setBackground(new Color(148, 163, 184));
        btnVoltar.setFont(new Font("Segoe UI", Font.BOLD, 14));
        btnVoltar.setForeground(Color.WHITE);
        btnVoltar.setText("Voltar");
        btnVoltar.setBorderPainted(false);
        btnVoltar.setFocusPainted(false);
        btnVoltar.addActionListener(this::btnVoltarActionPerformed);

        txtAreaResultado.setColumns(20);
        txtAreaResultado.setRows(5);
        txtAreaResultado.setEditable(false);
        txtAreaResultado.setLineWrap(true);
        txtAreaResultado.setWrapStyleWord(true);
        jScrollPane1.setViewportView(txtAreaResultado);

        javax.swing.GroupLayout jPanelPrincipalLayout = new javax.swing.GroupLayout(jPanelPrincipal);
        jPanelPrincipal.setLayout(jPanelPrincipalLayout);

        jPanelPrincipalLayout.setHorizontalGroup(
            jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                .addGap(40, 40, 40)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jLabelTitulo)
                    .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                        .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(jLabelNumero)
                            .addComponent(jLabelPreco)
                            .addComponent(jLabelTipo)
                            .addComponent(jLabelCapacidade))
                        .addGap(30, 30, 30)
                        .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(txtNumero)
                            .addComponent(txtPreco)
                            .addComponent(cbTipo, 0, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                            .addComponent(txtCapacidade, javax.swing.GroupLayout.PREFERRED_SIZE, 330, javax.swing.GroupLayout.PREFERRED_SIZE)))
                    .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                        .addComponent(btnSalvar, javax.swing.GroupLayout.PREFERRED_SIZE, 110, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(btnListar, javax.swing.GroupLayout.PREFERRED_SIZE, 110, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(btnVoltar, javax.swing.GroupLayout.PREFERRED_SIZE, 110, javax.swing.GroupLayout.PREFERRED_SIZE))
                    .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 480, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(40, Short.MAX_VALUE))
        );

        jPanelPrincipalLayout.setVerticalGroup(
            jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                .addGap(25, 25, 25)
                .addComponent(jLabelTitulo)
                .addGap(30, 30, 30)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelNumero)
                    .addComponent(txtNumero, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelPreco)
                    .addComponent(txtPreco, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelTipo)
                    .addComponent(cbTipo, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelCapacidade)
                    .addComponent(txtCapacidade, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(25, 25, 25)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(btnSalvar, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(btnListar, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(btnVoltar, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(25, 25, 25)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 90, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(30, Short.MAX_VALUE))
        );

        javax.swing.GroupLayout layout = new javax.swing.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);

        layout.setHorizontalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addComponent(jPanelPrincipal, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
        );

        layout.setVerticalGroup(
            layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addComponent(jPanelPrincipal, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
        );

        pack();
    }

    private void configurarLabel(JLabel label, String texto) {
        label.setFont(new Font("Segoe UI", Font.BOLD, 14));
        label.setForeground(new Color(30, 41, 59));
        label.setText(texto);
    }

    private void configurarBotaoPrincipal(JButton botao, String texto) {
        botao.setBackground(new Color(51, 65, 85));
        botao.setFont(new Font("Segoe UI", Font.BOLD, 14));
        botao.setForeground(Color.WHITE);
        botao.setText(texto);
        botao.setBorderPainted(false);
        botao.setFocusPainted(false);
    }

    private void btnSalvarActionPerformed(java.awt.event.ActionEvent evt) {
        String numeroTexto = txtNumero.getText().trim();
        String precoTexto = txtPreco.getText().trim().replace(",", ".");
        String capacidadeTexto = txtCapacidade.getText().trim();

        if (numeroTexto.isEmpty() || precoTexto.isEmpty() || capacidadeTexto.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Preencha todos os campos.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return;
        }

        int numero;
        double precoDiaria;
        int capacidade;

        try {
            numero = Integer.parseInt(numeroTexto);
            precoDiaria = Double.parseDouble(precoTexto);
            capacidade = Integer.parseInt(capacidadeTexto);
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Numero, preco e capacidade devem ser valores validos.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (precoDiaria <= 0 || capacidade <= 0) {
            JOptionPane.showMessageDialog(this, "Preco e capacidade devem ser maiores que zero.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (numeroJaCadastrado(numero)) {
            JOptionPane.showMessageDialog(this, "Ja existe um quarto com esse numero.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return;
        }

        String tipo = String.valueOf(cbTipo.getSelectedItem());
        Quarto quarto;

        if ("Luxo".equals(tipo)) {
            quarto = new QuartoLuxo(numero, precoDiaria, true, false);
        } else {
            quarto = new QuartoSimples(numero, precoDiaria, capacidade);
        }

        QuartoCadastro cadastro = new QuartoCadastro(quarto, tipo, capacidade);
        QUARTOS.add(cadastro);

        txtAreaResultado.setText("Quarto cadastrado:\n" + formatarQuarto(cadastro));
        limparCampos();
    }

    private void btnListarActionPerformed(java.awt.event.ActionEvent evt) {
        if (QUARTOS.isEmpty()) {
            txtAreaResultado.setText("Nenhum quarto cadastrado.");
            return;
        }

        StringBuilder resultado = new StringBuilder("Quartos cadastrados:\n");
        for (QuartoCadastro cadastro : QUARTOS) {
            resultado.append(formatarQuarto(cadastro)).append("\n");
        }

        txtAreaResultado.setText(resultado.toString());
    }

    private void btnVoltarActionPerformed(java.awt.event.ActionEvent evt) {
        dispose();
    }

    private boolean numeroJaCadastrado(int numero) {
        for (QuartoCadastro cadastro : QUARTOS) {
            if (cadastro.quarto.getNumero() == numero) {
                return true;
            }
        }
        return false;
    }

    private String formatarQuarto(QuartoCadastro cadastro) {
        Quarto quarto = cadastro.quarto;
        return "Numero: " + quarto.getNumero()
                + " | Tipo: " + cadastro.tipo
                + " | Diaria: R$ " + FORMATO_MOEDA.format(quarto.calcularDiaria())
                + " | Capacidade: " + cadastro.capacidade;
    }

    private void limparCampos() {
        txtNumero.setText("");
        txtPreco.setText("");
        txtCapacidade.setText("");
        cbTipo.setSelectedIndex(0);
        txtNumero.requestFocus();
    }

    private static class QuartoCadastro {
        private final Quarto quarto;
        private final String tipo;
        private final int capacidade;

        private QuartoCadastro(Quarto quarto, String tipo, int capacidade) {
            this.quarto = quarto;
            this.tipo = tipo;
            this.capacidade = capacidade;
        }
    }
}
