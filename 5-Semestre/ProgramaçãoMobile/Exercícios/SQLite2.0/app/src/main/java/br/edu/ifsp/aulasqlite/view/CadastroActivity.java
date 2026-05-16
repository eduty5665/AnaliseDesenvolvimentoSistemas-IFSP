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
import androidx.lifecycle.ViewModelProvider;

import br.edu.ifsp.aulasqlite.R;
import br.edu.ifsp.aulasqlite.databinding.ActivityCadastroBinding;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;
import br.edu.ifsp.aulasqlite.viewmodel.PessoaViewModel;

public class CadastroActivity extends AppCompatActivity {


    private ActivityCadastroBinding binding;
    private PessoaViewModel viewModel;
    private int idPessoa;

    public static final String ID_PESSOA = "ID_PESSOA";

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

        //controller = new CadastroActivityController(this);
        viewModel = new ViewModelProvider
                .AndroidViewModelFactory(getApplication())
                .create(PessoaViewModel.class);

        Intent intent = getIntent();

        if(intent != null) {

            idPessoa = intent.getIntExtra(ID_PESSOA, 0);

            if(idPessoa > 0) {
                //Existe a pessoa, então é uma edição/update
                binding.btnCadastrar.setVisibility(View.GONE);
                binding.tvTitulo.setText("Edição");
                carregarPessoa();
            }
            else {
                //Pessoa não existe, então é um cadastro/insert
                binding.btnEditar.setVisibility(View.GONE);
            }
        }


        binding.btnCadastrar.setOnClickListener(view -> {
            cadastrarPessoa();
        });

        binding.btnEditar.setOnClickListener(view -> {
            editarPessoa();
        });

        binding.btnVoltar.setOnClickListener(view -> {
            finish();
        });

    }


    private void carregarPessoa() {

        //Pessoa p = controller.findPessoa(idPessoa);
        viewModel.getPessoaById(idPessoa).observe(this, p -> {
            if(p != null) {
                binding.etNome.setText(p.getNome());
                binding.etCpf.setText(p.getCpf());
                binding.etEmail.setText(p.getEmail());
            }
            else {
                Toast.makeText(this,
                        "Erro ao carregar a pessoa!",
                        Toast.LENGTH_LONG).show();

                finish();
            }
        });
    }

    private void cadastrarPessoa() {

        String nome = binding.etNome.getText().toString();
        String cpf = binding.etCpf.getText().toString();
        String email = binding.etEmail.getText().toString();

        if(!nome.trim().isEmpty()) {
            //Nome não vazio, OK, salvo no banco

            Pessoa p = new Pessoa(0, nome, cpf, email);
            //controller.addPessoa(p);
            viewModel.insert(p);

            Toast.makeText(this,
                    "Pessoa adicionada com sucesso!",
                    Toast.LENGTH_LONG).show();

            finish();

        }
        else {
            //Aviso que precisa do nome (NOT NULL)
            Toast.makeText(this,
                    "Campo Nome é obrigatório!",
                    Toast.LENGTH_LONG).show();

            binding.etNome.requestFocus();
        }

    }



    private void editarPessoa() {

        String nome = binding.etNome.getText().toString();
        String cpf = binding.etCpf.getText().toString();
        String email = binding.etEmail.getText().toString();

        if(!nome.trim().isEmpty()) {
            //Nome não vazio, OK, salvo no banco

            Pessoa p = new Pessoa(idPessoa, nome, cpf, email);
            //controller.updatePessoa(p);
            viewModel.update(p);

            Toast.makeText(this,
                    "Pessoa editada com sucesso!",
                    Toast.LENGTH_LONG).show();

            finish();

        }
        else {
            //Aviso que precisa do nome (NOT NULL)
            Toast.makeText(this,
                    "Campo Nome é obrigatório!",
                    Toast.LENGTH_LONG).show();

            binding.etNome.requestFocus();
        }
    }


}