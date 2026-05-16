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

import com.google.firebase.auth.FirebaseUser;

import br.edu.ifsp.aulafirebase2026.R;
import br.edu.ifsp.aulafirebase2026.databinding.ActivityLoginBinding;
import br.edu.ifsp.aulafirebase2026.viewmodel.AuthViewModel;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;
    private AuthViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

        binding = ActivityLoginBinding.inflate(getLayoutInflater());

        setContentView(binding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        viewModel = new ViewModelProvider(this).get(AuthViewModel.class);

        binding.btnCadastro.setOnClickListener(v -> {

            //Encaminha o usuário para a tela de Cadastro

            Intent intent = new Intent(this,
                    CadastroUsuarioActivity.class);

            startActivity(intent);

        });

        binding.btnLogar.setOnClickListener(v -> {

            String email = binding.etEmail.getText().toString();
            String senha = binding.etSenha.getText().toString();

            if(validaCampos(email, senha)) {

                viewModel.login(email, senha).observe(this, usuario ->{

                    if(usuario != null) {
                        Toast.makeText(this,
                                "Login realizado com sucesso!",
                                Toast.LENGTH_LONG).show();

                        abrirTelaPrincipal();
                    }
                    else {
                        binding.tvErro.setText("Server Error: Email ou Senha inválidos");
                        binding.tvErro.setVisibility(View.VISIBLE);

                        Toast.makeText(this,
                                "Server Error: Email ou Senha inválidos",
                                Toast.LENGTH_LONG).show();
                    }

                });

            }


        });

        verificarUsuarioLogado();
        configurarTextWatchers();
    }


    private boolean validaCampos(String email, String senha) {


        if(Patterns.EMAIL_ADDRESS.matcher(email).matches() &&
        !senha.isEmpty() && senha.length() >= 10) {
            return true;
        }
        else {

            if(!Patterns.EMAIL_ADDRESS.matcher(email).matches())
                binding.tilEmail.setError("Digite um Email válido!");

            if(senha.isEmpty())
                binding.tilSenha.setError("Digite uma Senha!");

            if(senha.length() < 10)
                binding.tilSenha.setError("A senha deve ter mais do que 10 caracteres!");

            binding.tvErro.setText("Verifique o E-mail e/ou Senha (Campos obrigatórios)!");
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

            }

            @Override
            public void afterTextChanged(Editable s) {

            }

        };

        binding.etEmail.addTextChangedListener(watcher);
        binding.etSenha.addTextChangedListener(watcher);

    }


    private void verificarUsuarioLogado() {
        FirebaseUser usuario = viewModel.getCurrentUser();

        if(usuario != null) {
            abrirTelaPrincipal();
        }
    }

    private void abrirTelaPrincipal() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
    }

}