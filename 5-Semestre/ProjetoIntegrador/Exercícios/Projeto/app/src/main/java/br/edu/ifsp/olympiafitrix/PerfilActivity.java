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

/** Permite ao aluno consultar e atualizar seus dados, senha e foto de perfil. */
public class PerfilActivity extends BaseActivity {

    private EditText editPerfilNome;
    private EditText editPerfilEmail;
    private EditText editPerfilSenha;
    private EditText editPerfilCpf;
    private EditText editPerfilTelefone;
    private EditText editPerfilIdade;
    private EditText editPerfilPeso;
    private EditText editPerfilAltura;
    private EditText editPerfilTreinosPlanejadosSemana;
    private EditText editPerfilDoenca;
    private EditText editPerfilLesao;

    private RadioButton radioMasculino;
    private RadioButton radioFeminino;

    private Button btnSalvarPerfil;
    private ImageView imgFotoPerfil;
    private ImageButton btnAlterarFotoPerfil;
    private ProgressBar progressFotoPerfil;
    private ActivityResultLauncher<String> permissaoCameraLauncher;
    private ActivityResultLauncher<Uri> cameraLauncher;
    private ActivityResultLauncher<String> galeriaLauncher;
    private ActivityResultLauncher<String[]> permissaoGaleriaLauncher;
    private File arquivoFotoTemporaria;
    private String fotoUrlAtual = "";

    private SupabaseClient supabaseClient;

