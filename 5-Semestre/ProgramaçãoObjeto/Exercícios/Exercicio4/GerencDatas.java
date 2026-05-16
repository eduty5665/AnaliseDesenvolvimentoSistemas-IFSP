package com.mycompany.mandata;
import java.util.ArrayList;

public class GerencDatas {
    private ArrayList<MinhaData> listaDatas;
    
    public GerencDatas(){
        listaDatas = new ArrayList<>();
    }
    
    public void adicionarData(MinhaData d){
        if(d != null){
            this.listaDatas.add(d);
        } else{
            System.out.println("Não foi possível adicionar a data");
        }
    }
    
    public void listDatBiss(){
        System.out.println("Anos bissextos: ");
        if(listaDatas.isEmpty()){
            System.out.println("Lista vazia");
            return;
        }
        
        boolean bis = false;
        
        for(MinhaData l: listaDatas){
            if(l.bissexto(l.getAno())){
                System.out.println(l.formataData());
                bis = true;
            } 
        }
        
        if(!bis){
            System.out.println("Não há anos bissextos");
        }
    }
}
