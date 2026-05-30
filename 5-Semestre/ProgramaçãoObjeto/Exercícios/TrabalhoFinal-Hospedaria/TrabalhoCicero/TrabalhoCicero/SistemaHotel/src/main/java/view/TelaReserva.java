package view;

import java.awt.Color;
import java.awt.Font;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import model.Cliente;
import model.Quarto;
import model.QuartoSimples;
import model.Reserva;

public class TelaReserva extends javax.swing.JFrame {

    private static final List<Reserva> RESERVAS = new ArrayList<>();
    private static final DateTimeFormatter FORMATO_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FORMATO_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DecimalFormat FORMATO_MOEDA = new DecimalFormat("0.00");

    private JButton btnCancelar;
    private JButton btnReservar;
    private JButton btnVoltar;
    private JLabel jLabelCliente;
    private JLabel jLabelEntrada;
    private JLabel jLabelQuarto;
    private JLabel jLabelSaida;
    private JLabel jLabelTitulo;
    private JPanel jPanelPrincipal;
    private JScrollPane jScrollPane1;
    private JTextArea txtAreaResultado;
    private JTextField txtCliente;
    private JTextField txtEntrada;
    private JTextField txtQuarto;
    private JTextField txtSaida;

    public TelaReserva() {
        initComponents();
        setLocationRelativeTo(null);
    }

    public static String gerarRelatorioReservas() {
        if (RESERVAS.isEmpty()) {
            return "Nenhuma reserva cadastrada.";
        }

        StringBuilder resultado = new StringBuilder("Relatorio de reservas:\n");
        for (Reserva reserva : RESERVAS) {
            resultado.append("ID: ").append(reserva.getIdReserva())
                    .append(" | Cliente: ").append(reserva.getCliente().getIdCliente())
                    .append(" | Quarto: ").append(reserva.getQuarto().getNumero())
                    .append(" | Entrada: ").append(reserva.getDataEntrada())
                    .append(" | Saida: ").append(reserva.getDataSaida())
                    .append(" | Dias: ").append(reserva.getNumeroDias())
                    .append(" | Total: R$ ").append(FORMATO_MOEDA.format(reserva.calcularTotal()))
                    .append(" | Status: ").append(reserva.getStatus())
                    .append("\n");
        }
        return resultado.toString();
    }

