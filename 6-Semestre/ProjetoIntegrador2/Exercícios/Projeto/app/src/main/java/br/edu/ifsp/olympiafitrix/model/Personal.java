package br.edu.ifsp.olympiafitrix.model;

/** Personal exibido para o aluno, com o estado atual do vínculo. */
public class Personal {

    private int idPersonal;
    private String nome;
    private String cref;
    private String telefone;
    private boolean vinculado;
    private String fotoUrl;

    public Personal(int idPersonal, String nome, String cref, String telefone, boolean vinculado) {
        this(idPersonal, nome, cref, telefone, vinculado, "");
    }

    public Personal(int idPersonal, String nome, String cref, String telefone, boolean vinculado, String fotoUrl) {
        this.idPersonal = idPersonal;
        this.nome = nome;
        this.cref = cref;
        this.telefone = telefone;
        this.vinculado = vinculado;
        this.fotoUrl = fotoUrl;
    }

    public int getIdPersonal() {
        return idPersonal;
    }

    public String getNome() {
        return nome;
    }

    public String getCref() {
        return cref;
    }

    public String getTelefone() {
        return telefone;
    }

    public boolean isVinculado() {
        return vinculado;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }
}
