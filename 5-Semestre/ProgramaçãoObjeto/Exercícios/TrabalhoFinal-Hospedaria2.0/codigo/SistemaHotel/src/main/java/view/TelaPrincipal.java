package view;

import controller.HotelController;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.text.NumberFormat;
import java.util.Locale;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

public class TelaPrincipal extends JFrame {

    private final HotelController controller;
    private final JLabel totalClientes = new JLabel("0", SwingConstants.CENTER);
    private final JLabel totalQuartos = new JLabel("0", SwingConstants.CENTER);
    private final JLabel totalReservas = new JLabel("0", SwingConstants.CENTER);
    private final JLabel totalDisponiveis = new JLabel("0", SwingConstants.CENTER);
    private final JLabel receitaTotal = new JLabel("R$ 0,00", SwingConstants.CENTER);

    public TelaPrincipal(HotelController controller) {
        this.controller = controller;
        initComponents();
        atualizarIndicadores();
    }

    public TelaPrincipal() {
        this(new HotelController());
    }

    private void initComponents() {
        setTitle("ADEG's HOTEL - Sistema de Reservas");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(760, 420));
        setLocationRelativeTo(null);

        JPanel menu = new JPanel();
        menu.setBackground(new Color(30, 41, 59));
        menu.setPreferredSize(new Dimension(190, 420));
        menu.setBorder(BorderFactory.createEmptyBorder(18, 14, 18, 14));
        menu.setLayout(new java.awt.GridLayout(8, 1, 0, 10));

        JLabel titulo = new JLabel("ADEG's HOTEL", SwingConstants.CENTER);
        titulo.setForeground(Color.WHITE);
        titulo.setFont(new Font("Segoe UI", Font.BOLD, 22));
        JLabel subtitulo = new JLabel("Sistema de Reservas", SwingConstants.CENTER);
        subtitulo.setForeground(Color.WHITE);
        subtitulo.setFont(new Font("Segoe UI", Font.BOLD, 13));

        menu.add(titulo);
        menu.add(subtitulo);
        menu.add(botaoMenu("Clientes", () -> abrir(new TelaCliente(controller, this))));
        menu.add(botaoMenu("Quartos", () -> abrir(new TelaQuarto(controller, this))));
        menu.add(botaoMenu("Reservas", () -> abrir(new TelaReserva(controller, this))));
        menu.add(botaoMenu("Relatorios", () -> abrir(new TelaRelatorio(controller, this))));

        JPanel conteudo = new JPanel(new BorderLayout(0, 20));
        conteudo.setBackground(new Color(241, 245, 249));
        conteudo.setBorder(BorderFactory.createEmptyBorder(28, 28, 28, 28));

        JPanel cabecalho = new JPanel(new java.awt.GridLayout(2, 1));
        cabecalho.setOpaque(false);
        JLabel texto1 = new JLabel("Gerencie clientes, quartos e reservas.");
        texto1.setFont(new Font("Segoe UI", Font.BOLD, 16));
        texto1.setForeground(new Color(30, 41, 59));
        JLabel texto2 = new JLabel("Controle total do hotel em um unico sistema.");
        texto2.setForeground(new Color(51, 65, 85));
        cabecalho.add(texto1);
        cabecalho.add(texto2);

        JPanel cards = new JPanel(new java.awt.GridLayout(2, 3, 16, 16));
        cards.setOpaque(false);
        cards.add(card("CLIENTES", totalClientes));
        cards.add(card("QUARTOS", totalQuartos));
        cards.add(card("RESERVAS", totalReservas));
        cards.add(card("DISPONIVEIS", totalDisponiveis));
        cards.add(card("RECEITA", receitaTotal));

        conteudo.add(cabecalho, BorderLayout.NORTH);
        conteudo.add(cards, BorderLayout.CENTER);

        add(menu, BorderLayout.WEST);
        add(conteudo, BorderLayout.CENTER);
        pack();
    }

    private JButton botaoMenu(String texto, Runnable acao) {
        JButton botao = new JButton(texto);
        botao.setBackground(new Color(51, 65, 85));
        botao.setForeground(Color.WHITE);
        botao.setFocusPainted(false);
        botao.setBorderPainted(false);
        botao.setFont(new Font("Segoe UI", Font.BOLD, 15));
        botao.addActionListener(event -> acao.run());
        return botao;
    }

    private JPanel card(String titulo, JLabel valor) {
        JPanel painel = new JPanel(new BorderLayout());
        painel.setBackground(new Color(219, 234, 254));
        painel.setBorder(BorderFactory.createEmptyBorder(18, 18, 18, 18));
        JLabel label = new JLabel(titulo, SwingConstants.CENTER);
        label.setFont(new Font("Segoe UI", Font.BOLD, 14));
        label.setForeground(new Color(30, 41, 59));
        valor.setFont(new Font("Segoe UI", Font.BOLD, 24));
        valor.setForeground(new Color(15, 23, 42));
        painel.add(label, BorderLayout.NORTH);
        painel.add(valor, BorderLayout.CENTER);
        return painel;
    }

    private void abrir(JFrame tela) {
        tela.setLocationRelativeTo(this);
        tela.setVisible(true);
        this.setVisible(false); // esconde a TelaPrincipal
    }

    public void atualizarIndicadores() {
        NumberFormat moeda = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        totalClientes.setText(String.valueOf(controller.getClientes().size()));
        totalQuartos.setText(String.valueOf(controller.getQuartos().size()));
        totalReservas.setText(String.valueOf(controller.getReservas().size()));
        totalDisponiveis.setText(String.valueOf(controller.contarQuartosDisponiveis()));
        receitaTotal.setText(moeda.format(controller.calcularReceitaTotal()));
    }
}
