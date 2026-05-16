package br.edu.ifsp.primeiroapp;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import br.edu.ifsp.primeiroapp.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {

    ActivityMainBinding activityMainBinding;
    public static final String DADOS = "DADOS";
    public static final String KEY_NOME = "KEY_NOME";
    public static final String KEY_TEL = "KEY_TEL";
    public static final String KEY_EMAIL = "KEY_EMAIL";
    public static final String KEY_SALVAR_EMAIL = "KEY_SALVAR_EMAIL";
    public static final String KEY_EHMASC = "KEY_EHMASC";
    public static final String KEY_CIDADE = "KEY_CIDADE";
    public static final String KEY_ESTADO = "KEY_ESTADO";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        activityMainBinding = ActivityMainBinding.inflate(getLayoutInflater());

        EdgeToEdge.enable(this);
        //setContentView(R.layout.activity_main);
        setContentView(activityMainBinding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        Log.v("CICLO_ACTIVITY","onCreate: Inicio Ciclo de Vida");

        activityMainBinding.btnLimpar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
               limparTela();
            }
        });

        activityMainBinding.btnEnviar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                enviarDados();
            }
        });
    }

    private void enviarDados() {

        String nome = activityMainBinding.etNome.getText().toString();
        String tel = activityMainBinding.etTelefone.getText().toString();
        String email = activityMainBinding.etEmail.getText().toString();
        boolean salvarEmail = activityMainBinding.cbSalvarEmail.isChecked();
        boolean ehMasc = activityMainBinding.rbMasculino.isChecked();
        String cidade = activityMainBinding.etCidade.getText().toString();
        String estado =
                ((TextView)activityMainBinding.spEstado
                        .getSelectedView()).getText().toString();


        Dados dados = new Dados(nome, tel, email, salvarEmail, ehMasc, cidade, estado);

        Intent intent = new Intent(this, SecondActivity.class);
        /*
        intent.putExtra(KEY_NOME, nome);
        intent.putExtra(KEY_TEL, tel);
        intent.putExtra(KEY_EMAIL, email);
        intent.putExtra(KEY_SALVAR_EMAIL, salvarEmail);
        intent.putExtra(KEY_EHMASC, ehMasc);
        intent.putExtra(KEY_CIDADE, cidade);
        intent.putExtra(KEY_ESTADO, estado);
         */
        intent.putExtra(DADOS, dados);
        startActivity(intent);
    }

    /***
     * Metodo que salva os dados preenchidos pelo usuário
     */
    private void salvarDados() {
        String nome = activityMainBinding.etNome.getText().toString();
        String tel = activityMainBinding.etTelefone.getText().toString();
        String email = activityMainBinding.etEmail.getText().toString();
        boolean salvarEmail = activityMainBinding.cbSalvarEmail.isChecked();
        boolean ehMasc = activityMainBinding.rbMasculino.isChecked();
        String cidade = activityMainBinding.etCidade.getText().toString();
        String estado =
                ((TextView)activityMainBinding.spEstado
                        .getSelectedView()).getText().toString();

        /*
        String texto = "Nome: " + nome +
                       "\nTel: " + tel +
                       "\nEmail: " + email +
                       "\nSalvaEmail: " + salvarEmail +
                       "\nEhMasc: " + ehMasc +
                       "\nCidade: " + cidade +
                       "\nEstado: " + estado;

        Log.v("DADOS", texto);
        */

        salvarDadosNaMemoria(nome, tel, email, salvarEmail, ehMasc, cidade, estado);
    }

    private void salvarDadosNaMemoria(String nome, String tel, String email,
                                      boolean salvarEmail, boolean ehMasc,
                                      String cidade, String estado) {

        SharedPreferences sharedPref =
                getSharedPreferences(DADOS, MODE_PRIVATE);

        SharedPreferences.Editor editor = sharedPref.edit();

        editor.putString(KEY_NOME, nome);
        editor.putString(KEY_TEL, tel);
        editor.putString(KEY_EMAIL, email);
        editor.putBoolean(KEY_SALVAR_EMAIL, salvarEmail);
        editor.putBoolean(KEY_EHMASC, ehMasc);
        editor.putString(KEY_CIDADE, cidade);
        editor.putString(KEY_ESTADO, estado);

        editor.apply();

        Toast.makeText(getApplicationContext(),
                "Dados salvos com sucesso!",
                Toast.LENGTH_LONG).show();



    }

    /***
     * Metodo que limpa todos os componentes preenchidos na tela
     */
    private void limparTela() {
        //EditText etNome = findViewById(R.id.etNome);
        //etNome.setText("");
        activityMainBinding.etNome.setText("");
        activityMainBinding.etTelefone.setText("");
        activityMainBinding.etEmail.setText("");
        activityMainBinding.cbSalvarEmail.setChecked(false);
        activityMainBinding.rbMasculino.setChecked(true);
        activityMainBinding.etCidade.setText("");
        activityMainBinding.spEstado.setSelection(0);
    }

    @Override
    protected void onStart() {
        super.onStart();

        Log.v("CICLO_ACTIVITY", "onStart: Tela Visível");
    }

    @Override
    protected void onResume() {
        super.onResume();

        //Recuperar os dados preenchidos
        recuperarDados();

        Log.v("CICLO_ACTIVITY", "onResume: Volta ao Primeiro Plano");
    }

    private void recuperarDados() {

        //Recuperar os dados
        SharedPreferences sharedPref =
                getSharedPreferences(DADOS, MODE_PRIVATE);

        String nome = sharedPref.getString(KEY_NOME, "");
        String tel = sharedPref.getString(KEY_TEL, "");
        String email = sharedPref.getString(KEY_EMAIL, "");
        boolean salvarEmail =
                sharedPref.getBoolean(KEY_SALVAR_EMAIL, false);
        boolean ehMasc = sharedPref.getBoolean(KEY_EHMASC, true);
        String cidade = sharedPref.getString(KEY_CIDADE, "");
        String estado = sharedPref.getString(KEY_ESTADO, "");

        activityMainBinding.etNome.setText(nome);
        activityMainBinding.etTelefone.setText(tel);
        activityMainBinding.etEmail.setText(email);
        activityMainBinding.cbSalvarEmail.setChecked(salvarEmail);

        if(ehMasc) {
            activityMainBinding.rbMasculino.setChecked(true);
        }
        else {
            activityMainBinding.rbFeminino.setChecked(true);
        }

        activityMainBinding.etCidade.setText(cidade);

        ArrayAdapter<String> adapter =
                (ArrayAdapter<String>) activityMainBinding.spEstado.getAdapter();

        int pos = adapter.getPosition(estado);

        activityMainBinding.spEstado.setSelection(pos);
    }

    @Override
    protected void onPause() {
        super.onPause();

        //Salvar os dados preenchidos
        salvarDados();

       Log.v("CICLO_ACTIVITY", "onPause: Saindo do Primeiro Plano");
    }

    @Override
    protected void onStop() {
        super.onStop();

        Log.v("CICLO_ACTIVITY","onStop: Finalizando, mas ainda vísivel");
    }

    @Override
    protected void onRestart() {
        super.onRestart();

        Log.v("CICLO_ACTIVITY", "onRestart: Reiniciando a Activity");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        Log.v("CICLO_ACTIVITY", "onDestroy: Finalizando a Activity");
    }
}

