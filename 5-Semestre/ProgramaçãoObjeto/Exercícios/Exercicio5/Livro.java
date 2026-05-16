/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.teste;

class Livro extends ItemBiblioteca {
    private String autor;

    public Livro(String titulo, int codigo, String autor) {
        super(titulo, codigo);
        this.autor = autor;
    }

    @Override
    public void calcularPrazoEmprestimo() {
        System.out.println("Prazo empréstimo: 7 dias");
    }

    public String getAutor() {
        return autor;
    }
}
