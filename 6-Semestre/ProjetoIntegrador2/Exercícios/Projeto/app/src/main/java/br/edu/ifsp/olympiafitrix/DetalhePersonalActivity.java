package br.edu.ifsp.olympiafitrix;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;

public class DetalhePersonalActivity extends LocalizedActivity {

    private TextView txtNomeDetalhePersonal;
    private TextView txtCrefDetalhePersonal;
    private TextView txtTelefoneDetalhePersonal;
    private TextView txtCpfDetalhePersonal;
    private ImageView imgFotoDetalhePersonal;

    private Button btnAcaoVinculo;
    private Button btnVoltarDetalhePersonal;

    private SupabaseClient supabaseClient;

    private int idAluno;
    private int idPersonal;
    private int idPersonalAtual;
    private boolean personalVinculado;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detalhe_personal);

        supabaseClient = new SupabaseClient(this);

        txtNomeDetalhePersonal = findViewById(R.id.txtNomeDetalhePersonal);
        txtCrefDetalhePersonal = findViewById(R.id.txtCrefDetalhePersonal);
        txtTelefoneDetalhePersonal = findViewById(R.id.txtTelefoneDetalhePersonal);
        txtCpfDetalhePersonal = findViewById(R.id.txtCpfDetalhePersonal);
        imgFotoDetalhePersonal = findViewById(R.id.imgFotoDetalhePersonal);
        btnAcaoVinculo = findViewById(R.id.btnAcaoVinculo);
        btnVoltarDetalhePersonal = findViewById(R.id.btnVoltarDetalhePersonal);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idAluno = prefs.getInt("idUsuario", -1);
        idPersonalAtual = prefs.getInt("idPersonal", 1);

        idPersonal = getIntent().getIntExtra("id_personal", -1);
        personalVinculado = getIntent().getBooleanExtra("personal_vinculado", false);

        if (idAluno == -1 || idPersonal == -1) {
            Toast.makeText(this, "Erro ao abrir perfil do personal.", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        configurarBotao();

        carregarDadosPersonal();

        btnVoltarDetalhePersonal.setOnClickListener(v -> finish());
    }

    private void configurarBotao() {
        if (personalVinculado || idPersonal == idPersonalAtual) {
            btnAcaoVinculo.setText(R.string.action_disconnect);
            btnAcaoVinculo.setOnClickListener(v -> confirmarDesvinculo());
        } else {
            btnAcaoVinculo.setText(R.string.action_request_connection);
            btnAcaoVinculo.setOnClickListener(v -> solicitarVinculo());
        }
    }

    private void confirmarDesvinculo() {
        new AlertDialog.Builder(this)
                .setTitle(R.string.dialog_disconnect_trainer_title)
                .setMessage(R.string.dialog_disconnect_trainer_message)
                .setPositiveButton(R.string.action_yes, (dialog, which) -> desvincularPersonal())
                .setNegativeButton(R.string.action_cancel, null)
                .show();
    }

    private void carregarDadosPersonal() {
        supabaseClient.buscarDetalhePersonal(idPersonal, new SupabaseClient.DetalhePersonalCallback() {
            @Override
            public void onSucesso(JSONObject personal) {
                txtNomeDetalhePersonal.setText(personal.optString("nome"));
                txtCrefDetalhePersonal.setText(getString(R.string.cref_value, personal.optString("cref")));
                txtTelefoneDetalhePersonal.setText(getString(R.string.phone_value, personal.optString("telefone")));
                txtCpfDetalhePersonal.setText(getString(R.string.cpf_value, personal.optString("cpf")));
                FotoPerfilUtils.carregar(imgFotoDetalhePersonal, personal.optString("foto_url"));
            }

            @Override
            public void onErro(String mensagem) {
                Log.e("DETALHE_PERSONAL", mensagem);
                Toast.makeText(
                        DetalhePersonalActivity.this,
                        mensagem,
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    private void solicitarVinculo() {
        btnAcaoVinculo.setEnabled(false);
        btnAcaoVinculo.setText(R.string.state_sending);

        supabaseClient.solicitarVinculo(idAluno, idPersonal, new SupabaseClient.CadastroCallback() {
            @Override
            public void onSucesso() {
                btnAcaoVinculo.setEnabled(true);
                btnAcaoVinculo.setText(R.string.state_request_sent);

                Toast.makeText(
                        DetalhePersonalActivity.this,
                        "Solicitação enviada ao personal.",
                        Toast.LENGTH_SHORT
                ).show();
            }

            @Override
            public void onErro(String mensagem) {
                btnAcaoVinculo.setEnabled(true);
                btnAcaoVinculo.setText(R.string.action_request_connection);

                Log.e("SOLICITAR_VINCULO", mensagem);

                Toast.makeText(
                        DetalhePersonalActivity.this,
                        mensagem,
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    private void desvincularPersonal() {
        btnAcaoVinculo.setEnabled(false);
        btnAcaoVinculo.setText(R.string.state_disconnecting);

        supabaseClient.desvincularPersonal(idAluno, idPersonal, new SupabaseClient.CadastroCallback() {
            @Override
            public void onSucesso() {
                SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
                prefs.edit().putInt("idPersonal", 1).apply();

                Toast.makeText(
                        DetalhePersonalActivity.this,
                        "Personal desvinculado.",
                        Toast.LENGTH_SHORT
                ).show();

                finish();
            }

            @Override
            public void onErro(String mensagem) {
                btnAcaoVinculo.setEnabled(true);
                btnAcaoVinculo.setText(R.string.action_disconnect);

                Log.e("DESVINCULAR", mensagem);

                Toast.makeText(
                        DetalhePersonalActivity.this,
                        mensagem,
                        Toast.LENGTH_SHORT
                ).show();
            }
        });
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "link_response".equals(tipo)) {
            atualizarVinculoAluno(() -> {
                idPersonalAtual = getSharedPreferences("sessao", MODE_PRIVATE).getInt("idPersonal", 1);
                personalVinculado = idPersonal == idPersonalAtual;
                configurarBotao();
            });
        }
    }
}
