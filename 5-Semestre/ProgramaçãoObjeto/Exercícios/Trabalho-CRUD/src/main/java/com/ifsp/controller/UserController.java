package com.ifsp.controller;

import com.ifsp.dao.DB;
import com.ifsp.model.User;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserController {

    private String sql;
    private Connection connection;
    private PreparedStatement pst = null;

    public UserController() {
        this.connection = DB.connect();
    }

    public boolean add(User user) {
        if (user.getId() <= 0) {
            this.sql = "INSERT INTO tab_users (permission, name, email, password, phone) VALUES (?, ?, ?, ?, ?)";
        } else {
            this.sql = "UPDATE tab_users SET permission = ?, name = ?, email = ?, password = ?, phone = ? WHERE id = ?";
        }
        try {
            pst = connection.prepareStatement(sql);
            pst.setBoolean(1, user.getPermission());
            pst.setString(2, user.getName());
            pst.setString(3, user.getEmail());
            pst.setString(4, user.getPassword());
            pst.setString(5, user.getPhone());
            if (user.getId() > 0) {
                pst.setInt(6, user.getId());
            }

            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Erro ao inserir cliente: " + e.getMessage());
            return false;
        }
    }
    
    public boolean findById(int id){
        sql = "SELECT id FROM tab_users WHERE id = ?";
        try {
            pst = connection.prepareStatement(sql);
            pst.setInt(1, id);
            return pst.execute();
        } catch (SQLException e) {
            System.err.println("Erro ao consultar usuario por ID: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(int id) {
        
        if(!this.findById(id)){
            return false;
        }
        
        sql = "DELETE FROM tab_users WHERE id = ?";
        try {
            pst = connection.prepareStatement(sql);
            pst.setInt(1, id);
            
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Erro ao deletar: " + e.getMessage());
            return false;
        }
    }

    public List<User> searchByName(String name) {
        List<User> clients = new ArrayList<>();
        String sql = "SELECT * FROM tab_users WHERE name LIKE ?";
        try (PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setString(1, "%" + name + "%");
            ResultSet rst = pst.executeQuery();
            while (rst.next()) {
                User u = new User();
                u.setId(rst.getInt("id"));
                u.setPermission(rst.getBoolean("permission"));
                u.setName(rst.getString("name"));
                u.setEmail(rst.getString("email"));
                u.setPassword(rst.getString("password"));
                u.setPhone(rst.getString("phone"));
                clients.add(u);
            }
        } catch (SQLException e) {
            System.err.println("Erro na busca: " + e.getMessage());
        }
        return clients;
    }

    public List<User> list() {
        List<User> userList = new ArrayList<>();
        sql = "SELECT * FROM tab_users ORDER BY name ASC";
        try {
            pst = connection.prepareStatement(sql);
            ResultSet rst = pst.executeQuery();
            while (rst.next()) {
                User u = new User();
                u.setId(rst.getInt("id"));
                u.setPermission(rst.getBoolean("permission"));
                u.setName(rst.getString("name"));
                u.setEmail(rst.getString("email"));
                u.setPassword(rst.getString("password"));
                u.setPhone(rst.getString("phone"));
                userList.add(u);

            }
        } catch (SQLException e) {
            System.out.println("Erro ao listar clientes: " + e.getMessage());
        }

        return userList;
    }
}
