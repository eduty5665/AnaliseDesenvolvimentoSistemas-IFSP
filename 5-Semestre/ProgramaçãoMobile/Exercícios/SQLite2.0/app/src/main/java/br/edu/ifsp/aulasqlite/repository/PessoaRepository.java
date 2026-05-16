package br.edu.ifsp.aulasqlite.repository;

import android.content.Context;

import androidx.lifecycle.LiveData;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import br.edu.ifsp.aulasqlite.model.dao.PessoaDao;
import br.edu.ifsp.aulasqlite.model.database.AulaRoomDatabase;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

public class PessoaRepository {

    private PessoaDao dao;
    private LiveData<List<Pessoa>> lista;
    private ExecutorService executor = Executors.newSingleThreadExecutor();

    public PessoaRepository(Context context) {
        AulaRoomDatabase db = AulaRoomDatabase.getInstance(context);
        dao = db.pessoaDao();
        lista = dao.getAll();
    }

    public LiveData<Pessoa> getPessoaById(int id) {
        return dao.getById(id);
    }

    public LiveData<List<Pessoa>> getAll() {
        return lista;
    }

    public void update(Pessoa p) {
        executor.execute( () -> dao.update(p));
    }

    public void insert(Pessoa p) {
        executor.execute( () -> dao.insert(p));
    }

    public void delete(Pessoa p) {
        executor.execute( () -> dao.delete(p));
    }

}
