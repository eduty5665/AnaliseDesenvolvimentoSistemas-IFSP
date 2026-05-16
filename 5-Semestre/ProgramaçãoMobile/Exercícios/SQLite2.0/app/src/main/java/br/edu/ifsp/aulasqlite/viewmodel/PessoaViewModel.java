package br.edu.ifsp.aulasqlite.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import java.util.List;

import br.edu.ifsp.aulasqlite.model.entity.Pessoa;
import br.edu.ifsp.aulasqlite.repository.PessoaRepository;

public class PessoaViewModel extends AndroidViewModel {

    private PessoaRepository repository;
    private LiveData<List<Pessoa>> lista;

    public PessoaViewModel(@NonNull Application application) {
        super(application);
        repository = new PessoaRepository(application);
        lista = repository.getAll();
    }

    public LiveData<Pessoa> getPessoaById(int id) {
        return repository.getPessoaById(id);
    }

    public LiveData<List<Pessoa>> getAll(){
        return lista;
    }

    public void update(Pessoa p) {
        repository.update(p);
    }

    public void insert(Pessoa p) {
        repository.insert(p);
    }

    public void delete(Pessoa p) {
        repository.delete(p);
    }
}
