package br.edu.ifsp.aulasqlite.controller;

import java.util.ArrayList;

import br.edu.ifsp.aulasqlite.model.dao.DBSQLiteAccess;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;
import br.edu.ifsp.aulasqlite.view.MainActivity;

public class MainActivityController {

    private MainActivity mainActivity;
    private DBSQLiteAccess dbAccess;

    public MainActivityController(MainActivity _mainActivity) {
        mainActivity = _mainActivity;
        dbAccess = new DBSQLiteAccess(mainActivity);
    }

    public ArrayList<Pessoa> getListPessoas() {
        return dbAccess.selectAll();
    }

    public void removerPessoa(Pessoa p) {
        dbAccess.deletePessoa(p);
    }

}
