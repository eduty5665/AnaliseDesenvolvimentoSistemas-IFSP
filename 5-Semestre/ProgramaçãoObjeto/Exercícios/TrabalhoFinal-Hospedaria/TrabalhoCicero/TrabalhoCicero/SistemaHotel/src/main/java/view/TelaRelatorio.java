package view;

import java.awt.Color;
import java.awt.Font;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;

public class TelaRelatorio extends javax.swing.JFrame {

    private JButton btnClientes;
    private JButton btnQuartos;
    private JButton btnReservas;
    private JButton btnVoltar;
    private JLabel jLabelTitulo;
    private JPanel jPanelPrincipal;
    private JScrollPane jScrollPane1;
    private JTextArea txtAreaResultado;

    public TelaRelatorio() {
        initComponents();
        setLocationRelativeTo(null);
    }

    @SuppressWarnings("unchecked")
    private void initComponents() {
        jPanelPrincipal = new JPanel();
        jLabelTitulo = new JLabel();
        btnClientes = new JButton();
        btnQuartos = new JButton();
        btnReservas = new JButton();
        btnVoltar = new JButton();
        jScrollPane1 = new JScrollPane();
        txtAreaResultado = new JTextArea();

        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setTitle("Relatorios");

        jPanelPrincipal.setBackground(new Color(241, 245, 249));

        jLabelTitulo.setFont(new Font("Segoe UI", Font.BOLD, 20));
        jLabelTitulo.setForeground(new Color(30, 41, 59));
        jLabelTitulo.setText("RELATORIOS DO SISTEMA");

        configurarBotaoPrincipal(btnClientes, "Relatorio de Clientes");
        btnClientes.addActionListener(this::btnClientesActionPerformed);

        configurarBotaoPrincipal(btnQuartos, "Relatorio de Quartos");
        btnQuartos.addActionListener(this::btnQuartosActionPerformed);

        configurarBotaoPrincipal(btnReservas, "Relatorio de Reservas");
        btnReservas.addActionListener(this::btnReservasActionPerformed);

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
                    .addComponent(btnClientes, javax.swing.GroupLayout.PREFERRED_SIZE, 240, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(btnQuartos, javax.swing.GroupLayout.PREFERRED_SIZE, 240, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(btnReservas, javax.swing.GroupLayout.PREFERRED_SIZE, 240, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(btnVoltar, javax.swing.GroupLayout.PREFERRED_SIZE, 120, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 480, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(40, Short.MAX_VALUE))
        );

        jPanelPrincipalLayout.setVerticalGroup(
            jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                .addGap(25, 25, 25)
                .addComponent(jLabelTitulo)
                .addGap(30, 30, 30)
                .addComponent(btnClientes, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(15, 15, 15)
                .addComponent(btnQuartos, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(15, 15, 15)
                .addComponent(btnReservas, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(15, 15, 15)
                .addComponent(btnVoltar, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(25, 25, 25)
                .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 100, javax.swing.GroupLayout.PREFERRED_SIZE)
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

    private void configurarBotaoPrincipal(JButton botao, String texto) {
        botao.setBackground(new Color(51, 65, 85));
        botao.setFont(new Font("Segoe UI", Font.BOLD, 14));
        botao.setForeground(Color.WHITE);
        botao.setText(texto);
        botao.setBorderPainted(false);
        botao.setFocusPainted(false);
    }

    private void btnClientesActionPerformed(java.awt.event.ActionEvent evt) {
        txtAreaResultado.setText(TelaCliente.gerarRelatorioClientes());
    }

    private void btnQuartosActionPerformed(java.awt.event.ActionEvent evt) {
        txtAreaResultado.setText(TelaQuarto.gerarRelatorioQuartos());
    }

    private void btnReservasActionPerformed(java.awt.event.ActionEvent evt) {
        txtAreaResultado.setText(TelaReserva.gerarRelatorioReservas());
    }

    private void btnVoltarActionPerformed(java.awt.event.ActionEvent evt) {
        dispose();
    }
}
