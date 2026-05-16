package br.edu.ifsp.primeiroapp;

import java.io.Serializable;

public class Dados implements Serializable {

    public Dados(String nome, String tel, String email, boolean salvarEmail, boolean ehMasc, String cidade, String estado) {
        this.nome = nome;
        this.tel = tel;
        this.email = email;
        this.salvarEmail = salvarEmail;
        this.ehMasc = ehMasc;
        this.cidade = cidade;
        this.estado = estado;
    }

    private String nome;
    private String tel;
    private String email;
    private boolean salvarEmail;
    private boolean ehMasc;
    private String cidade;
    private String estado;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isSalvarEmail() {
        return salvarEmail;
    }

    public void setSalvarEmail(boolean salvarEmail) {
        this.salvarEmail = salvarEmail;
    }

    public boolean isEhMasc() {
        return ehMasc;
    }

    public void setEhMasc(boolean ehMasc) {
        this.ehMasc = ehMasc;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
