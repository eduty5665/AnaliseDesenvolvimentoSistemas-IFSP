package br.edu.ifsp.olympiafitrix;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.ImageView;
import android.widget.Toast;

import org.json.JSONObject;

import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;

public class DetalheAlunoPersonalActivity extends BaseActivity {

    private TextView txtNomeAlunoDetalhe;
    private TextView txtCpfAlunoDetalhe;
    private TextView txtTelefoneAlunoDetalhe;
    private TextView txtSexoAlunoDetalhe;
    private TextView txtIdadeAlunoDetalhe;
    private TextView txtPesoAlunoDetalhe;
    private TextView txtAlturaAlunoDetalhe;
    private TextView txtImcAlunoDetalhe;
    private TextView txtScoreAlunoDetalhe;
    private TextView txtDoencaAlunoDetalhe;
    private TextView txtLesaoAlunoDetalhe;
    private ImageView imgFotoAlunoDetalhe;

    private Button btnDesvincularAluno;
    private Button btnVoltarDetalheAluno;

    private SupabaseClient supabaseClient;

    private int idAluno;
    private int idPersonal;
    private boolean vinculado;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detalhe_aluno_personal);

        supabaseClient = new SupabaseClient(this);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idPersonal = prefs.getInt("idUsuario", -1);

        idAluno = getIntent().getIntExtra("id_aluno", -1);
        vinculado = getIntent().getBooleanExtra("vinculado", false);

        inicializarComponentes();

        if (vinculado) {
            btnDesvincularAluno.setVisibility(View.VISIBLE);
        }


        btnVoltarDetalheAluno.setOnClickListener(v -> finish());

        btnDesvincularAluno.setOnClickListener(v -> desvincularAluno());
    }

    private void inicializarComponentes() {
        txtNomeAlunoDetalhe = findViewById(R.id.txtNomeAlunoDetalhe);
        txtCpfAlunoDetalhe = findViewById(R.id.txtCpfAlunoDetalhe);
        txtTelefoneAlunoDetalhe = findViewById(R.id.txtTelefoneAlunoDetalhe);
        txtSexoAlunoDetalhe = findViewById(R.id.txtSexoAlunoDetalhe);
        txtIdadeAlunoDetalhe = findViewById(R.id.txtIdadeAlunoDetalhe);
        txtPesoAlunoDetalhe = findViewById(R.id.txtPesoAlunoDetalhe);
        txtAlturaAlunoDetalhe = findViewById(R.id.txtAlturaAlunoDetalhe);
        txtImcAlunoDetalhe = findViewById(R.id.txtImcAlunoDetalhe);
        txtScoreAlunoDetalhe = findViewById(R.id.txtScoreAlunoDetalhe);
        txtDoencaAlunoDetalhe = findViewById(R.id.txtDoencaAlunoDetalhe);
        txtLesaoAlunoDetalhe = findViewById(R.id.txtLesaoAlunoDetalhe);
        imgFotoAlunoDetalhe = findViewById(R.id.imgFotoAlunoDetalhe);

        btnDesvincularAluno = findViewById(R.id.btnDesvincularAluno);
        btnVoltarDetalheAluno = findViewById(R.id.btnVoltarDetalheAluno);
    }

    private void carregarAluno() {
        supabaseClient.buscarDetalheAlunoPersonal(idAluno, new SupabaseClient.DetalheAlunoCallback() {
            @Override
            public void onSucesso(JSONObject aluno) {
                txtNomeAlunoDetalhe.setText(aluno.optString("nome"));
                txtCpfAlunoDetalhe.setText(getString(R.string.cpf_value, aluno.optString("cpf")));
                txtTelefoneAlunoDetalhe.setText(getString(R.string.phone_value, aluno.optString("telefone")));
                txtSexoAlunoDetalhe.setText(getString(
                        R.string.gender_value,
                        getString(aluno.optBoolean("sexo")
                                ? R.string.gender_male : R.string.gender_female)));
                txtIdadeAlunoDetalhe.setText(getString(R.string.age_value, aluno.optInt("idade")));
                txtPesoAlunoDetalhe.setText(getString(
                        R.string.weight_value, String.valueOf(aluno.optDouble("peso"))));
                txtAlturaAlunoDetalhe.setText(getString(
                        R.string.height_value, String.valueOf(aluno.optDouble("altura"))));
                txtImcAlunoDetalhe.setText(getString(
                        R.string.bmi_value, String.valueOf(aluno.optDouble("imc"))));
                txtScoreAlunoDetalhe.setText(getString(
                        R.string.score_label_value, String.valueOf(aluno.optInt("score"))));
                txtDoencaAlunoDetalhe.setText(getString(
                        R.string.condition_value, aluno.optString("doenca")));
                txtLesaoAlunoDetalhe.setText(getString(
                        R.string.injury_value, aluno.optString("lesao")));
                FotoPerfilUtils.carregar(imgFotoAlunoDetalhe, aluno.optString("foto_url"));
            }

            @Override
            public void onErro(String mensagem) {
                Toast.makeText(DetalheAlunoPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void desvincularAluno() {
        supabaseClient.desvincularAlunoDoPersonal(idAluno, idPersonal, new SupabaseClient.CadastroCallback() {
            @Override
            public void onSucesso() {
                Toast.makeText(
                        DetalheAlunoPersonalActivity.this,
                        "Aluno desvinculado.",
                        Toast.LENGTH_SHORT
                ).show();

                finish();
            }

            @Override
            public void onErro(String mensagem) {
                Toast.makeText(
                        DetalheAlunoPersonalActivity.this,
                        mensagem,
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "workout_finished".equals(tipo)) {
            carregarAluno();
        }
    }
}
