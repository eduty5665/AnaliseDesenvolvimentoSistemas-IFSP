package br.edu.ifsp.primeiroapp;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import br.edu.ifsp.primeiroapp.databinding.ActivitySecondBinding;

public class SecondActivity extends AppCompatActivity {

    ActivitySecondBinding activitySecondBinding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        activitySecondBinding = ActivitySecondBinding.inflate(getLayoutInflater());

        EdgeToEdge.enable(this);
        //setContentView(R.layout.activity_second);
        setContentView(activitySecondBinding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        //Recuperar os dados
        Intent intent = getIntent();
        Dados dados = intent.getSerializableExtra(MainActivity.DADOS, Dados.class);

        /*
        String nome = intent.getStringExtra(MainActivity.KEY_NOME);
        String tel = intent.getStringExtra(MainActivity.KEY_TEL);
        String email = intent.getStringExtra(MainActivity.KEY_EMAIL);
        boolean salvarEmail =
                intent.getBooleanExtra(MainActivity.KEY_SALVAR_EMAIL, false);

        boolean ehMasc =
                intent.getBooleanExtra(MainActivity.KEY_EHMASC, true);

        String cidade = intent.getStringExtra(MainActivity.KEY_CIDADE);
        String estado = intent.getStringExtra(MainActivity.KEY_ESTADO);
        */

        //Colocar os dados nas views (componentes da tela)

        activitySecondBinding.tvNome.setText(getResources().getText(
                R.string.nome_completo) + " " + dados.getNome());
        activitySecondBinding.tvTelefone.setText(getResources().getText(
                R.string.telefone) + " " + dados.getTel());
        activitySecondBinding.tvEmail.setText(getResources().getText(
                R.string.e_mail) +" " + dados.getEmail());
        activitySecondBinding.cbSalvarEmailResultado.setChecked(dados.isSalvarEmail());

        if(dados.isEhMasc()) {
            activitySecondBinding.tvSexo.setText(
                    getResources().getText(R.string.sexo) + " " +
                            getResources().getText(R.string.masculino));
        } else {
            activitySecondBinding.tvSexo.setText(
                    getResources().getText(R.string.sexo) + " "  +
                            getResources().getText(R.string.feminino));
        }

        activitySecondBinding.tvCidade.setText(
                getResources().getText(R.string.cidade) + " " + dados.getCidade());
        activitySecondBinding.tvEstado.setText(
                getResources().getText(R.string.estado) + " " + dados.getEstado());

        activitySecondBinding.btnVoltar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

    }
}