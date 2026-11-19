package br.edu.ifsp.olympiafitrix.util;

public class ValidadorCadastro {

    public static boolean validarCPF(String cpf) {
        cpf = cpf.replaceAll("[^0-9]", "");

        if (cpf.length() != 11) {
            return false;
        }

        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
        }

        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) {
            primeiroDigito = 0;
        }

        if (primeiroDigito != Character.getNumericValue(cpf.charAt(9))) {
            return false;
        }

        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
        }

        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) {
            segundoDigito = 0;
        }

        return segundoDigito == Character.getNumericValue(cpf.charAt(10));
    }

    public static boolean validarCREF(String cref) {
        if (cref == null) {
            return false;
        }

        cref = cref.trim();

        if (cref.length() < 5 || cref.length() > 20) {
            return false;
        }

        return cref.matches("^[A-Za-z0-9/\\-]+$");
    }

    public static String limparCPF(String cpf) {
        return cpf.replaceAll("[^0-9]", "");
    }
}