    @SuppressWarnings("unchecked")
    private void initComponents() {
        jPanelPrincipal = new JPanel();
        jLabelTitulo = new JLabel();
        jLabelCliente = new JLabel();
        jLabelQuarto = new JLabel();
        jLabelEntrada = new JLabel();
        jLabelSaida = new JLabel();
        txtCliente = new JTextField();
        txtQuarto = new JTextField();
        txtEntrada = new JTextField();
        txtSaida = new JTextField();
        btnReservar = new JButton();
        btnCancelar = new JButton();
        btnVoltar = new JButton();
        jScrollPane1 = new JScrollPane();
        txtAreaResultado = new JTextArea();

        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setTitle("Reservas");

        jPanelPrincipal.setBackground(new Color(241, 245, 249));

        jLabelTitulo.setFont(new Font("Segoe UI", Font.BOLD, 20));
        jLabelTitulo.setForeground(new Color(30, 41, 59));
        jLabelTitulo.setText("GERENCIAMENTO DE RESERVAS");

        configurarLabel(jLabelCliente, "ID Cliente:");
        configurarLabel(jLabelQuarto, "No Quarto:");
        configurarLabel(jLabelEntrada, "Entrada:");
        configurarLabel(jLabelSaida, "Saida:");

        configurarBotaoPrincipal(btnReservar, "Reservar");
        btnReservar.addActionListener(this::btnReservarActionPerformed);

        configurarBotaoPrincipal(btnCancelar, "Cancelar");
        btnCancelar.addActionListener(this::btnCancelarActionPerformed);

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
                            .addComponent(jLabelCliente)
                            .addComponent(jLabelQuarto)
                            .addComponent(jLabelEntrada)
                            .addComponent(jLabelSaida))
                        .addGap(30, 30, 30)
                        .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(txtCliente)
                            .addComponent(txtQuarto)
                            .addComponent(txtEntrada)
                            .addComponent(txtSaida, javax.swing.GroupLayout.PREFERRED_SIZE, 330, javax.swing.GroupLayout.PREFERRED_SIZE)))
                    .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                        .addComponent(btnReservar, javax.swing.GroupLayout.PREFERRED_SIZE, 110, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(btnCancelar, javax.swing.GroupLayout.PREFERRED_SIZE, 110, javax.swing.GroupLayout.PREFERRED_SIZE)
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
                    .addComponent(jLabelCliente)
                    .addComponent(txtCliente, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelQuarto)
                    .addComponent(txtQuarto, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelEntrada)
                    .addComponent(txtEntrada, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelSaida)
                    .addComponent(txtSaida, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(25, 25, 25)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(btnReservar, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(btnCancelar, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
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

    private void btnReservarActionPerformed(java.awt.event.ActionEvent evt) {
        DadosReserva dados = lerDadosReserva();
        if (dados == null) {
            return;
        }

        if (quartoOcupado(dados.numeroQuarto)) {
            JOptionPane.showMessageDialog(this, "Este quarto ja possui uma reserva ativa.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return;
        }

        Cliente cliente = new Cliente(dados.idCliente, "Cliente " + dados.idCliente, "", "", "");
        Quarto quarto = new QuartoSimples(dados.numeroQuarto, 0, 1);
        quarto.setDisponivel(false);

        Reserva reserva = new Reserva(RESERVAS.size() + 1, cliente, quarto, dados.entradaTexto, dados.saidaTexto, dados.numeroDias);
        RESERVAS.add(reserva);

        txtAreaResultado.setText("Reserva criada:\n" + formatarReserva(reserva));
        limparCampos();
    }

    private void btnCancelarActionPerformed(java.awt.event.ActionEvent evt) {
        DadosReserva dados = lerDadosReserva();
        if (dados == null) {
            return;
        }

        Reserva reserva = buscarReservaAtiva(dados.idCliente, dados.numeroQuarto);
        if (reserva == null) {
            txtAreaResultado.setText("Nenhuma reserva ativa encontrada para esse cliente e quarto.");
            return;
        }

        reserva.setStatus("CANCELADA");
        reserva.getQuarto().setDisponivel(true);
        txtAreaResultado.setText("Reserva cancelada:\n" + formatarReserva(reserva));
        limparCampos();
    }

    private void btnVoltarActionPerformed(java.awt.event.ActionEvent evt) {
        dispose();
    }

    private DadosReserva lerDadosReserva() {
        String clienteTexto = txtCliente.getText().trim();
        String quartoTexto = txtQuarto.getText().trim();
        String entradaTexto = txtEntrada.getText().trim();
        String saidaTexto = txtSaida.getText().trim();

        if (clienteTexto.isEmpty() || quartoTexto.isEmpty() || entradaTexto.isEmpty() || saidaTexto.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Preencha todos os campos.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return null;
        }

        int idCliente;
        int numeroQuarto;

        try {
            idCliente = Integer.parseInt(clienteTexto);
            numeroQuarto = Integer.parseInt(quartoTexto);
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "ID do cliente e numero do quarto devem ser numeros validos.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return null;
        }

        LocalDate entrada = converterData(entradaTexto);
        LocalDate saida = converterData(saidaTexto);

        if (entrada == null || saida == null) {
            JOptionPane.showMessageDialog(this, "Use datas no formato dd/MM/aaaa ou aaaa-MM-dd.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return null;
        }

        long dias = ChronoUnit.DAYS.between(entrada, saida);
        if (dias <= 0) {
            JOptionPane.showMessageDialog(this, "A data de saida deve ser depois da entrada.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return null;
        }

        return new DadosReserva(idCliente, numeroQuarto, entrada.format(FORMATO_BR), saida.format(FORMATO_BR), (int) dias);
    }

    private LocalDate converterData(String texto) {
        try {
            return LocalDate.parse(texto, FORMATO_BR);
        } catch (DateTimeParseException ex) {
            try {
                return LocalDate.parse(texto, FORMATO_ISO);
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }
    }

    private boolean quartoOcupado(int numeroQuarto) {
        for (Reserva reserva : RESERVAS) {
            if (reserva.getQuarto().getNumero() == numeroQuarto && "OCUPADO".equals(reserva.getStatus())) {
                return true;
            }
        }
        return false;
    }

    private Reserva buscarReservaAtiva(int idCliente, int numeroQuarto) {
        for (Reserva reserva : RESERVAS) {
            boolean mesmoCliente = reserva.getCliente().getIdCliente() == idCliente;
            boolean mesmoQuarto = reserva.getQuarto().getNumero() == numeroQuarto;
            if (mesmoCliente && mesmoQuarto && "OCUPADO".equals(reserva.getStatus())) {
                return reserva;
            }
        }
        return null;
    }

    private String formatarReserva(Reserva reserva) {
        return "ID: " + reserva.getIdReserva()
                + " | Cliente: " + reserva.getCliente().getIdCliente()
                + " | Quarto: " + reserva.getQuarto().getNumero()
                + " | Entrada: " + reserva.getDataEntrada()
                + " | Saida: " + reserva.getDataSaida()
                + " | Dias: " + reserva.getNumeroDias()
                + " | Total: R$ " + FORMATO_MOEDA.format(reserva.calcularTotal())
                + " | Status: " + reserva.getStatus();
    }

    private void limparCampos() {
        txtCliente.setText("");
        txtQuarto.setText("");
        txtEntrada.setText("");
        txtSaida.setText("");
        txtCliente.requestFocus();
    }

    private static class DadosReserva {
        private final int idCliente;
        private final int numeroQuarto;
        private final String entradaTexto;
        private final String saidaTexto;
        private final int numeroDias;

        private DadosReserva(int idCliente, int numeroQuarto, String entradaTexto, String saidaTexto, int numeroDias) {
            this.idCliente = idCliente;
            this.numeroQuarto = numeroQuarto;
            this.entradaTexto = entradaTexto;
            this.saidaTexto = saidaTexto;
            this.numeroDias = numeroDias;
        }
    }
}
