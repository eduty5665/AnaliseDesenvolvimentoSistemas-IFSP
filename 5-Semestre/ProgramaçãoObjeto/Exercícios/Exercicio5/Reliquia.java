/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.mycompany.teste;

final class Reliquia extends ItemBiblioteca {

    public Reliquia(String titulo, int codigo) {
        super(titulo, codigo);
    }

    @Override
    public void calcularPrazoEmprestimo() {
        System.out.println("Relíquia não pode ser emprestada");
    }
}