    private int idAluno;
    private int idLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_perfil);

        supabaseClient = new SupabaseClient(this);

        configurarCamera();

        inicializarComponentes();

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idAluno = prefs.getInt("idUsuario", -1);
        idLogin = prefs.getInt("idLogin", -1);

        if (idAluno == -1 || idLogin == -1) {
            Toast.makeText(this, R.string.error_session_login_again, Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        carregarPerfil();

        btnSalvarPerfil.setOnClickListener(v -> salvarPerfil());
        btnAlterarFotoPerfil.setOnClickListener(v -> escolherOrigemFoto());

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuUsuario);
    }

    private void inicializarComponentes() {
        editPerfilNome = findViewById(R.id.editPerfilNome);
        editPerfilEmail = findViewById(R.id.editPerfilEmail);
        editPerfilSenha = findViewById(R.id.editPerfilSenha);
        editPerfilSenha.setHint(R.string.new_password_optional);
        editPerfilCpf = findViewById(R.id.editPerfilCpf);
        editPerfilTelefone = findViewById(R.id.editPerfilTelefone);
        editPerfilIdade = findViewById(R.id.editPerfilIdade);
        editPerfilPeso = findViewById(R.id.editPerfilPeso);
        editPerfilAltura = findViewById(R.id.editPerfilAltura);
        editPerfilTreinosPlanejadosSemana = findViewById(R.id.editPerfilTreinosPlanejadosSemana);
        editPerfilDoenca = findViewById(R.id.editPerfilDoenca);
        editPerfilLesao = findViewById(R.id.editPerfilLesao);

        radioMasculino = findViewById(R.id.radioMasculino);
        radioFeminino = findViewById(R.id.radioFeminino);

        btnSalvarPerfil = findViewById(R.id.btnSalvarPerfil);
        imgFotoPerfil = findViewById(R.id.imgFotoPerfil);
        btnAlterarFotoPerfil = findViewById(R.id.btnAlterarFotoPerfil);
        progressFotoPerfil = findViewById(R.id.progressFotoPerfil);
    }

    private void carregarPerfil() {
        supabaseClient.buscarPerfilAluno(idAluno, new SupabaseClient.PerfilAlunoCallback() {
            @Override
            public void onSucesso(JSONObject perfil) {
                try {
                    editPerfilNome.setText(perfil.optString("nome"));
                    editPerfilEmail.setText(perfil.optString("email"));
                    // O hash não volta para o aplicativo; vazio significa manter a senha atual.
                    editPerfilSenha.setText(perfil.optString("senha"));
                    editPerfilCpf.setText(perfil.optString("cpf"));
                    editPerfilTelefone.setText(perfil.optString("telefone"));
                    editPerfilIdade.setText(String.valueOf(perfil.optInt("idade")));
                    editPerfilPeso.setText(String.valueOf(perfil.optDouble("peso")));
                    editPerfilAltura.setText(String.valueOf(perfil.optDouble("altura")));
                    editPerfilTreinosPlanejadosSemana.setText(String.valueOf(perfil.optInt("treinos_planejados_semana", 1)));
                    editPerfilDoenca.setText(perfil.optString("doenca"));
                    editPerfilLesao.setText(perfil.optString("lesao"));
                    fotoUrlAtual = perfil.optString("foto_url");
                    FotoPerfilUtils.carregar(imgFotoPerfil, fotoUrlAtual);

                    boolean sexo = perfil.optBoolean("sexo");

                    if (sexo) {
                        radioMasculino.setChecked(true);
                    } else {
                        radioFeminino.setChecked(true);
                    }

                } catch (Exception e) {
                    Log.e("PERFIL", "Erro ao carregar perfil", e);
                    Toast.makeText(
                            PerfilActivity.this,
                            "Erro ao carregar perfil",
                            Toast.LENGTH_SHORT
                    ).show();
                }
            }

            @Override
            public void onErro(String mensagem) {
                Log.e("PERFIL", mensagem);
                Toast.makeText(
                        PerfilActivity.this,
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
                        imgFotoPerfil.setImageURI(Uri.fromFile(arquivoFotoTemporaria));
                        enviarFoto();
                    }
                }
        );
        galeriaLauncher = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (uri != null) {
                        imgFotoPerfil.setImageURI(uri);
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
        // Remover só faz sentido quando existe uma foto persistida no banco.
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

        // No Android 14+, a janela oficial oferece acesso total ou fotos selecionadas.
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
            arquivoFotoTemporaria = File.createTempFile("aluno_", ".jpg", pasta);
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
        FotoPerfilUtils.prepararParaUpload(arquivoFotoTemporaria, imgFotoPerfil,
                new FotoPerfilUtils.PreparacaoCallback() {
                    @Override
                    public void onSucesso(byte[] imagem) {
                        supabaseClient.salvarFotoPerfil("aluno", idAluno, imagem,
                                new SupabaseClient.FotoPerfilCallback() {
                                    @Override
                                    public void onSucesso(String fotoUrl) {
                                        alterarEstadoFoto(false);
                                        fotoUrlAtual = fotoUrl;
                                        FotoPerfilUtils.carregar(imgFotoPerfil, fotoUrl);
                                        Toast.makeText(PerfilActivity.this,
                                                R.string.photo_saved, Toast.LENGTH_SHORT).show();
                                    }

                                    @Override
                                    public void onErro(String mensagem) {
                                        alterarEstadoFoto(false);
                                        Toast.makeText(PerfilActivity.this,
                                                mensagem, Toast.LENGTH_SHORT).show();
                                        carregarPerfil();
                                    }
                                });
                    }

                    @Override
                    public void onErro() {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilActivity.this,
                                R.string.photo_error, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void enviarFotoDaGaleria(Uri uri) {
        alterarEstadoFoto(true);
        FotoPerfilUtils.prepararParaUpload(this, uri, imgFotoPerfil,
                new FotoPerfilUtils.PreparacaoCallback() {
                    @Override
                    public void onSucesso(byte[] imagem) {
                        salvarImagemPreparada(imagem);
                    }

                    @Override
                    public void onErro() {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilActivity.this,
                                R.string.photo_error, Toast.LENGTH_SHORT).show();
                        carregarPerfil();
                    }
                });
    }

    private void salvarImagemPreparada(byte[] imagem) {
        supabaseClient.salvarFotoPerfil("aluno", idAluno, imagem,
                new SupabaseClient.FotoPerfilCallback() {
                    @Override
                    public void onSucesso(String fotoUrl) {
                        alterarEstadoFoto(false);
                        fotoUrlAtual = fotoUrl;
                        FotoPerfilUtils.carregar(imgFotoPerfil, fotoUrl);
                        Toast.makeText(PerfilActivity.this,
                                R.string.photo_saved, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilActivity.this,
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
        supabaseClient.removerFotoPerfil("aluno", idAluno, fotoUrlAtual,
                new SupabaseClient.CadastroCallback() {
                    @Override
                    public void onSucesso() {
                        alterarEstadoFoto(false);
                        fotoUrlAtual = "";
                        imgFotoPerfil.setImageResource(R.drawable.guerreiro);
                        Toast.makeText(PerfilActivity.this,
                                R.string.photo_removed, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        alterarEstadoFoto(false);
                        Toast.makeText(PerfilActivity.this,
                                R.string.photo_remove_error, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void alterarEstadoFoto(boolean enviando) {
        btnAlterarFotoPerfil.setEnabled(!enviando);
        btnSalvarPerfil.setEnabled(!enviando);
        progressFotoPerfil.setVisibility(enviando ? android.view.View.VISIBLE : android.view.View.GONE);
    }

    private void salvarPerfil() {
        String nome = editPerfilNome.getText().toString().trim();
        String email = editPerfilEmail.getText().toString().trim();
        String senha = editPerfilSenha.getText().toString().trim();
        String cpf = editPerfilCpf.getText().toString().trim();
        String telefone = editPerfilTelefone.getText().toString().trim();
        String idadeStr = editPerfilIdade.getText().toString().trim();
        String pesoStr = editPerfilPeso.getText().toString().trim();
        String alturaStr = editPerfilAltura.getText().toString().trim();
        String treinosPlanejadosSemanaStr = editPerfilTreinosPlanejadosSemana.getText().toString().trim();
        String doenca = editPerfilDoenca.getText().toString().trim();
        String lesao = editPerfilLesao.getText().toString().trim();

        boolean sexo = radioMasculino.isChecked();

        if (TextUtils.isEmpty(nome)) {
            editPerfilNome.setError(getString(R.string.error_name_mandatory));
            editPerfilNome.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(email)) {
            editPerfilEmail.setError(getString(R.string.error_email_mandatory));
            editPerfilEmail.requestFocus();
            return;
        }

        if (!senha.isEmpty() && senha.length() < 6) {
            editPerfilSenha.setError(getString(R.string.password_min_length));
            editPerfilSenha.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(cpf)) {
            editPerfilCpf.setError(getString(R.string.error_cpf_mandatory));
            editPerfilCpf.requestFocus();
            return;
        }

        if (!ValidadorCadastro.validarCPF(cpf)) {
            editPerfilCpf.setError(getString(R.string.error_cpf_invalid));
            editPerfilCpf.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(telefone)) {
            editPerfilTelefone.setError(getString(R.string.error_phone_mandatory));
            editPerfilTelefone.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(idadeStr)) {
            editPerfilIdade.setError(getString(R.string.error_age_mandatory));
            editPerfilIdade.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(pesoStr)) {
            editPerfilPeso.setError(getString(R.string.error_weight_mandatory));
            editPerfilPeso.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(alturaStr)) {
            editPerfilAltura.setError(getString(R.string.error_height_mandatory));
            editPerfilAltura.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(treinosPlanejadosSemanaStr)) {
            editPerfilTreinosPlanejadosSemana.setError(getString(R.string.error_training_days_mandatory));
            editPerfilTreinosPlanejadosSemana.requestFocus();
            return;
        }

        int idade;
        int treinosPlanejadosSemana;
        double peso;
        double altura;

        try {
            idade = Integer.parseInt(idadeStr);
            treinosPlanejadosSemana = Integer.parseInt(treinosPlanejadosSemanaStr);
            peso = Double.parseDouble(pesoStr);
            altura = Double.parseDouble(alturaStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, R.string.error_profile_numbers, Toast.LENGTH_SHORT).show();
            return;
        }

        if (idade <= 0) {
            editPerfilIdade.setError(getString(R.string.error_age_invalid));
            editPerfilIdade.requestFocus();
            return;
        }

        if (peso <= 0) {
            editPerfilPeso.setError(getString(R.string.error_weight_invalid));
            editPerfilPeso.requestFocus();
            return;
        }

        if (altura <= 0) {
            editPerfilAltura.setError(getString(R.string.error_height_invalid));
            editPerfilAltura.requestFocus();
            return;
        }

        if (treinosPlanejadosSemana < 1 || treinosPlanejadosSemana > 7) {
            editPerfilTreinosPlanejadosSemana.setError(getString(R.string.error_training_days_range));
            editPerfilTreinosPlanejadosSemana.requestFocus();
            return;
        }

        double alturaEmMetros = altura;

        if (altura > 3) {
            alturaEmMetros = altura / 100.0;
        }

        double imc = peso / (alturaEmMetros * alturaEmMetros);

        btnSalvarPerfil.setEnabled(false);
        btnSalvarPerfil.setText(R.string.state_saving);

        supabaseClient.verificarCpfExisteIgnorandoAluno(
                cpf,
                idAluno,
                new SupabaseClient.VerificacaoCallback() {
                    @Override
                    public void onResultado(boolean existe) {
                        if (existe) {
                            btnSalvarPerfil.setEnabled(true);
                            btnSalvarPerfil.setText(R.string.ui_salvar_perfil);

                            editPerfilCpf.setError(getString(R.string.error_cpf_exists));
                            editPerfilCpf.requestFocus();
                            return;
                        }

                        atualizarPerfil(
                                nome,
                                email,
                                senha,
                                cpf,
                                telefone,
                                idade,
                                peso,
                                altura,
                                imc,
                                doenca,
                                lesao,
                                sexo,
                                treinosPlanejadosSemana
                        );
                    }

                    @Override
                    public void onErro(String mensagem) {
                        btnSalvarPerfil.setEnabled(true);
                        btnSalvarPerfil.setText(R.string.ui_salvar_perfil);

                        Log.e("PERFIL_CPF", mensagem);
                        Toast.makeText(
                                PerfilActivity.this,
                                mensagem,
                                Toast.LENGTH_SHORT
                        ).show();
                    }
                }
        );
    }

    private void atualizarPerfil(
            String nome,
            String email,
            String senha,
            String cpf,
            String telefone,
            int idade,
            double peso,
            double altura,
            double imc,
            String doenca,
            String lesao,
            boolean sexo,
            int treinosPlanejadosSemana
    ) {
        supabaseClient.atualizarPerfilAluno(
                idAluno,
                idLogin,
                nome,
                email,
                senha,
                cpf,
                telefone,
                idade,
                peso,
                altura,
                imc,
                doenca,
                lesao,
                sexo,
                treinosPlanejadosSemana,
                new SupabaseClient.CadastroCallback() {
                    @Override
                    public void onSucesso() {
                        btnSalvarPerfil.setEnabled(true);
                        btnSalvarPerfil.setText(R.string.ui_salvar_perfil);

                        Toast.makeText(
                                PerfilActivity.this,
                                getString(R.string.success_profile_updated),
                                Toast.LENGTH_SHORT
                        ).show();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        btnSalvarPerfil.setEnabled(true);
                        btnSalvarPerfil.setText(R.string.ui_salvar_perfil);

                        Log.e("PERFIL_UPDATE", mensagem);
                        Toast.makeText(
                                PerfilActivity.this,
                                "Erro ao atualizar perfil.",
                                Toast.LENGTH_SHORT
                        ).show();
                    }
                }
        );
    }
}
