package view;

import java.awt.Color;
import java.awt.Font;
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

public class TelaCliente extends javax.swing.JFrame {

    private static final List<Cliente> CLIENTES = new ArrayList<>();

    private JButton btnListar;
    private JButton btnSalvar;
    private JButton btnVoltar;
    private JLabel jLabelCpf;
    private JLabel jLabelEmail;
    private JLabel jLabelNome;
    private JLabel jLabelTelefone;
    private JLabel jLabelTitulo;
    private JPanel jPanelPrincipal;
    private JScrollPane jScrollPane1;
    private JTextArea txtAreaResultado;
    private JTextField txtCpf;
    private JTextField txtEmail;
    private JTextField txtNome;
    private JTextField txtTelefone;

    public TelaCliente() {
        initComponents();
        setLocationRelativeTo(null);
    }

    public static String gerarRelatorioClientes() {
        if (CLIENTES.isEmpty()) {
            return "Nenhum cliente cadastrado.";
        }

        StringBuilder resultado = new StringBuilder("Relatorio de clientes:\n");
        for (Cliente cliente : CLIENTES) {
            resultado.append(cliente.getIdCliente()).append(" - ")
                    .append(cliente.getNome()).append(" | CPF: ")
                    .append(cliente.getCpf()).append(" | Tel: ")
                    .append(cliente.getTelefone()).append(" | Email: ")
                    .append(cliente.getEmail()).append("\n");
        }
        return resultado.toString();
    }

    @SuppressWarnings("unchecked")
    private void initComponents() {
        jPanelPrincipal = new JPanel();
        jLabelTitulo = new JLabel();
        jLabelNome = new JLabel();
        jLabelCpf = new JLabel();
        jLabelTelefone = new JLabel();
        jLabelEmail = new JLabel();
        txtNome = new JTextField();
        txtCpf = new JTextField();
        txtTelefone = new JTextField();
        txtEmail = new JTextField();
        btnSalvar = new JButton();
        btnListar = new JButton();
        btnVoltar = new JButton();
        jScrollPane1 = new JScrollPane();
        txtAreaResultado = new JTextArea();

        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setTitle("Clientes");

        jPanelPrincipal.setBackground(new Color(241, 245, 249));

        jLabelTitulo.setFont(new Font("Segoe UI", Font.BOLD, 20));
        jLabelTitulo.setForeground(new Color(30, 41, 59));
        jLabelTitulo.setText("GERENCIAMENTO DE CLIENTES");

        configurarLabel(jLabelNome, "Nome:");
        configurarLabel(jLabelCpf, "CPF:");
        configurarLabel(jLabelTelefone, "Telefone:");
        configurarLabel(jLabelEmail, "Email:");

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
                            .addComponent(jLabelNome)
                            .addComponent(jLabelCpf)
                            .addComponent(jLabelTelefone)
                            .addComponent(jLabelEmail))
                        .addGap(30, 30, 30)
                        .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(txtNome)
                            .addComponent(txtCpf)
                            .addComponent(txtTelefone)
                            .addComponent(txtEmail, javax.swing.GroupLayout.PREFERRED_SIZE, 330, javax.swing.GroupLayout.PREFERRED_SIZE)))
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
                    .addComponent(jLabelNome)
                    .addComponent(txtNome, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelCpf)
                    .addComponent(txtCpf, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelTelefone)
                    .addComponent(txtTelefone, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(15, 15, 15)
                .addGroup(jPanelPrincipalLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabelEmail)
                    .addComponent(txtEmail, javax.swing.GroupLayout.PREFERRED_SIZE, 30, javax.swing.GroupLayout.PREFERRED_SIZE))
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
        String nome = txtNome.getText().trim();
        String cpf = txtCpf.getText().trim();
        String telefone = txtTelefone.getText().trim();
        String email = txtEmail.getText().trim();

        if (nome.isEmpty() || cpf.isEmpty() || telefone.isEmpty() || email.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Preencha todos os campos.", "Atencao", JOptionPane.WARNING_MESSAGE);
            return;
        }

        Cliente cliente = new Cliente(CLIENTES.size() + 1, nome, cpf, telefone, email);
        CLIENTES.add(cliente);

        txtAreaResultado.setText("Cliente cadastrado:\n" + formatarCliente(cliente));
        limparCampos();
    }

    private void btnListarActionPerformed(java.awt.event.ActionEvent evt) {
        if (CLIENTES.isEmpty()) {
            txtAreaResultado.setText("Nenhum cliente cadastrado.");
            return;
        }

        StringBuilder resultado = new StringBuilder("Clientes cadastrados:\n");
        for (Cliente cliente : CLIENTES) {
            resultado.append(formatarCliente(cliente)).append("\n");
        }

        txtAreaResultado.setText(resultado.toString());
    }

    private void btnVoltarActionPerformed(java.awt.event.ActionEvent evt) {
        dispose();
    }

    private String formatarCliente(Cliente cliente) {
        return cliente.getIdCliente() + " - "
                + cliente.getNome() + " | CPF: "
                + cliente.getCpf() + " | Tel: "
                + cliente.getTelefone() + " | Email: "
                + cliente.getEmail();
    }

    private void limparCampos() {
        txtNome.setText("");
        txtCpf.setText("");
        txtTelefone.setText("");
        txtEmail.setText("");
        txtNome.requestFocus();
    }
}
