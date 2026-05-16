package br.edu.ifsp.aulasqlite.model.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import br.edu.ifsp.aulasqlite.model.dao.PessoaDao;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

@Database(entities = {Pessoa.class}, version = 1)
public abstract class AulaRoomDatabase extends RoomDatabase {

    private static AulaRoomDatabase INSTANCE;
    public abstract PessoaDao pessoaDao();

    public static synchronized AulaRoomDatabase getInstance(Context context) {

        if(INSTANCE == null) {
            INSTANCE = Room.databaseBuilder(
                    context.getApplicationContext(),
                    AulaRoomDatabase.class,
                    "DB_PESSOAS")
                    //.allowMainThreadQueries()
                    .build();
        }
        return INSTANCE;
    }

}
