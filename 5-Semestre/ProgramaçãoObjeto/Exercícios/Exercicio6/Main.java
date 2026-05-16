package com.mycompany.hospital;

public class Main {

    public static void main(String[] args) {

        Medico medico = new Medico("Dr. Arnaldo Silva", 12500.0, "12345-SP");

        medico.exibirDados();
        medico.mostrarRelatorioMedico();
    }
}

