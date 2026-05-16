package br.edu.ifsp.aulasqlite.controller;

import br.edu.ifsp.aulasqlite.model.dao.DBSQLiteAccess;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;
import br.edu.ifsp.aulasqlite.view.CadastroActivity;

public class CadastroActivityController {

    private CadastroActivity cadastroActivity;
    private DBSQLiteAccess dbAccess;

    public CadastroActivityController(CadastroActivity _cadastroActivity) {
        cadastroActivity = _cadastroActivity;
        dbAccess = new DBSQLiteAccess(cadastroActivity);
    }

    public void addPessoa(Pessoa p) {
        dbAccess.insertPessoa(p);
    }

    public void updatePessoa(Pessoa p) {
        dbAccess.updatePessoa(p);
    }

    public Pessoa findPessoa(int id) {
        return dbAccess.selectOnePessoa(id);
    }

}
