
package com.mycompany.relacionamento_exercicico;

public class NotaFiscal {
    private String codigoSefaz;

    // composicao
    // essa classe sera instaciado apenas dentro do Pedido
    
    public NotaFiscal(String codigo) {
        this.codigoSefaz = codigo;
    }

    public String getCodigo() { return codigoSefaz; }
}