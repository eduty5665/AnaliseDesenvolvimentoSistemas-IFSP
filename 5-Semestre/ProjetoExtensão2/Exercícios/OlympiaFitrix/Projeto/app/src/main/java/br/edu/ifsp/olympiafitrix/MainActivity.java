package br.edu.ifsp.olympiafitrix;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.android.material.button.MaterialButtonToggleGroup;

public class MainActivity extends BaseActivity {

    private EditText editEmail;
    private EditText editSenha;
    private Button btnLogin;
    private TextView txtIrParaCadastro;

    private SupabaseClient supabaseClient;
    private ActivityResultLauncher<String> permissaoNotificacaoLauncher;
    private String tipoUsuarioPendente;
    private int idUsuarioPendente;
    private int idPersonalPendente;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        editEmail = findViewById(R.id.editEmail);
        editSenha = findViewById(R.id.editSenha);
        btnLogin = findViewById(R.id.btnLogin);
        txtIrParaCadastro = findViewById(R.id.txtIrParaCadastro);

        MaterialButtonToggleGroup toggleIdioma = findViewById(R.id.toggleIdioma);
        boolean idiomaIngles = LocaleHelper.INGLES.equals(LocaleHelper.obterIdioma(this));
        toggleIdioma.check(idiomaIngles ? R.id.btnIdiomaEn : R.id.btnIdiomaPt);
        toggleIdioma.addOnButtonCheckedListener((group, checkedId, isChecked) -> {
            if (!isChecked) {
                return;
            }
            LocaleHelper.selecionarIdioma(
                    this,
                    checkedId == R.id.btnIdiomaEn
                            ? LocaleHelper.INGLES
                            : LocaleHelper.PORTUGUES
            );
        });

        supabaseClient = new SupabaseClient(this);
        permissaoNotificacaoLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestPermission(),
                isGranted -> {
                    if (!isGranted) {
                        Toast.makeText(
                                this,
                                "Permissão de notificação negada.",
                                Toast.LENGTH_SHORT
                        ).show();
                    }

                    abrirTelaInicialAposLogin(
                            tipoUsuarioPendente,
                            idUsuarioPendente,
                            idPersonalPendente
                    );
                }
        );

        btnLogin.setOnClickListener(v -> validarLogin());

        txtIrParaCadastro.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, CadastroActivity.class);
            startActivity(intent);
        });
    }

    private void validarLogin() {
        String email = editEmail.getText().toString().trim();
        String senha = editSenha.getText().toString().trim();

        if (email.isEmpty()) {
            editEmail.setError(getString(R.string.error_email_required));
            editEmail.requestFocus();
            return;
        }

        if (senha.isEmpty()) {
            editSenha.setError(getString(R.string.error_password_required));
            editSenha.requestFocus();
            return;
        }

        btnLogin.setEnabled(false);
        btnLogin.setText(R.string.state_entering);

        supabaseClient.fazerLogin(email, senha, new SupabaseClient.LoginCallback() {
            @Override
            public void onSucesso(
                    String tipoUsuario,
                    int idUsuario,
                    int idLogin,
                    int idPersonal
            ) {
                btnLogin.setEnabled(true);
                btnLogin.setText(R.string.ui_entrar);

                salvarSessao(tipoUsuario, idUsuario, idLogin, idPersonal);
                sincronizarTokenFcm(tipoUsuario, idUsuario);

                Toast.makeText(
                        MainActivity.this,
                        getString(R.string.success_login),
                        Toast.LENGTH_SHORT
                ).show();

                solicitarPermissaoNotificacoesOuAbrirTela(tipoUsuario, idUsuario, idPersonal);
            }

            @Override
            public void onErro(String mensagem) {
                btnLogin.setEnabled(true);
                btnLogin.setText(R.string.ui_entrar);

                Toast.makeText(
                        MainActivity.this,
                        mensagem,
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    private void salvarSessao(
            String tipoUsuario,
            int idUsuario,
            int idLogin,
            int idPersonal
    ) {
        SharedPreferences prefs =
                getSharedPreferences("sessao", MODE_PRIVATE);

        SharedPreferences.Editor editor = prefs.edit();

        editor.putString("tipoUsuario", tipoUsuario);
        editor.putInt("idUsuario", idUsuario);
        editor.putInt("idLogin", idLogin);
        editor.putInt("idPersonal", idPersonal);

        editor.apply();
    }

    private void solicitarPermissaoNotificacoesOuAbrirTela(
            String tipoUsuario,
            int idUsuario,
            int idPersonal
    ) {
        tipoUsuarioPendente = tipoUsuario;
        idUsuarioPendente = idUsuario;
        idPersonalPendente = idPersonal;

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            abrirTelaInicialAposLogin(tipoUsuario, idUsuario, idPersonal);
            return;
        }

        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED) {
            abrirTelaInicialAposLogin(tipoUsuario, idUsuario, idPersonal);
            return;
        }

        permissaoNotificacaoLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
    }

    private void abrirTelaInicialAposLogin(
            String tipoUsuario,
            int idUsuario,
            int idPersonal
    ) {
        if ("aluno".equals(tipoUsuario)) {
            Intent intent = new Intent(MainActivity.this, AlunoSemPersonalActivity.class);
            intent.putExtra("id_aluno", idUsuario);
            startActivity(intent);
            finish();
            return;
        }

        if ("personal".equals(tipoUsuario)) {
            Intent intent = new Intent(MainActivity.this, PersonalHomeActivity.class);
            startActivity(intent);
            finish();
        }
    }

    private void sincronizarTokenFcm(String tipoUsuario, int idUsuario) {
        FirebaseMessaging.getInstance().getToken()
                .addOnSuccessListener(token -> {
                    getSharedPreferences("sessao", MODE_PRIVATE)
                            .edit()
                            .putString("fcmToken", token)
                            .apply();

                    supabaseClient.atualizarFcmToken(
                            tipoUsuario,
                            idUsuario,
                            token,
                            new SupabaseClient.CadastroCallback() {
                                @Override
                                public void onSucesso() {
                                    Log.d("FCM_TOKEN", "Token salvo no Supabase.");
                                }

                                @Override
                                public void onErro(String mensagem) {
                                    Log.e("FCM_TOKEN", "Erro ao salvar token: " + mensagem);
                                }
                            }
                    );
                })
                .addOnFailureListener(e -> Log.e("FCM_TOKEN", "Erro ao obter token FCM.", e));
    }
}
