package br.edu.ifsp.olympiafitrix;

import android.Manifest;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import org.json.JSONObject;

import java.io.File;
import java.io.IOException;

import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;
import br.edu.ifsp.olympiafitrix.util.ValidadorCadastro;

/** Permite ao personal atualizar seus dados profissionais, senha e foto. */
public class PerfilPersonalActivity extends BaseActivity {

    private EditText editPerfilPersonalNome;
    private EditText editPerfilPersonalEmail;
    private EditText editPerfilPersonalSenha;
    private EditText editPerfilPersonalCpf;
    private EditText editPerfilPersonalCref;
    private EditText editPerfilPersonalTelefone;

    private RadioButton radioMasculinoPersonalPerfil;
    private RadioButton radioFemininoPersonalPerfil;

    private Button btnSalvarPerfilPersonal;
    private ImageView imgFotoPerfilPersonal;
    private ImageButton btnAlterarFotoPerfilPersonal;
    private ProgressBar progressFotoPerfilPersonal;
    private ActivityResultLauncher<String> permissaoCameraLauncher;
    private ActivityResultLauncher<Uri> cameraLauncher;
    private ActivityResultLauncher<String> galeriaLauncher;
    private ActivityResultLauncher<String[]> permissaoGaleriaLauncher;
    private File arquivoFotoTemporaria;
    private String fotoUrlAtual = "";

    private SupabaseClient supabaseClient;

