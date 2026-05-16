
package com.mycompany.regradenegocio;

import java.util.ArrayList;

public class Carro {
    private int id;
    private String cor;
    private String modelo;
    private String marca;
    
    static ArrayList<Carro> carroLista = new ArrayList<>();
        
    Carro(){}
    
    public Carro(int id, String cor, String modelo, String marca){
        setId(id);
        setCor(cor);
        setModelo(modelo);
        setMarca(marca);
    }
    
    @Override
    public String toString(){
        return "ID: " + getId() + " | Cor: " + getCor() + " | Modelo: " 
                + getModelo() + " | Marca: " + getMarca();
    }
    
    public Carro carroConsulta(int id){
        if(id < 0){
            return null;
        }
        for(Carro c : carroLista){
            if(c.getId() == id){
                return c;
            }
        }
        return null;
    }
    
    public void carroCadastro(int id, String cor, String modelo, String marca){
        carroLista.add(new Carro(id, cor, modelo, marca));
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }
    
}
