package br.edu.ifsp.aulasqlite.model.dao;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;

import java.util.ArrayList;

import br.edu.ifsp.aulasqlite.model.database.DBOpenHelper;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

public class DBSQLiteAccess {

    DBOpenHelper dbHelper;
    SQLiteDatabase db;

    public DBSQLiteAccess(Context context) {
        dbHelper = new DBOpenHelper(context);
    }

    public void open() throws SQLiteException {
        db = dbHelper.getWritableDatabase();
    }

    public void close() {

        if(db != null)
            db.close();
    }

    public void deletePessoa(Pessoa p) {

        open();

        db.delete(DBOpenHelper.TB_NAME,
                "_id = ?",
                new String[]{String.valueOf(p.getId())});

        close();
    }

    public void insertPessoa(Pessoa p) {

        open();

        ContentValues contentValues = new ContentValues();

        contentValues.put("nome", p.getNome()); //TODO: nome não pode ser vazio
        contentValues.put("cpf", p.getCpf());
        contentValues.put("email", p.getEmail());

        db.insert(DBOpenHelper.TB_NAME,
                null,
                contentValues);

        close();
    }

    public void updatePessoa(Pessoa p) {

        open();

        ContentValues contentValues = new ContentValues();

        contentValues.put("nome", p.getNome()); //TODO: nome não pode ser vazio
        contentValues.put("cpf", p.getCpf());
        contentValues.put("email", p.getEmail());

        db.update(DBOpenHelper.TB_NAME,
                contentValues,
                "_id = ?",
                new String[]{String.valueOf(p.getId())});

        close();
    }

    public Pessoa selectOnePessoa(int id) {

        Pessoa p = null;

        open();

        String[] columns = new String[]{"_id", "nome", "cpf", "email"};

        Cursor cursor = db.query(DBOpenHelper.TB_NAME,
                columns,
                "_id = ?",
                new String[]{String.valueOf(id)},
                null,
                null,
                null);

        if(cursor.getCount() > 0) {
            cursor.moveToFirst();

            int idPessoa = cursor.getInt(0);
            String nome = cursor.getString(1);
            String cpf = cursor.getString(2);
            String email = cursor.getString(3);

            p = new Pessoa(idPessoa, nome, cpf, email);
        }

        cursor.close();

        close();

        return p;
    }

    public ArrayList<Pessoa> selectAll() {

        ArrayList<Pessoa> arrPessoas = new ArrayList<>();
        Pessoa p = null;

        open();

        String[] columns = new String[]{"_id", "nome", "cpf", "email"};

        Cursor cursor = db.query(DBOpenHelper.TB_NAME,
                columns,
                null,
                null,
                null,
                null,
                "nome ASC");

        if(cursor.getCount() > 0) {
            cursor.moveToFirst();

            do {
                p = new Pessoa(cursor.getInt(0), //_id
                        cursor.getString(1), //nome
                        cursor.getString(2), //cpf
                        cursor.getString(3)); //email

                arrPessoas.add(p);
            }
            while(cursor.moveToNext());
        }

        cursor.close();

        close();

        return arrPessoas;
    }

}
