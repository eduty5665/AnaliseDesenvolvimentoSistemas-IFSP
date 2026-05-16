package com.mycompany.mandata;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class CalculadoraData {
    public boolean verBissexto(int ano){
        return(ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0);
    }
    
    public void diasFimAno(){
        LocalDate dataAtual = LocalDate.of(LocalDate.now().getYear(), LocalDate.now().getMonth(), LocalDate.now().getDayOfMonth());
        LocalDate fimAno = LocalDate.of(LocalDate.now().getYear(), 12, 31); 
        long dias = ChronoUnit.DAYS.between(dataAtual, fimAno);
        System.out.println("Dias até fim de ano: " + (int) dias); 
        
    }
    
    public void diasEntre(MinhaData dataI, MinhaData dataF){
        LocalDate d1 = LocalDate.of(dataI.getAno(), dataI.getMes(), dataI.getDia());
        LocalDate d2 = LocalDate.of(dataF.getAno(), dataF.getMes(), dataF.getDia());
        long dias = ChronoUnit.DAYS.between(d1, d2);
        System.out.println("Dias entre datas: " + (int) dias); 
    }
    
    public MinhaData obterDataAtual(){
        int dia = LocalDate.now().getDayOfMonth();
        int mes = LocalDate.now().getMonthValue();
        int ano = LocalDate.now().getYear();
        MinhaData novaData = new MinhaData(dia, mes, ano);
        return novaData;
    }
}
