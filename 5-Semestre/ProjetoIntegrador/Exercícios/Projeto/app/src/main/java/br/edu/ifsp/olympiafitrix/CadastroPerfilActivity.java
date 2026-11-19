package br.edu.ifsp.olympiafitrix;

import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.Toast;

import br.edu.ifsp.olympiafitrix.util.ValidadorCadastro;
import android.content.Intent;


import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

/** Coleta os dados específicos e conclui o cadastro de aluno ou personal. */
public class CadastroPerfilActivity extends BaseActivity {

    private Button btnSelecionarAluno, btnSelecionarPersonal;
    private LinearLayout layoutCamposAlunoParte1, layoutCamposAlunoParte2, layoutCamposPersonal;

    private EditText editNomeAluno, editCpfAluno, editTelefoneAluno;
    private EditText editDoencaAluno, editLesaoAluno, editIdadeAluno, editPesoAluno, editAlturaAluno;
    private EditText editTreinosPlanejadosSemanaAluno;

    private EditText editNomePersonal, editCpfPersonal, editTelefonePersonal, editCrmPersonal;

    private RadioButton radioMasculinoAluno, radioMasculinoPersonal;

    private Button btnProximaEtapaAluno, btnFinalizarAluno, btnVoltarAluno, btnFinalizarPersonal;

