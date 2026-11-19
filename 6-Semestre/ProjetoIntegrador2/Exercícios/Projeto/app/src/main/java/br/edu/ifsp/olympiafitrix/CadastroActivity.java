package br.edu.ifsp.olympiafitrix;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import java.util.Locale;

public class CadastroActivity extends BaseActivity {

    private EditText editEmailCadastro;
    private EditText editSenhaCadastro;
    private EditText editConfirmarSenha;
    private Button btnCadastrar;
    private SupabaseClient supabaseClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cadastro);

        editEmailCadastro = findViewById(R.id.editEmailCadastro);
        editSenhaCadastro = findViewById(R.id.editSenhaCadastro);
        editConfirmarSenha = findViewById(R.id.editConfirmarSenha);
        btnCadastrar = findViewById(R.id.btnCadastrar);
        Button btnVoltarCadastro = findViewById(R.id.btnVoltarCadastro);
        supabaseClient = new SupabaseClient(this);

        btnCadastrar.setOnClickListener(v -> validarDados());
        btnVoltarCadastro.setOnClickListener(v -> finish());
    }

    private void validarDados() {
        String email = editEmailCadastro.getText().toString().trim();
        String senha = editSenhaCadastro.getText().toString().trim();
        String confirmarSenha = editConfirmarSenha.getText().toString().trim();

        if (email.isEmpty()) {
            editEmailCadastro.setError(getString(R.string.error_email_required));
            editEmailCadastro.requestFocus();
            return;
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            editEmailCadastro.setError(getString(R.string.error_email_invalid));
            editEmailCadastro.requestFocus();
            return;
        }

        if (senha.isEmpty()) {
            editSenhaCadastro.setError(getString(R.string.error_password_required));
            editSenhaCadastro.requestFocus();
            return;
        }

        if (confirmarSenha.isEmpty()) {
            editConfirmarSenha.setError(getString(R.string.error_password_confirm));
            editConfirmarSenha.requestFocus();
            return;
        }

        if (!senha.equals(confirmarSenha)) {
            editConfirmarSenha.setError(getString(R.string.error_password_mismatch));
            editConfirmarSenha.requestFocus();
            return;
        }

        verificarEmailAntesDeContinuar(email, senha);
    }

    private void verificarEmailAntesDeContinuar(String email, String senha) {
        btnCadastrar.setEnabled(false);
        btnCadastrar.setText(R.string.state_checking);

        supabaseClient.verificarEmailExiste(
                email,
                new SupabaseClient.VerificacaoCallback() {
                    @Override
                    public void onResultado(boolean existe) {
                        restaurarBotaoCadastro();
                        if (existe) {
                            editEmailCadastro.setError(getString(R.string.error_email_exists));
                            editEmailCadastro.requestFocus();
                            return;
                        }

                        continuarCadastro(email, senha);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        restaurarBotaoCadastro();
                        Toast.makeText(
                                CadastroActivity.this,
                                mensagem,
                                Toast.LENGTH_SHORT
                        ).show();
                    }
                }
        );
    }

    private void continuarCadastro(String email, String senha) {
        SharedPreferences.Editor editor =
                getSharedPreferences("cadastro_temp", MODE_PRIVATE).edit();
        editor.putString("email", email.toLowerCase(Locale.ROOT));
        editor.putString("senha", senha);
        editor.apply();

        startActivity(new Intent(this, CadastroPerfilActivity.class));
    }

    private void restaurarBotaoCadastro() {
        btnCadastrar.setEnabled(true);
        btnCadastrar.setText(R.string.ui_proxima_etapa);
    }
}
