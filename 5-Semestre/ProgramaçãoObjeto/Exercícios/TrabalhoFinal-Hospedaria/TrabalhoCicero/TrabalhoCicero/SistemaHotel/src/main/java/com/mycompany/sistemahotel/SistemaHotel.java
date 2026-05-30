package com.mycompany.sistemahotel;

import javax.swing.UIManager;
import view.TelaPrincipal;

public class SistemaHotel {

    public static void main(String[] args) {

        try {
            for (UIManager.LookAndFeelInfo info : UIManager.getInstalledLookAndFeels()) {
                if ("Nimbus".equals(info.getName())) {
                    UIManager.setLookAndFeel(info.getClassName());
                    break;
                }
            }
        } catch (Exception e) {
            System.out.println("Não foi possível aplicar o tema Nimbus.");
        }

        java.awt.EventQueue.invokeLater(() -> {
            TelaPrincipal tela = new TelaPrincipal();
            tela.setLocationRelativeTo(null);
            tela.setVisible(true);
        });
    }
}