/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.sistemahotel;

import controller.HotelController;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import view.TelaPrincipal;

public class SistemaHotel {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                for (UIManager.LookAndFeelInfo info : UIManager.getInstalledLookAndFeels()) {
                    if ("Nimbus".equals(info.getName())) {
                        UIManager.setLookAndFeel(info.getClassName());
                        break;
                    }
                }
            } catch (Exception ex) {
                System.err.println("Nao foi possivel aplicar o tema Nimbus: " + ex.getMessage());
            }

            new TelaPrincipal(new HotelController()).setVisible(true);
        });
    }
}
