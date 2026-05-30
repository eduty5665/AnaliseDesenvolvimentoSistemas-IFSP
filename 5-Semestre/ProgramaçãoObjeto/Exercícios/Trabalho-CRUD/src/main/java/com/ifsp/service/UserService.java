package com.ifsp.service;

import com.ifsp.model.Client;
import com.ifsp.controller.ClientController; // Ou ClientDAO
import com.ifsp.controller.UserController;
import com.ifsp.model.User;
import com.ifsp.util.Validator;
import java.util.ArrayList;
import java.util.List;

public class UserService {

    private UserController controller = new UserController();

    public String saveUser(User user) {
        // Aplicação das validações utilitárias
        if (Validator.isEmpty(user.getName())) {
            return "O nome é obrigatório.";
        }
        
        if (!Validator.isValidEmail(user.getEmail())) {
            return "O e-mail informado é inválido.";
        }

        if (Validator.isEmpty(user.getPhone())) {
            return "O telefone/WhatsApp é obrigatório.";
        }
        
        if (Validator.isEmpty(user.getPassword())) {
            return "Informe a senha e confirme.";
        }

        // Se passar nas validações, chama a persistência
        boolean success = controller.add(user);
        return success ? "SUCESSO" : "Erro ao salvar no banco de dados.";
    }
    
    public List<User> searchUser(String str){
        List<User> list = new ArrayList<>();
        
        if(Validator.isEmpty(str)){
            return list;
        }
        
        list = controller.searchByName(str);
        return list;
    }

    public String delete(int id){
        if(!Validator.isId(id)){
            return "O verifique os dados informados e tente novamente.";
        }
        
        boolean success = controller.delete(id);
        return success ? "SUCESSO" : "Erro ao deletar o registro de usuário";
    }
}