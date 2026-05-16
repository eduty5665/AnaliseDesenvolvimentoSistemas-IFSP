package br.edu.ifsp.aulasqlite.model.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import androidx.annotation.Nullable;

public class DBOpenHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "DB_PESSOAS";
    private static final int DB_VERSION = 1;
    public static final String TB_NAME = "tb_pessoa";


    public DBOpenHelper(@Nullable Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {

        String queryCreate = "CREATE TABLE " + TB_NAME +
                " (_id integer primary key autoincrement, " +
                "nome TEXT NOT NULL, " +
                "cpf TEXT, " +
                "email TEXT);";

        db.execSQL(queryCreate);

    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        //N.A porque é versão 1
    }
}
