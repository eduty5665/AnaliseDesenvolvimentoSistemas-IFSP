package br.edu.ifsp.aularetrofit.model.entity;

import com.google.gson.annotations.SerializedName;

public class CepResponse {

    @SerializedName("cep")
    private String cep;
    @SerializedName("logradouro")
    private String logradouro;
    @SerializedName("complemento")
    private String complemento;
    @SerializedName("bairro")
    private String bairro;
    @SerializedName("localidade")
    private String cidade;
    @SerializedName("uf")
    private String uf;
    @SerializedName("ibge")
    private String ibge;
    @SerializedName("gia")
    private String gia;
    @SerializedName("ddd")
    private String ddd;
    @SerializedName("siafi")
    private String siafi;

    private Boolean erro; //Não existe o CEP

    public String getCep() {return cep;}

    public String getLogradouro() {return logradouro;}

    public String getComplemento() {return complemento;}

    public String getBairro() {return bairro;}

    public String getCidade() {return cidade;}

    public String getUf() {return uf;}

    public String getIbge() {return ibge;}

    public String getGia() {return gia;}

    public String getDdd() {return ddd;}

    public String getSiafi() {return siafi;}

    public Boolean getErro() {return erro;}

    public boolean isValid() {
        return erro == null || !erro;
    }
}
