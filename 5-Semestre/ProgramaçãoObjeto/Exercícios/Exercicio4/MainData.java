package com.mycompany.mandata;

public class MainData {

    public static void main(String[] args) {
        MinhaData data1 = new MinhaData(19, 03, 2006);
        System.out.println(data1.formataData());
        MinhaData data2 = new MinhaData(19, 03, 2012);
        System.out.println(data2.formataData());
        
        MinhaData data3 = new MinhaData(9, 04, 2016);
        System.out.println(data3.formataData());
        
        GerencDatas lista = new GerencDatas();
        lista.adicionarData(data1);
        lista.adicionarData(data2);
        lista.adicionarData(data3);
        lista.listDatBiss();
        
        CalculadoraData calcTeste = new CalculadoraData();
        calcTeste.diasFimAno();
        calcTeste.diasEntre(data1, data1);
        calcTeste.diasEntre(data1, data2);
        
        System.out.println("Data atual: " + calcTeste.obterDataAtual().formataData());
    }
}
