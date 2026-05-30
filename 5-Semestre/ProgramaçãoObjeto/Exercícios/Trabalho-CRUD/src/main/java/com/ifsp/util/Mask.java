/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ifsp.util;

import java.text.ParseException;
import javax.naming.Context;
import javax.swing.JFormattedTextField;
import javax.swing.text.MaskFormatter;

/**
 *
 * @author User
 */
public class Mask {

    public static JFormattedTextField applayMaskProne(JFormattedTextField field) {
        try {
            javax.swing.text.MaskFormatter mascara
                    = new javax.swing.text.MaskFormatter("(##) #####-####");

            mascara.setPlaceholderCharacter('_');
            mascara.install(field);
            
            return field;

        } catch (java.text.ParseException e) {
            System.out.println("Erro ao aplicar máscara de telefone: " + e.getMessage());
            return null;
        }
    }
    
    public static String maskPhone(String str) {
        if (str == null) return "";
        
        str = str.replaceAll("[^0-9]", "");

        if (str.length() != 11) {
            return str;
        }

        try {
            MaskFormatter mascara = new MaskFormatter("(##)#####-####");
            mascara.setValueContainsLiteralCharacters(false);
            
            return mascara.valueToString(str);

        } catch (ParseException e) {
            System.err.println("Erro ao aplicar máscara de CPF: " + e.getMessage());
            return str;
        }
    }
    
    public static JFormattedTextField applayMaskCpf(JFormattedTextField field) {
        try {
            javax.swing.text.MaskFormatter mascara
                    = new javax.swing.text.MaskFormatter("###.###.###-##");

            mascara.setPlaceholderCharacter('_');
            mascara.install(field);
            
            return field;

        } catch (java.text.ParseException e) {
            System.out.println("Erro ao aplicar máscara de CPF: " + e.getMessage());
            return null;
        }
    }
    
    public static String maskCpf(String str) {
        if (str == null) return "";
        
        str = str.replaceAll("[^0-9]", "");

        if (str.length() != 11) {
            return str;
        }

        try {
            MaskFormatter mascara = new MaskFormatter("###.###.###-##");
            mascara.setValueContainsLiteralCharacters(false);
            
            return mascara.valueToString(str);

        } catch (ParseException e) {
            System.err.println("Erro ao aplicar máscara de CPF: " + e.getMessage());
            return str;
        }
    }
    
    public static String removeMask(JFormattedTextField field){
        String str = field.getText().replaceAll("\\D", "");
        return str;
    }
}
