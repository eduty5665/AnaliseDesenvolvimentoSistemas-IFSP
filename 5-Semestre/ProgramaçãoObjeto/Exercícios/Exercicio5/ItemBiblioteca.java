/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.teste;

abstract class ItemBiblioteca {
    private String titulo;
    private int codigo;

    public ItemBiblioteca(String titulo, int codigo) {
        this.titulo = titulo;
        this.codigo = codigo;
    }

    public void exibirInstituicao() {
        System.out.println("IFSP");
    }

    public abstract void calcularPrazoEmprestimo();

    public String getTitulo() {
        return titulo;
    }

    public int getCodigo() {
        return codigo;
    }
}
