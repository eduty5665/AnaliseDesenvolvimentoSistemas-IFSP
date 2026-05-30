package com.ifsp.service;

import com.ifsp.model.Client;
import com.ifsp.controller.ClientController; // Ou ClientDAO
import com.ifsp.util.Validator;
import java.util.ArrayList;
import java.util.List;

public class ClientService {

    private ClientController controller = new ClientController();

    public String saveClient(Client client) {
        // Aplicação das validações utilitárias
        if (Validator.isEmpty(client.getName())) {
            return "O nome é obrigatório.";
        }
        
        if (Validator.isEmpty(client.getCpf())) {
            return "O cpf é obrigatório.";
        }
        
        if (!Validator.isValidEmail(client.getEmail())) {
            return "O e-mail informado é inválido.";
        }

        if (Validator.isEmpty(client.getPhone())) {
            return "O telefone/WhatsApp é obrigatório.";
        }
        
        if (Validator.isEmpty(client.getAddress())) {
            return "O endereço é obrigatório.";
        }

        // Se passar nas validações, chama a persistência
        boolean success = controller.add(client);
        return success ? "SUCESSO" : "Erro ao salvar no banco de dados.";
    }
    
    public List<Client> searchClient(String str){
        List<Client> list = new ArrayList<>();
        
        if(Validator.isEmpty(str)){
            return list;
        }
        
        list = controller.searchByName(str);
        return list;
    }
}