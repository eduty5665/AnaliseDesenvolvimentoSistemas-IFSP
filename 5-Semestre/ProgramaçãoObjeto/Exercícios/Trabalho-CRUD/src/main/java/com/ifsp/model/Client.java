package com.ifsp.model;

public class Client extends Person {
    private String phone;
    private String cpf;
    private String address; 

    public Client() { super(); }

    public Client(int id, String name, String email, String phone, String cpf, String address) {
        super(id, name, email);
        this.phone = phone;
        this.cpf = cpf;
        this.address = address;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}