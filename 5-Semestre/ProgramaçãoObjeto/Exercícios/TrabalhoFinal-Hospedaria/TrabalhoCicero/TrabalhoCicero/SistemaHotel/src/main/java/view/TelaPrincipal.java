package view;

import java.awt.Color;
import java.awt.Font;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;

public class TelaPrincipal extends javax.swing.JFrame {

    private JButton btnClientes;
    private JButton btnQuartos;
    private JButton btnRelatorios;
    private JButton btnReservas;
    private JLabel jLabelSubtitulo;
    private JLabel jLabelTitulo;
    private JPanel jPanelPrincipal;
    private JScrollPane jScrollPane1;
    private JTextArea txtAreaResumo;

    public TelaPrincipal() {
        initComponents();
        setLocationRelativeTo(null);
    }

    @SuppressWarnings("unchecked")
    private void initComponents() {
        jPanelPrincipal = new JPanel();
        jLabelTitulo = new JLabel();
        jLabelSubtitulo = new JLabel();
        btnClientes = new JButton();
        btnQuartos = new JButton();
        btnReservas = new JButton();
        btnRelatorios = new JButton();
        jScrollPane1 = new JScrollPane();
        txtAreaResumo = new JTextArea();

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setTitle("ADEG's HOTEL");

        jPanelPrincipal.setBackground(new Color(241, 245, 249));

        jLabelTitulo.setFont(new Font("Segoe UI", Font.BOLD, 22));
        jLabelTitulo.setForeground(new Color(30, 41, 59));
        jLabelTitulo.setText("ADEG's HOTEL");

        jLabelSubtitulo.setFont(new Font("Segoe UI", Font.BOLD, 14));
        jLabelSubtitulo.setForeground(new Color(30, 41, 59));
        jLabelSubtitulo.setText("Sistema de Reservas");

        configurarBotaoPrincipal(btnClientes, "Clientes");
        btnClientes.addActionListener(this::btnClientesActionPerformed);

        configurarBotaoPrincipal(btnQuartos, "Quartos");
        btnQuartos.addActionListener(this::btnQuartosActionPerformed);

        configurarBotaoPrincipal(btnReservas, "Reservas");
        btnReservas.addActionListener(this::btnReservasActionPerformed);

        configurarBotaoPrincipal(btnRelatorios, "Relatorios");
        btnRelatorios.addActionListener(this::btnRelatoriosActionPerformed);

        txtAreaResumo.setColumns(20);
        txtAreaResumo.setRows(5);
        txtAreaResumo.setEditable(false);
        txtAreaResumo.setLineWrap(true);
        txtAreaResumo.setWrapStyleWord(true);
        txtAreaResumo.setText("Escolha uma opcao para gerenciar o sistema.\n\n"
                + "Clientes: cadastro e listagem de clientes.\n"
                + "Quartos: cadastro e listagem de quartos.\n"
                + "Reservas: criacao e cancelamento de reservas.\n"
                + "Relatorios: consulta dos dados cadastrados.");
        jScrollPane1.setViewportView(txtAreaResumo);

        javax.swing.GroupLayout jPanelPrincipalLayout = new javax.swing.GroupLayout(jPanelPrincipal);
        jPanelPrincipal.setLayout(jPanelPrincipalLayout);

        jPanelPrincipalLayout.setHorizontalGroup(
            jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                .addGap(40, 40, 40)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jLabelTitulo)
                    .addComponent(jLabelSubtitulo)
                    .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                        .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(btnClientes, javax.swing.GroupLayout.DEFAULT_SIZE, 180, Short.MAX_VALUE)
                            .addComponent(btnQuartos, javax.swing.GroupLayout.DEFAULT_SIZE, 180, Short.MAX_VALUE)
                            .addComponent(btnReservas, javax.swing.GroupLayout.DEFAULT_SIZE, 180, Short.MAX_VALUE)
                            .addComponent(btnRelatorios, javax.swing.GroupLayout.DEFAULT_SIZE, 180, Short.MAX_VALUE))
                        .addGap(30, 30, 30)
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 270, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addContainerGap(40, Short.MAX_VALUE))
        );

        jPanelPrincipalLayout.setVerticalGroup(
            jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                .addGap(25, 25, 25)
                .addComponent(jLabelTitulo)
                .addGap(8, 8, 8)
                .addComponent(jLabelSubtitulo)
                .addGap(30, 30, 30)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                    .addGroup(jPanelPrincipalLayout.createSequentialGroup()
                        .addComponent(btnClientes, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(15, 15, 15)
                        .addComponent(btnQuartos, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(15, 15, 15)
                        .addComponent(btnReservas, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(15, 15, 15)
                        .addComponent(btnRelatorios, javax.swing.GroupLayout.PREFERRED_SIZE, 35, javax.swing.GroupLayout.PREFERRED_SIZE))
                    .addComponent(jScrollPane1))
                .addContainerGap(108, Short.MAX_VALUE))
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
        abrirTela(new TelaCliente());
    }

    private void btnQuartosActionPerformed(java.awt.event.ActionEvent evt) {
        abrirTela(new TelaQuarto());
    }

    private void btnReservasActionPerformed(java.awt.event.ActionEvent evt) {
        abrirTela(new TelaReserva());
    }

    private void btnRelatoriosActionPerformed(java.awt.event.ActionEvent evt) {
        abrirTela(new TelaRelatorio());
    }

    private void abrirTela(JFrame tela) {
        tela.setLocationRelativeTo(this);
        tela.setVisible(true);
    }

    public static void main(String[] args) {
        try {
            for (javax.swing.UIManager.LookAndFeelInfo info : javax.swing.UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    javax.swing.UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (ReflectiveOperationException | javax.swing.UnsupportedLookAndFeelException ex) {
            System.out.println("Nao foi possivel aplicar o tema Nimbus.");
        }

        java.awt.EventQueue.invokeLater(() -> new TelaPrincipal().setVisible(true));
    }
}
