package br.edu.ifsp.olympiafitrix.model;

import java.io.Serializable;
import java.util.List;

public class Treino implements Serializable {
    private String id;
    private String nome;
    private String descricao;
    private String data;
    private String nomePersonal;
    private String nivel;
    private int idNivel;
    private String duracao;
    private List<Exercicio> listaExercicios;
    private boolean atribuido;
    private String status;
    private int grauDificuldade;
    private String observacao;

    public Treino(String id, String nome, String descricao, String data, String nomePersonal, String nivel, String duracao, List<Exercicio> listaExercicios) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.data = data;
        this.nomePersonal = nomePersonal;
        this.nivel = nivel;
        this.idNivel = 0;
        this.duracao = duracao;
        this.listaExercicios = listaExercicios;
        this.atribuido = false;
        this.status = "pendente";
        this.grauDificuldade = 0;
        this.observacao = "";
    }

    public String getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
    public String getNomePersonal() { return nomePersonal; }
    public void setNomePersonal(String nomePersonal) { this.nomePersonal = nomePersonal; }
    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }
    public int getIdNivel() { return idNivel; }
    public void setIdNivel(int idNivel) { this.idNivel = idNivel; }
    public String getDuracao() { return duracao; }
    public void setDuracao(String duracao) { this.duracao = duracao; }
    public List<Exercicio> getListaExercicios() { return listaExercicios; }
    public void setListaExercicios(List<Exercicio> listaExercicios) { this.listaExercicios = listaExercicios; }
    public boolean isAtribuido() { return atribuido; }
    public void setAtribuido(boolean atribuido) { this.atribuido = atribuido; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getGrauDificuldade() { return grauDificuldade; }
    public void setGrauDificuldade(int grauDificuldade) { this.grauDificuldade = grauDificuldade; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
