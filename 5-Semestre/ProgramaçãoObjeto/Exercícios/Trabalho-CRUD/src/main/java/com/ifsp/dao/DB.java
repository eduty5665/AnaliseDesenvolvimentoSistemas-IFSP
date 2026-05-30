package com.ifsp.dao;

import java.sql.*;
public class DB {
    
    
    public static Connection connect(){
        Connection conection = null;
        String HOST = "jdbc:mysql://localhost:3306/db_crud_java";
        String USER = "root";
        String PASS = "";
        
        try {
            conection = DriverManager.getConnection(HOST, USER, PASS);
            return conection;
        } catch (Exception e) {
            System.out.println("Erro conexão: " + e.getMessage().toString());
            return null;
        } finally {
            
        }
        
    }
}
