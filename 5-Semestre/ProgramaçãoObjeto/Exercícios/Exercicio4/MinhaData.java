
package com.mycompany.mandata;

public class MinhaData {
    private int dia;
    private int mes;
    private int ano;
    
    private CalculadoraData calc;
    
    public MinhaData(int dia, int mes, int ano){
        calc = new CalculadoraData();
        setAno(ano);
        setMes(mes);
        setDia(dia);
    }
    
    public void setDia(int dia){
        if(validaDia(dia)){
            this.dia = dia;
        } else{
            System.out.println("Dia inválido para mês");
        }
    };
    
    public void setMes(int mes){
        if(mes >= 1 && mes <= 12){
            this.mes = mes;
        } else{
            System.out.println("Mês inválido");
        }
    };
    
    public void setAno(int ano){
        if(ano > 0){
            this.ano = ano;
        } else{
            System.out.println("Ano inválido");
        }
    }
    
    public boolean validaDia(int dia){
        int diasMes;
        
        switch(mes){
            case 1: case 3: case 5: case 7: case 8: case 10: case 12:
                diasMes = 31;
                break;
            case 4: case 6: case 9: case 11:
                diasMes = 30;
                break;
            case 2:
                if (bissexto(this.ano)) {
                    diasMes = 29;
                } else {
                    diasMes = 28;
                }
                break;
            default:
                return false;
        }
        
        return dia >= 1 && dia <= diasMes;
    }
    
    public boolean bissexto(int ano){
        return calc.verBissexto(ano);
    }
        
    public String formataData(){
        StringBuilder sb = new StringBuilder();
        sb.append(this.dia);
        sb.append("/");
        sb.append(this.mes);
        sb.append("/");
        sb.append(this.ano);
        
        return sb.toString();
   }
    
    public int getAno(){
        return this.ano;
    }
    
    public int getMes(){
        return this.mes;
    }
    
    public int getDia(){
        return this.dia;
    }
}
