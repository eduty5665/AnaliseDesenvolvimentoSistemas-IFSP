package com.ifsp.util;

import java.util.regex.Pattern;

public class Validator {

    // Regex simples para validação de e-mail
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";

    /**
     * Verifica se uma String é nula ou está vazia (após remover espaços).
     */
    public static boolean isEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }

    /**
     * Valida o formato do e-mail.
     */
    public static boolean isValidEmail(String email) {
        if (isEmpty(email)) return false;
        return Pattern.compile(EMAIL_PATTERN).matcher(email).matches();
    }

    /**
     * Valida o tamanho mínimo de um campo.
     */
    public static boolean hasMinLength(String value, int min) {
        if (isEmpty(value)) return false;
        return value.trim().length() >= min;
    }
    
    public static boolean isId(int id){
        return id > 0;
    }
}