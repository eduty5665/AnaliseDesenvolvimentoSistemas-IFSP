package br.edu.ifsp.weatherapp.models;

import com.google.gson.annotations.SerializedName;

public class IbgeCity {
    @SerializedName("nome")
    private String name;
    
    @SerializedName("microrregiao")
    private Microrregiao microrregiao;

    public String getName() {
        return name;
    }

    public String getUfSigla() {
        if (microrregiao != null && microrregiao.mesorregiao != null && microrregiao.mesorregiao.uf != null) {
            return microrregiao.mesorregiao.uf.sigla;
        }
        return "";
    }

    private static class Microrregiao {
        @SerializedName("mesorregiao")
        Mesorregiao mesorregiao;
    }

    private static class Mesorregiao {
        @SerializedName("UF")
        Uf uf;
    }

    private static class Uf {
        @SerializedName("sigla")
        String sigla;
    }
}
