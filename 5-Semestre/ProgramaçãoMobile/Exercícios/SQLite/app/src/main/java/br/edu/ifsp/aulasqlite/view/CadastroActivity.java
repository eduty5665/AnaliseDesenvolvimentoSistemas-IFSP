package br.edu.ifsp.aulasqlite.view;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import br.edu.ifsp.aulasqlite.R;
import br.edu.ifsp.aulasqlite.controller.CadastroActivityController;
import br.edu.ifsp.aulasqlite.databinding.ActivityCadastroBinding;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

public class CadastroActivity extends AppCompatActivity {

    private ActivityCadastroBinding binding;
    private CadastroActivityController controller;

    private int idPessoa;

    public final static String ID_PESSOA = "ID_PESSOA";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityCadastroBinding.inflate(getLayoutInflater());

        EdgeToEdge.enable(this);
        setContentView(binding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        ActionBar actionBar = getSupportActionBar();
        actionBar.hide();

        controller = new CadastroActivityController(this);

        Intent intent = getIntent();

        if(intent != null) {
            idPessoa = intent.getIntExtra(ID_PESSOA, 0);

            if(idPessoa > 0) {
                //Edição, existe a pessoa
                binding.tvTitulo.setText("Edição");
                binding.btnCadastrar.setVisibility(View.GONE);
                carregarPessoa();
            }
            else {
                binding.btnEditar.setVisibility(View.GONE);
            }
        }

        binding.btnCadastrar.setOnClickListener(view -> {
            adicionarPessoa();
        });

        binding.btnEditar.setOnClickListener(view -> {
            editarPessoa();
        });

        binding.btnVoltar.setOnClickListener(view -> {
            finish();
        });
    }


    private void carregarPessoa() {
        Pessoa p = controller.findPessoa(idPessoa);

        if(p != null) {
            binding.etNome.setText(p.getNome());
            binding.etCpf.setText(p.getCpf());
            binding.etEmail.setText(p.getEmail());
        }
        else {

            Toast.makeText(this,
                    "Erro ao carregar Pessoa!",
                    Toast.LENGTH_LONG).show();

            finish();
        }
    }


    private void adicionarPessoa() {

        String nome = binding.etNome.getText().toString();
        String cpf = binding.etCpf.getText().toString();
        String email = binding.etEmail.getText().toString();

        if(!nome.trim().isEmpty()) {

            //Salvo no banco
            Pessoa p = new Pessoa(0, nome, cpf, email);
            controller.addPessoa(p);

            Toast.makeText(this,
                    "Pessoa adicionada com sucesso!",
                    Toast.LENGTH_LONG).show();

            finish();


        }
        else {
            //Nome está vazio
            Toast.makeText(this,
                    "O campo Nome é obrigatório!",
                    Toast.LENGTH_LONG).show();

            binding.etNome.requestFocus();

        }

    }



    private void editarPessoa() {

        String nome = binding.etNome.getText().toString();
        String cpf = binding.etCpf.getText().toString();
        String email = binding.etEmail.getText().toString();

        if(!nome.trim().isEmpty()) {
            //Tem nome
            Pessoa p = new Pessoa(idPessoa, nome, cpf, email);
            controller.updatePessoa(p);

            Toast.makeText(this,
                    "Pessoa editada com sucesso!",
                    Toast.LENGTH_LONG).show();

            finish();

        }
        else {
            //Nome está vazio
            Toast.makeText(this,
                    "O campo Nome é obrigatório!",
                    Toast.LENGTH_LONG).show();

            binding.etNome.requestFocus();
        }

    }
}