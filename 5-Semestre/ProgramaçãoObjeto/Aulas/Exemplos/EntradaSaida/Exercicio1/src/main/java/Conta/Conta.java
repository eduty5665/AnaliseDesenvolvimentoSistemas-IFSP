package Conta;

import Cliente.Cliente;

public class Conta {
    int numero;
    int agencia;
    double saldo;
    double limite;
    boolean status;
    Cliente titular;
    
    
    
    public void depositar(double valor){
        if(valor > 0){
            saldo = saldo + valor;
        }else{
            System.out.println("ERRO! Valor deve ser positivo!");
        }
    }
    
    public void sacar(double valor){
        if(status == true){
            if(saldo >= valor || (saldo + limite) >= valor){
                saldo = saldo - valor;
            }else{
                System.out.println("ERRO! Saldo e limite indisponivel!");
            }
        }else{
            System.out.println("ERRO! Conta inativada!");
        }
    }
    
    public boolean transferir(destino, valor){
        return true;
    }
    
    public double consultarSaldo(){
        return this.saldo;
    }
    
    public boolean bloquearConta(){
        
    }
    
    public boolean ativarConta(){
        if(!this.status){
            return false;
        }
        this.status = true;
        return status;
    }
}
