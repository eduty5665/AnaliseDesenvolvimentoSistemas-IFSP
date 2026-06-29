package view;

import controller.HotelController;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Font;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;
import model.Cliente;
import javax.swing.SwingConstants;

public class TelaCliente extends JFrame {

    private final HotelController controller;
    private final TelaPrincipal telaPrincipal;
    private final JTextField campoNome = new JTextField();
    private final JTextField campoCpf = new JTextField();
    private final JTextField campoTelefone = new JTextField();
    private final JTextField campoEmail = new JTextField();
    private final DefaultTableModel modelo = new DefaultTableModel(
            new Object[]{"ID", "Nome", "CPF", "Telefone", "E-mail"}, 0);

    public TelaCliente(HotelController controller, TelaPrincipal telaPrincipal) {
        this.controller = controller;
        this.telaPrincipal = telaPrincipal;
        initComponents();
        carregarTabela();
    }

    public TelaCliente() {
        this(new HotelController(), null);
    }

    private void initComponents() {
        setTitle("Cadastro de Clientes");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(780, 460);

        JPanel raiz = new JPanel(new BorderLayout(14, 14));
        raiz.setBorder(BorderFactory.createEmptyBorder(18, 18, 18, 18));
        raiz.setBackground(new Color(241, 245, 249));

        JLabel titulo = new JLabel("Clientes");
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 22));

        JPanel formulario = new JPanel(new java.awt.GridLayout(4, 2, 10, 8));
        formulario.setOpaque(false);
        adicionarCampo(formulario, "Nome", campoNome);
        adicionarCampo(formulario, "CPF", campoCpf);
        adicionarCampo(formulario, "Telefone", campoTelefone);
        adicionarCampo(formulario, "E-mail", campoEmail);

        JPanel botoes = new JPanel(new java.awt.FlowLayout(java.awt.FlowLayout.LEFT));
        botoes.setOpaque(false);
        JButton salvar = new JButton("Cadastrar");
        JButton resumo = new JButton("Resumo");
        JButton limpar = new JButton("Limpar");
        JButton voltar = new JButton("Voltar");
        voltar.setVerticalAlignment(SwingConstants.TOP);

        salvar.addActionListener(event -> cadastrarCliente());
        resumo.addActionListener(event -> mostrarResumo());
        limpar.addActionListener(event -> limparCampos());

        voltar.addActionListener(event -> {
            if (telaPrincipal != null) {
                telaPrincipal.setVisible(true);
            }
            dispose();
        });

        botoes.add(salvar);
        botoes.add(resumo);
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
        getContentPane().add(raiz);
    }

    private void adicionarCampo(JPanel painel, String label, JTextField campo) {
        painel.add(new JLabel(label));
        painel.add(campo);
    }

    private void cadastrarCliente() {

        Cliente cliente = new Cliente(
                campoNome.getText().trim(),
                campoCpf.getText().trim(),
                campoTelefone.getText().trim(),
                campoEmail.getText().trim());

        controller.adicionarCliente(cliente);

        carregarTabela();
        limparCampos();
        atualizarPrincipal();
    }

    private void mostrarResumo() {
        String idTexto = JOptionPane.showInputDialog(this, "Digite o ID do cliente:");
        if (idTexto == null || idTexto.isBlank()) {
            return;
        }
        try {
            int id = Integer.parseInt(idTexto.trim());
            Cliente cliente = controller.buscarClientePorId(id);

            if (cliente != null) {
                JOptionPane.showMessageDialog(this, cliente.gerarResumo());
            } else {
                JOptionPane.showMessageDialog(this, "Cliente nao encontrado.");
            }
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Informe um ID numerico valido.");
        }
    }

    private void carregarTabela() {
        modelo.setRowCount(0);
        for (Cliente cliente : controller.getClientes()) {
        	modelo.addRow(new Object[]{
        		    cliente.getIdCliente(),
        		    cliente.apresentar(),
        		    cliente.getCpf(),
        		    cliente.getTelefone(),
        		    cliente.getEmail()
        		});
        }
    }

    private void limparCampos() {
        campoNome.setText("");
        campoCpf.setText("");
        campoTelefone.setText("");
        campoEmail.setText("");
    }

    private void atualizarPrincipal() {
        if (telaPrincipal != null) {
            telaPrincipal.atualizarIndicadores();
        }
    }
}