    private int idPersonal;
    private int idLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_perfil_personal);

        supabaseClient = new SupabaseClient(this);

        configurarCamera();

        inicializarComponentes();

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idPersonal = prefs.getInt("idUsuario", -1);
        idLogin = prefs.getInt("idLogin", -1);

        if (idPersonal == -1 || idLogin == -1) {
            Toast.makeText(this, R.string.error_session_login_again, Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        carregarPerfil();

        btnSalvarPerfilPersonal.setOnClickListener(v -> salvarPerfil());
        btnAlterarFotoPerfilPersonal.setOnClickListener(v -> escolherOrigemFoto());

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorPersonalHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuUsuario);
    }

    private void inicializarComponentes() {
        editPerfilPersonalNome = findViewById(R.id.editPerfilPersonalNome);
        editPerfilPersonalEmail = findViewById(R.id.editPerfilPersonalEmail);
        editPerfilPersonalSenha = findViewById(R.id.editPerfilPersonalSenha);
        editPerfilPersonalSenha.setHint(R.string.new_password_optional);
        editPerfilPersonalCpf = findViewById(R.id.editPerfilPersonalCpf);
        editPerfilPersonalCref = findViewById(R.id.editPerfilPersonalCref);
        editPerfilPersonalTelefone = findViewById(R.id.editPerfilPersonalTelefone);

        radioMasculinoPersonalPerfil = findViewById(R.id.radioMasculinoPersonalPerfil);
        radioFemininoPersonalPerfil = findViewById(R.id.radioFemininoPersonalPerfil);

        btnSalvarPerfilPersonal = findViewById(R.id.btnSalvarPerfilPersonal);
        imgFotoPerfilPersonal = findViewById(R.id.imgFotoPerfilPersonal);
        btnAlterarFotoPerfilPersonal = findViewById(R.id.btnAlterarFotoPerfilPersonal);
        progressFotoPerfilPersonal = findViewById(R.id.progressFotoPerfilPersonal);
    }

    private void carregarPerfil() {
        supabaseClient.buscarPerfilPersonal(idPersonal, new SupabaseClient.PerfilPersonalCallback() {
            @Override
            public void onSucesso(JSONObject perfil) {
                try {
                    editPerfilPersonalNome.setText(perfil.optString("nome"));
                    editPerfilPersonalEmail.setText(perfil.optString("email"));
                    editPerfilPersonalSenha.setText(perfil.optString("senha"));
                    editPerfilPersonalCpf.setText(perfil.optString("cpf"));
                    editPerfilPersonalCref.setText(perfil.optString("cref"));
                    editPerfilPersonalTelefone.setText(perfil.optString("telefone"));
                    fotoUrlAtual = perfil.optString("foto_url");
                    FotoPerfilUtils.carregar(imgFotoPerfilPersonal, fotoUrlAtual);

                    boolean sexo = perfil.optBoolean("sexo");

                    if (sexo) {
                        radioMasculinoPersonalPerfil.setChecked(true);
                    } else {
                        radioFemininoPersonalPerfil.setChecked(true);
                    }

                } catch (Exception e) {
                    Log.e("PERFIL_PERSONAL", "Erro ao carregar perfil", e);
                    Toast.makeText(
                            PerfilPersonalActivity.this,
                            "Erro ao carregar perfil",
                            Toast.LENGTH_SHORT
                    ).show();
                }
            }

            @Override
            public void onErro(String mensagem) {
                Log.e("PERFIL_PERSONAL", mensagem);
                Toast.makeText(
                        PerfilPersonalActivity.this,
                        mensagem,
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    private void configurarCamera() {
        permissaoCameraLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestPermission(),
                concedida -> {
                    if (concedida) {
                        abrirCamera();
                    } else {
                        Toast.makeText(this, R.string.camera_permission_denied, Toast.LENGTH_SHORT).show();
                    }
                }
        );
        cameraLauncher = registerForActivityResult(
                new ActivityResultContracts.TakePicture(),
                sucesso -> {
                    if (sucesso && arquivoFotoTemporaria != null) {
                        imgFotoPerfilPersonal.setImageURI(Uri.fromFile(arquivoFotoTemporaria));
                        enviarFoto();
                    }
                }
        );
        galeriaLauncher = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (uri != null) {
                        imgFotoPerfilPersonal.setImageURI(uri);
                        enviarFotoDaGaleria(uri);
                    }
                }
        );
        permissaoGaleriaLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestMultiplePermissions(),
                resultado -> {
                    boolean permitido = resultado.containsValue(true);
                    if (permitido) {
                        galeriaLauncher.launch("image/*");
                    } else {
                        Toast.makeText(this, R.string.gallery_permission_denied,
                                Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private void escolherOrigemFoto() {
        // O menu mantém câmera e galeria disponíveis mesmo depois de uma foto cadastrada.
        boolean possuiFoto = !fotoUrlAtual.trim().isEmpty();
        String[] opcoes = possuiFoto
                ? new String[]{
                        getString(R.string.photo_camera),
                        getString(R.string.photo_gallery),
                        getString(R.string.photo_remove)
                }
                : new String[]{
                        getString(R.string.photo_camera),
                        getString(R.string.photo_gallery)
                };
        new AlertDialog.Builder(this)
                .setTitle(R.string.choose_profile_photo)
                .setItems(opcoes, (dialog, opcao) -> {
                    if (opcao == 0) {
                        solicitarFoto();
                    } else if (opcao == 1) {
                        solicitarGaleria();
                    } else {
                        confirmarRemocaoFoto();
                    }
                })
                .setNegativeButton(R.string.action_cancel, null)
                .show();
    }

    private void solicitarGaleria() {
        if (temPermissaoGaleria()) {
            galeriaLauncher.launch("image/*");
            return;
        }

        // O escopo da permissão é escolhido na interface oficial do Android.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            permissaoGaleriaLauncher.launch(new String[]{
                    Manifest.permission.READ_MEDIA_IMAGES,
                    Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED
            });
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissaoGaleriaLauncher.launch(
                    new String[]{Manifest.permission.READ_MEDIA_IMAGES});
        } else {
            permissaoGaleriaLauncher.launch(
                    new String[]{Manifest.permission.READ_EXTERNAL_STORAGE});
        }
    }

    private boolean temPermissaoGaleria() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES)
                    == PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(
                    this, Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED)
                    == PackageManager.PERMISSION_GRANTED;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES)
                    == PackageManager.PERMISSION_GRANTED;
        }
        return ContextCompat.checkSelfPermission(
                this, Manifest.permission.READ_EXTERNAL_STORAGE)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void solicitarFoto() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            abrirCamera();
        } else {
            permissaoCameraLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void abrirCamera() {
        try {
            File pasta = new File(getCacheDir(), "profile_photos");
            if (!pasta.exists() && !pasta.mkdirs()) {
                throw new IOException("Não foi possível criar a pasta temporária");
            }
            arquivoFotoTemporaria = File.createTempFile("personal_", ".jpg", pasta);
            Uri uri = FileProvider.getUriForFile(
                    this,
                    getPackageName() + ".fileprovider",
                    arquivoFotoTemporaria
            );
            cameraLauncher.launch(uri);
        } catch (IOException e) {
            Toast.makeText(this, R.string.photo_error, Toast.LENGTH_SHORT).show();
        }
    }

    private void enviarFoto() {
        alterarEstadoFoto(true);
        FotoPerfilUtils.prepararParaUpload(arquivoFotoTemporaria, imgFotoPerfilPersonal,
                new FotoPerfilUtils.PreparacaoCallback() {
                    @Override
                    public void onSucesso(byte[] imagem) {
                        supabaseClient.salvarFotoPerfil("personal", idPersonal, imagem,
                                new SupabaseClient.FotoPerfilCallback() {
                                    @Override
                                    public void onSucesso(String fotoUrl) {
                                        alterarEstadoFoto(false);
                                        fotoUrlAtual = fotoUrl;
                                        FotoPerfilUtils.carregar(imgFotoPerfilPersonal, fotoUrl);
                                        Toast.makeText(PerfilPersonalActivity.this,
                                                R.string.photo_saved, Toast.LENGTH_SHORT).show();
                                    }

                                    @Override
                                    public void onErro(String mensagem) {
                                        alterarEstadoFoto(false);
                                        Toast.makeText(PerfilPersonalActivity.this,
                                                mensagem, Toast.LENGTH_SHORT).show();
                                        carregarPerfil();
                                    }
                                });
                    }

                    @Override
                    public void onErro() {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilPersonalActivity.this,
                                R.string.photo_error, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void enviarFotoDaGaleria(Uri uri) {
        alterarEstadoFoto(true);
        FotoPerfilUtils.prepararParaUpload(this, uri, imgFotoPerfilPersonal,
                new FotoPerfilUtils.PreparacaoCallback() {
                    @Override
                    public void onSucesso(byte[] imagem) {
                        salvarImagemPreparada(imagem);
                    }

                    @Override
                    public void onErro() {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilPersonalActivity.this,
                                R.string.photo_error, Toast.LENGTH_SHORT).show();
                        carregarPerfil();
                    }
                });
    }

    private void salvarImagemPreparada(byte[] imagem) {
        supabaseClient.salvarFotoPerfil("personal", idPersonal, imagem,
                new SupabaseClient.FotoPerfilCallback() {
                    @Override
                    public void onSucesso(String fotoUrl) {
                        alterarEstadoFoto(false);
                        fotoUrlAtual = fotoUrl;
                        FotoPerfilUtils.carregar(imgFotoPerfilPersonal, fotoUrl);
                        Toast.makeText(PerfilPersonalActivity.this,
                                R.string.photo_saved, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilPersonalActivity.this,
                                mensagem, Toast.LENGTH_SHORT).show();
                        carregarPerfil();
                    }
                });
    }

    private void confirmarRemocaoFoto() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.remove_profile_photo_title)
                .setMessage(R.string.remove_profile_photo_message)
                .setPositiveButton(R.string.photo_remove, (dialog, which) -> removerFoto())
                .setNegativeButton(R.string.action_cancel, null)
                .show();
    }

    private void removerFoto() {
        alterarEstadoFoto(true);
        supabaseClient.removerFotoPerfil("personal", idPersonal, fotoUrlAtual,
                new SupabaseClient.CadastroCallback() {
                    @Override
                    public void onSucesso() {
                        alterarEstadoFoto(false);
                        fotoUrlAtual = "";
                        imgFotoPerfilPersonal.setImageResource(R.drawable.guerreiro);
                        Toast.makeText(PerfilPersonalActivity.this,
                                R.string.photo_removed, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilPersonalActivity.this,
                                R.string.photo_remove_error, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void alterarEstadoFoto(boolean enviando) {
        btnAlterarFotoPerfilPersonal.setEnabled(!enviando);
        btnSalvarPerfilPersonal.setEnabled(!enviando);
        progressFotoPerfilPersonal.setVisibility(
                enviando ? android.view.View.VISIBLE : android.view.View.GONE);
    }

    private void salvarPerfil() {
        String nome = editPerfilPersonalNome.getText().toString().trim();
        String email = editPerfilPersonalEmail.getText().toString().trim();
        String senha = editPerfilPersonalSenha.getText().toString().trim();
        String cpf = editPerfilPersonalCpf.getText().toString().trim();
        String cref = editPerfilPersonalCref.getText().toString().trim();
        String telefone = editPerfilPersonalTelefone.getText().toString().trim();

        boolean sexo = radioMasculinoPersonalPerfil.isChecked();

        if (TextUtils.isEmpty(nome)) {
            editPerfilPersonalNome.setError(getString(R.string.error_name_mandatory));
            editPerfilPersonalNome.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(email)) {
            editPerfilPersonalEmail.setError(getString(R.string.error_email_mandatory));
            editPerfilPersonalEmail.requestFocus();
            return;
        }

        if (!senha.isEmpty() && senha.length() < 6) {
            editPerfilPersonalSenha.setError(getString(R.string.password_min_length));
            editPerfilPersonalSenha.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(cpf)) {
            editPerfilPersonalCpf.setError(getString(R.string.error_cpf_mandatory));
            editPerfilPersonalCpf.requestFocus();
            return;
        }

        if (!ValidadorCadastro.validarCPF(cpf)) {
            editPerfilPersonalCpf.setError(getString(R.string.error_cpf_invalid));
            editPerfilPersonalCpf.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(cref)) {
            editPerfilPersonalCref.setError(getString(R.string.error_cref_mandatory));
            editPerfilPersonalCref.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(telefone)) {
            editPerfilPersonalTelefone.setError(getString(R.string.error_phone_mandatory));
            editPerfilPersonalTelefone.requestFocus();
            return;
        }

        btnSalvarPerfilPersonal.setEnabled(false);
        btnSalvarPerfilPersonal.setText(R.string.state_saving);

        supabaseClient.atualizarPerfilPersonal(
                idPersonal,
                idLogin,
                nome,
                email,
                senha,
                cpf,
                cref,
                telefone,
                sexo,
                new SupabaseClient.CadastroCallback() {
                    @Override
                    public void onSucesso() {
                        btnSalvarPerfilPersonal.setEnabled(true);
                        btnSalvarPerfilPersonal.setText(R.string.ui_salvar_perfil);

                        Toast.makeText(
                                PerfilPersonalActivity.this,
                                getString(R.string.success_profile_updated),
                                Toast.LENGTH_SHORT
                        ).show();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        btnSalvarPerfilPersonal.setEnabled(true);
                        btnSalvarPerfilPersonal.setText(R.string.ui_salvar_perfil);

                        Log.e("PERFIL_PERSONAL_UPDATE", mensagem);

                        Toast.makeText(
                                PerfilPersonalActivity.this,
                                mensagem,
                                Toast.LENGTH_SHORT
                        ).show();
                    }
                }
        );
    }
}
