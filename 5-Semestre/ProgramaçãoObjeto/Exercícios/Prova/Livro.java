package com.mycompany.livro;

public class Livro {

    private String titulo;

    // Setter com validação
    public void setTitulo(String titulo) {
        if (titulo != null && !titulo.trim().isEmpty() && titulo.length() <= 100) {
            this.titulo = titulo;
        }
    }

    // Getter
    public String getTitulo() {
        return this.titulo;
    }
}