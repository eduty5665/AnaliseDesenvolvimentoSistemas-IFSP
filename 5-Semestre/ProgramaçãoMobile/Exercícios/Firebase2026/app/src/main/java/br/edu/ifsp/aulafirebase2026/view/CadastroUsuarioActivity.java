package br.edu.ifsp.aulafirebase2026.view;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Patterns;
import android.view.View;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.lifecycle.ViewModelProvider;

import br.edu.ifsp.aulafirebase2026.R;
import br.edu.ifsp.aulafirebase2026.databinding.ActivityCadastroUsuarioBinding;
import br.edu.ifsp.aulafirebase2026.viewmodel.AuthViewModel;

public class CadastroUsuarioActivity extends AppCompatActivity {

    ActivityCadastroUsuarioBinding binding;
    private AuthViewModel viewModel;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

        binding = ActivityCadastroUsuarioBinding.inflate(getLayoutInflater());

        setContentView(binding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        viewModel = new ViewModelProvider(this).get(AuthViewModel.class);

        binding.btnVoltar.setOnClickListener(v -> {
            finish();
        });

        binding.btnCadastrarUsuario.setOnClickListener(v -> {

            String nome = binding.etNome.getText().toString();
            String email = binding.etEmail.getText().toString();
            String senha = binding.etSenha.getText().toString();

            if(validaCampos(nome, email, senha)) {

                viewModel
                        .register(email, senha, nome).
                        observe(this, usuario -> {

                            if(usuario!= null) {

                                Toast.makeText(getApplicationContext(),
                                        "Usuário Criado com Sucesso!",
                                        Toast.LENGTH_SHORT).show();

                                Intent intent = new Intent(this, LoginActivity.class);
                                startActivity(intent);
                            }
                            else {
                                binding.tvErro.setText("Server error: Erro ao cadastra o Usuário! Tente novamente!");
                                binding.tvErro.setVisibility(View.VISIBLE);

                                Toast.makeText(getApplicationContext(),
                                        "Erro ao Criar o Usuário!",
                                        Toast.LENGTH_SHORT).show();

                            }

                });

            }
        });

        configurarTextWatchers();
    }

    private boolean validaCampos(String nome, String email, String senha) {


        if(!nome.trim().isEmpty() && Patterns.EMAIL_ADDRESS.matcher(email).matches() &&
                !senha.isEmpty() && senha.length() >= 10) {
            return true;
        }
        else {

            if(nome.trim().isEmpty())
                binding.tilNome.setError("Nome é obrigatório!");

            if(!Patterns.EMAIL_ADDRESS.matcher(email).matches())
                binding.tilEmail.setError("Digite um Email válido!");

            if(senha.isEmpty())
                binding.tilSenha.setError("Digite uma Senha!");

            if(senha.length() < 10)
                binding.tilSenha.setError("A senha deve ter mais do que 10 caracteres!");

            binding.tvErro.setText("Verifique o Nome e/ou E-mail e/ou Senha (Campos obrigatórios)!");
            binding.tvErro.setVisibility(View.VISIBLE);

            return false;
        }
    }

    private void configurarTextWatchers() {

        TextWatcher watcher = new TextWatcher() {

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

                binding.tvErro.setVisibility(View.GONE);
                binding.tilEmail.setError(null);
                binding.tilSenha.setError(null);
                binding.tilNome.setError(null);

            }

            @Override
            public void afterTextChanged(Editable s) {

            }

        };

        binding.etEmail.addTextChangedListener(watcher);
        binding.etSenha.addTextChangedListener(watcher);
        binding.etNome.addTextChangedListener(watcher);

    }
}