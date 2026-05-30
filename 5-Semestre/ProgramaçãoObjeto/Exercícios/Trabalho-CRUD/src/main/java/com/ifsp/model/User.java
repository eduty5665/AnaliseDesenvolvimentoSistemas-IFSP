package com.ifsp.model;

public class User extends Person {

    private String phone;
    private String password;
    private boolean permission; 

    public User() {
        super();
    }

    public User(int id, String name, String email, String phone, String password, boolean permission) {
        super(id, name, email);
        this.phone = phone;
        this.password = password;
        this.permission = permission;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean getPermission() {
        return permission;
    }

    public void setPermission(boolean permission) {
        this.permission = permission;
    }

}
