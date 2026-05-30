package com.ifsp.controller;

import com.ifsp.dao.DB;
import com.ifsp.model.Client;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ClientController {
    private String sql;
    private Connection connection;
    private PreparedStatement pst = null;

    public ClientController() {
        this.connection = DB.connect();
    }

    public boolean add(Client client) {
        if (client.getId() <= 0) {
            this.sql = "INSERT INTO tab_clients (name, cpf, email, phone, address) VALUES (?, ?, ?, ?, ?)";
        } else {
            this.sql = "UPDATE tab_clients SET name = ?, cpf = ?, email = ?, phone = ?, address = ? WHERE id = ?";
        }
        try {
            pst = connection.prepareStatement(sql);
            pst.setString(1, client.getName());
            pst.setString(2, client.getCpf());
            pst.setString(3, client.getEmail());
            pst.setString(4, client.getPhone());
            pst.setString(5, client.getAddress());
            if(client.getId() > 0) pst.setInt(6, client.getId());

            pst.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Erro ao inserir cliente: " + e.getMessage());
            return false;
        }
    }

    public boolean delete(int id) {
        String sql = "DELETE FROM tab_clients WHERE id = ?";
        try (PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setInt(1, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Erro ao deletar: " + e.getMessage());
            return false;
        }
    }

    public List<Client> searchByName(String name) {
        List<Client> clients = new ArrayList<>();
        String sql = "SELECT * FROM tab_clients WHERE name LIKE ?";
        try (PreparedStatement pst = connection.prepareStatement(sql)) {
            pst.setString(1, "%" + name + "%");
            ResultSet rst = pst.executeQuery();
            while (rst.next()) {
                Client c = new Client();
                c.setId(rst.getInt("id"));
                c.setName(rst.getString("name"));
                c.setCpf(rst.getString("cpf"));
                c.setEmail(rst.getString("email"));
                c.setPhone(rst.getString("phone"));
                c.setAddress(rst.getString("address"));
                clients.add(c);

                System.out.println("teste");
            }
        } catch (SQLException e) {
            System.err.println("Erro na busca: " + e.getMessage());
        }
        return clients;
    }

    public List<Client> list() {
        List<Client> clients = new ArrayList<>();
        String sql = "SELECT * FROM tab_clients ORDER BY id DESC";
        try {
            PreparedStatement pst = connection.prepareStatement(sql);
            ResultSet rst = pst.executeQuery();
            while (rst.next()) {
                Client c = new Client();
                c.setId(rst.getInt("id"));
                c.setName(rst.getString("name"));
                c.setCpf(rst.getString("cpf"));
                c.setEmail(rst.getString("email"));
                c.setPhone(rst.getString("phone"));
                c.setAddress(rst.getString("address"));
                clients.add(c);

            }
        } catch (Exception e) {
            System.out.println("Erro ao listar clientes: " + e.getMessage());
        }

        return clients;
    }
}