    private String tipoPerfil = "";
    private SupabaseClient supabaseClient;
    private View cardCampos;
    private View tituloSelecao;
    private boolean tecladoVisivel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cadastro_perfil);

        supabaseClient = new SupabaseClient(this);

        iniciarComponentes();
        configurarCliques();
        configurarDeslocamentoDoCardComTeclado();
        selecionarAluno();
    }

    private void iniciarComponentes() {
        btnSelecionarAluno = findViewById(R.id.btnSelecionarAluno);
        btnSelecionarPersonal = findViewById(R.id.btnSelecionarPersonal);
        cardCampos = findViewById(R.id.cardCampos);
        tituloSelecao = findViewById(R.id.txtTituloSelecao);

        layoutCamposAlunoParte1 = findViewById(R.id.layoutCamposAlunoParte1);
        layoutCamposAlunoParte2 = findViewById(R.id.layoutCamposAlunoParte2);
        layoutCamposPersonal = findViewById(R.id.layoutCamposPersonal);

        editNomeAluno = findViewById(R.id.editNomeAluno);
        editCpfAluno = findViewById(R.id.editCpfAluno);
        editTelefoneAluno = findViewById(R.id.editTelefoneAluno);
        editDoencaAluno = findViewById(R.id.editDoencaAluno);
        editLesaoAluno = findViewById(R.id.editLesaoAluno);
        editIdadeAluno = findViewById(R.id.editIdadeAluno);
        editPesoAluno = findViewById(R.id.editPesoAluno);
        editAlturaAluno = findViewById(R.id.editAlturaAluno);
        editTreinosPlanejadosSemanaAluno = findViewById(R.id.editTreinosPlanejadosSemanaAluno);

        editNomePersonal = findViewById(R.id.editNomePersonal);
        editCpfPersonal = findViewById(R.id.editCpfPersonal);
        editTelefonePersonal = findViewById(R.id.editTelefonePersonal);
        editCrmPersonal = findViewById(R.id.editCrmPersonal);

        radioMasculinoAluno = findViewById(R.id.radioMasculinoAluno);
        radioMasculinoPersonal = findViewById(R.id.radioMasculinoPersonal);

        btnProximaEtapaAluno = findViewById(R.id.btnProximaEtapaAluno);
        btnFinalizarAluno = findViewById(R.id.btnFinalizarAluno);
        btnVoltarAluno = findViewById(R.id.btnVoltarAluno);
        btnFinalizarPersonal = findViewById(R.id.btnFinalizarPersonal);
    }

    private void configurarDeslocamentoDoCardComTeclado() {
        View conteudo = findViewById(android.R.id.content);
        View.OnFocusChangeListener atualizarAoMudarFoco =
                (view, possuiFoco) -> ViewCompat.requestApplyInsets(conteudo);

        editAlturaAluno.setOnFocusChangeListener(atualizarAoMudarFoco);
        editTreinosPlanejadosSemanaAluno.setOnFocusChangeListener(atualizarAoMudarFoco);
        editCrmPersonal.setOnFocusChangeListener(atualizarAoMudarFoco);

        ViewCompat.setOnApplyWindowInsetsListener(conteudo, (view, insets) -> {
            tecladoVisivel = insets.isVisible(WindowInsetsCompat.Type.ime());
            atualizarPosicaoCard();
            return insets;
        });
        ViewCompat.requestApplyInsets(conteudo);
    }

    private void atualizarPosicaoCard() {
        boolean campoInferiorSelecionado =
                editAlturaAluno.hasFocus()
                        || editTreinosPlanejadosSemanaAluno.hasFocus()
                        || editCrmPersonal.hasFocus();

        float deslocamento = tecladoVisivel && campoInferiorSelecionado
                ? -converterDpParaPixel(110)
                : 0;

        cardCampos.animate()
                .translationY(deslocamento)
                .setDuration(180)
                .start();

        tituloSelecao.animate()
                .translationY(deslocamento)
                .setDuration(180)
                .start();
    }

    private float converterDpParaPixel(int valorDp) {
        return valorDp * getResources().getDisplayMetrics().density;
    }

    private void configurarCliques() {
        btnSelecionarAluno.setOnClickListener(v -> selecionarAluno());
        btnSelecionarPersonal.setOnClickListener(v -> selecionarPersonal());

        btnProximaEtapaAluno.setOnClickListener(v -> {
            if (validarAlunoParte1()) {
                layoutCamposAlunoParte1.setVisibility(View.GONE);
                layoutCamposAlunoParte2.setVisibility(View.VISIBLE);
            }
        });

        btnVoltarAluno.setOnClickListener(v -> {
            layoutCamposAlunoParte2.setVisibility(View.GONE);
            layoutCamposAlunoParte1.setVisibility(View.VISIBLE);
        });

        btnFinalizarAluno.setOnClickListener(v -> {
            if (validarAlunoParte2()) {
                verificarCpfAlunoAntesDeCadastrar();
            }
        });

        btnFinalizarPersonal.setOnClickListener(v -> {
            if (validarPersonal()) {
                verificarCpfECrefPersonalAntesDeCadastrar();
            }
        });
    }

    private void selecionarAluno() {
        tipoPerfil = "aluno";

        btnSelecionarAluno.setBackgroundColor(Color.WHITE);
        btnSelecionarAluno.setTextColor(Color.BLACK);

        btnSelecionarPersonal.setBackgroundColor(Color.TRANSPARENT);
        btnSelecionarPersonal.setTextColor(Color.WHITE);

        layoutCamposAlunoParte1.setVisibility(View.VISIBLE);
        layoutCamposAlunoParte2.setVisibility(View.GONE);
        layoutCamposPersonal.setVisibility(View.GONE);
    }

    private void selecionarPersonal() {
        tipoPerfil = "personal";

        btnSelecionarPersonal.setBackgroundColor(Color.WHITE);
        btnSelecionarPersonal.setTextColor(Color.BLACK);

        btnSelecionarAluno.setBackgroundColor(Color.TRANSPARENT);
        btnSelecionarAluno.setTextColor(Color.WHITE);

        layoutCamposAlunoParte1.setVisibility(View.GONE);
        layoutCamposAlunoParte2.setVisibility(View.GONE);
        layoutCamposPersonal.setVisibility(View.VISIBLE);
    }

    private void cadastrarPersonalNoBanco() {
        SharedPreferences preferences = getSharedPreferences("cadastro_temp", MODE_PRIVATE);

        String email = preferences.getString("email", "");
        String senha = preferences.getString("senha", "");

        btnFinalizarPersonal.setEnabled(false);
        btnFinalizarPersonal.setText(R.string.state_saving);

        supabaseClient.cadastrarPersonal(
                email,
                senha,
                editNomePersonal.getText().toString().trim(),
                editCpfPersonal.getText().toString().trim(),
                editCrmPersonal.getText().toString().trim(),
                editTelefonePersonal.getText().toString().trim(),
                radioMasculinoPersonal.isChecked(),
                new SupabaseClient.CadastroCallback() {
                    @Override
                    public void onSucesso() {

                        Toast.makeText(
                                CadastroPerfilActivity.this,
                                getString(R.string.success_trainer_registration),
                                Toast.LENGTH_SHORT
                        ).show();

                        limparDadosTemporarios();

                        Intent intent = new Intent(
                                CadastroPerfilActivity.this,
                                MainActivity.class
                        );

                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);

                        startActivity(intent);
                        finish();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        btnFinalizarPersonal.setEnabled(true);
                        btnFinalizarPersonal.setText(R.string.ui_finalizar_cadastro);
                        Toast.makeText(CadastroPerfilActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private void cadastrarAlunoNoBanco() {
        SharedPreferences preferences = getSharedPreferences("cadastro_temp", MODE_PRIVATE);

        String email = preferences.getString("email", "");
        String senha = preferences.getString("senha", "");

        double altura = Double.parseDouble(editAlturaAluno.getText().toString().trim());

        if (altura > 3) {
            altura = altura / 100.0;
        }

        btnFinalizarAluno.setEnabled(false);
        btnFinalizarAluno.setText(R.string.state_saving);

        supabaseClient.cadastrarAluno(
                email,
                senha,
                editNomeAluno.getText().toString().trim(),
                editCpfAluno.getText().toString().trim(),
                editTelefoneAluno.getText().toString().trim(),
                radioMasculinoAluno.isChecked(),
                editDoencaAluno.getText().toString().trim(),
                editLesaoAluno.getText().toString().trim(),
                Integer.parseInt(editIdadeAluno.getText().toString().trim()),
                Double.parseDouble(editPesoAluno.getText().toString().trim()),
                altura,
                Integer.parseInt(editTreinosPlanejadosSemanaAluno.getText().toString().trim()),
                new SupabaseClient.CadastroCallback() {
                    @Override
                    public void onSucesso() {

                        Toast.makeText(
                                CadastroPerfilActivity.this,
                                getString(R.string.success_student_registration),
                                Toast.LENGTH_SHORT
                        ).show();

                        limparDadosTemporarios();

                        Intent intent = new Intent(
                                CadastroPerfilActivity.this,
                                MainActivity.class
                        );

                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);

                        startActivity(intent);
                        finish();
                    }

                    @Override
                    public void onErro(String mensagem) {
                        btnFinalizarAluno.setEnabled(true);
                        btnFinalizarAluno.setText(R.string.ui_finalizar_cadastro);
                        Toast.makeText(CadastroPerfilActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private boolean validarAlunoParte1() {
        if (editNomeAluno.getText().toString().trim().isEmpty()) {
            editNomeAluno.setError(getString(R.string.error_name_required));
            return false;
        }

        if (editCpfAluno.getText().toString().trim().isEmpty()) {
            editCpfAluno.setError(getString(R.string.error_cpf_required));
            return false;
        }

        String cpfAluno = ValidadorCadastro.limparCPF(editCpfAluno.getText().toString().trim());

        if (!ValidadorCadastro.validarCPF(cpfAluno)) {
            editCpfAluno.setError(getString(R.string.error_cpf_invalid));
            editCpfAluno.requestFocus();
            return false;
        }

        if (editTelefoneAluno.getText().toString().trim().isEmpty()) {
            editTelefoneAluno.setError(getString(R.string.error_phone_required));
            return false;
        }

        return true;
    }

    private boolean validarAlunoParte2() {
        if (editIdadeAluno.getText().toString().trim().isEmpty()) {
            editIdadeAluno.setError(getString(R.string.error_age_required));
            return false;
        }

        if (editPesoAluno.getText().toString().trim().isEmpty()) {
            editPesoAluno.setError(getString(R.string.error_weight_required));
            return false;
        }

        if (editAlturaAluno.getText().toString().trim().isEmpty()) {
            editAlturaAluno.setError(getString(R.string.error_height_required));
            return false;
        }

        String treinosSemana = editTreinosPlanejadosSemanaAluno.getText().toString().trim();
        if (treinosSemana.isEmpty()) {
            editTreinosPlanejadosSemanaAluno.setError(getString(R.string.error_training_days_required));
            return false;
        }

        try {
            int valor = Integer.parseInt(treinosSemana);
            if (valor < 1 || valor > 7) {
                editTreinosPlanejadosSemanaAluno.setError(getString(R.string.error_training_days_range));
                return false;
            }
        } catch (NumberFormatException e) {
            editTreinosPlanejadosSemanaAluno.setError(getString(R.string.error_invalid_number));
            return false;
        }

        return true;
    }

    private boolean validarPersonal() {
        if (editNomePersonal.getText().toString().trim().isEmpty()) {
            editNomePersonal.setError(getString(R.string.error_name_required));
            return false;
        }

        if (editCpfPersonal.getText().toString().trim().isEmpty()) {
            editCpfPersonal.setError(getString(R.string.error_cpf_required));
            return false;
        }

        String cpfPersonal = ValidadorCadastro.limparCPF(editCpfPersonal.getText().toString().trim());

        if (!ValidadorCadastro.validarCPF(cpfPersonal)) {
            editCpfPersonal.setError(getString(R.string.error_cpf_invalid));
            editCpfPersonal.requestFocus();
            return false;
        }

        if (editTelefonePersonal.getText().toString().trim().isEmpty()) {
            editTelefonePersonal.setError(getString(R.string.error_phone_required));
            return false;
        }

        if (editCrmPersonal.getText().toString().trim().isEmpty()) {
            editCrmPersonal.setError(getString(R.string.error_cref_required));
            return false;
        }

        String cref = editCrmPersonal.getText().toString().trim();

        if (!ValidadorCadastro.validarCREF(cref)) {
            editCrmPersonal.setError(getString(R.string.error_cref_invalid));
            editCrmPersonal.requestFocus();
            return false;
        }

        return true;
    }

    private void verificarCpfAlunoAntesDeCadastrar() {
        String cpf = ValidadorCadastro.limparCPF(editCpfAluno.getText().toString().trim());

        btnFinalizarAluno.setEnabled(false);
        btnFinalizarAluno.setText(R.string.state_checking);

        supabaseClient.verificarCpfExiste(cpf, new SupabaseClient.VerificacaoCallback() {
            @Override
            public void onResultado(boolean existe) {
                if (existe) {
                    btnFinalizarAluno.setEnabled(true);
                    btnFinalizarAluno.setText(R.string.ui_finalizar_cadastro);
                    editCpfAluno.setError(getString(R.string.error_cpf_exists));
                    Toast.makeText(CadastroPerfilActivity.this, "Este CPF já está cadastrado.", Toast.LENGTH_SHORT).show();
                } else {
                    cadastrarAlunoNoBanco();
                }
            }

            @Override
            public void onErro(String mensagem) {
                btnFinalizarAluno.setEnabled(true);
                btnFinalizarAluno.setText(R.string.ui_finalizar_cadastro);
                Toast.makeText(CadastroPerfilActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void verificarCpfECrefPersonalAntesDeCadastrar() {
        String cpf = ValidadorCadastro.limparCPF(editCpfPersonal.getText().toString().trim());
        String cref = editCrmPersonal.getText().toString().trim();

        btnFinalizarPersonal.setEnabled(false);
        btnFinalizarPersonal.setText(R.string.state_checking);

        supabaseClient.verificarCpfExiste(cpf, new SupabaseClient.VerificacaoCallback() {
            @Override
            public void onResultado(boolean cpfExiste) {
                if (cpfExiste) {
                    btnFinalizarPersonal.setEnabled(true);
                    btnFinalizarPersonal.setText(R.string.ui_finalizar_cadastro);
                    editCpfPersonal.setError(getString(R.string.error_cpf_exists));
                    Toast.makeText(CadastroPerfilActivity.this, "Este CPF já está cadastrado.", Toast.LENGTH_SHORT).show();
                } else {
                    verificarCrefAntesDeCadastrar(cref);
                }
            }

            @Override
            public void onErro(String mensagem) {
                btnFinalizarPersonal.setEnabled(true);
                btnFinalizarPersonal.setText(R.string.ui_finalizar_cadastro);
                Toast.makeText(CadastroPerfilActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void verificarCrefAntesDeCadastrar(String cref) {
        supabaseClient.verificarCrefExiste(cref, new SupabaseClient.VerificacaoCallback() {
            @Override
            public void onResultado(boolean crefExiste) {
                if (crefExiste) {
                    btnFinalizarPersonal.setEnabled(true);
                    btnFinalizarPersonal.setText(R.string.ui_finalizar_cadastro);
                    editCrmPersonal.setError(getString(R.string.error_cref_exists));
                    Toast.makeText(CadastroPerfilActivity.this, "Este CREF já está cadastrado.", Toast.LENGTH_SHORT).show();
                } else {
                    cadastrarPersonalNoBanco();
                }
            }

            @Override
            public void onErro(String mensagem) {
                btnFinalizarPersonal.setEnabled(true);
                btnFinalizarPersonal.setText(R.string.ui_finalizar_cadastro);
                Toast.makeText(CadastroPerfilActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void limparDadosTemporarios() {

        SharedPreferences preferences =
                getSharedPreferences("cadastro_temp", MODE_PRIVATE);

        SharedPreferences.Editor editor = preferences.edit();

        editor.clear();
        editor.apply();
    }
}
