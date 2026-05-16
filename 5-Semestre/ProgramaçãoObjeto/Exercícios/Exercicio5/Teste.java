/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.teste;

/**
 *
 * @author Alunos
 */
public class Teste {

    public static void main(String[] args) {
        Livro livro = new Livro("livro teste", 1, "Guilherme");
        Reliquia reliquia = new Reliquia("Teste reliquia", 2);

        livro.exibirInstituicao();
        livro.calcularPrazoEmprestimo();

        reliquia.exibirInstituicao();
        reliquia.calcularPrazoEmprestimo();
    }
}
