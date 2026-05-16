package br.edu.ifsp.aulasqlite.model.dao;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import java.util.List;

import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

@Dao
public interface PessoaDao {

    @Insert
    void insert(Pessoa p);

    @Update
    void update(Pessoa p);

    @Delete
    void delete(Pessoa p);

    @Query("SELECT * FROM tb_pessoa WHERE id = :id LIMIT 1")
    LiveData<Pessoa> getById(int id);

    @Query("SELECT * FROM tb_pessoa ORDER BY nome ASC")
    LiveData<List<Pessoa>> getAll();

}
