package br.edu.ifsp.olympiafitrix;

import android.os.Bundle;
import android.content.SharedPreferences;
import android.content.Intent;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.slider.Slider;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.adapter.ExercicioAdapter;
import br.edu.ifsp.olympiafitrix.model.Exercicio;
import br.edu.ifsp.olympiafitrix.model.Treino;
import br.edu.ifsp.olympiafitrix.util.TextoDominio;

/** Executa ou consulta um treino e registra o resultado somente após a confirmação do aluno. */
public class ExecucaoTreinoActivity extends LocalizedActivity implements ExercicioAdapter.OnExercicioActionListener {

    private RecyclerView rvExercicios;
    private ExercicioAdapter adapter;
    private List<Exercicio> listaExercicios;
    private Treino treino;
    private Slider sliderDificuldade;
    private TextInputEditText editObservacoes;
    private TextView txtNivel;
    private Button btnFinalizar;
    private ProgressBar progressFinalizarTreino;
    private boolean dificuldadeInformada = false;
    private boolean isDetail = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_execucao_treino);

        treino = (Treino) getIntent().getSerializableExtra("treino");
        isDetail = getIntent().getBooleanExtra("isDetail", false);

        if (treino == null) {
            listaExercicios = new ArrayList<>();
        } else {
            listaExercicios = treino.getListaExercicios() != null ? treino.getListaExercicios() : new ArrayList<>();
        }

        TextView txtTitulo = findViewById(R.id.txtTituloExecucao);
        txtNivel = findViewById(R.id.txtNivelExecucao);
        if (treino != null) {
            txtTitulo.setText(treino.getNome());
            String nivel = treino.getNivel() != null
                    ? TextoDominio.nivel(this, treino.getNivel()).toUpperCase()
                    : getString(R.string.level_not_defined);
            txtNivel.setText(getString(R.string.level_execution_value, nivel));
        }

        ImageButton btnVoltar = findViewById(R.id.btnVoltarExecucao);
        btnVoltar.setOnClickListener(v -> finish());

        rvExercicios = findViewById(R.id.rvExerciciosExecucao);
        adapter = new ExercicioAdapter(listaExercicios, this);
        adapter.setReadOnly(true);
        
        rvExercicios.setLayoutManager(new LinearLayoutManager(this));
        rvExercicios.setAdapter(adapter);

        sliderDificuldade = findViewById(R.id.sliderDificuldade);
        editObservacoes = findViewById(R.id.editObservacoesExecucao);
        btnFinalizar = findViewById(R.id.btnFinalizarTreino);
        btnFinalizar.setText(R.string.action_save);
        progressFinalizarTreino = findViewById(R.id.progressFinalizarTreino);

        if (isDetail) {
            setupDetailMode();
        } else {
            setupExecutionMode();
        }
    }

    private void setupDetailMode() {
        btnFinalizar.setVisibility(View.GONE);
        sliderDificuldade.setEnabled(false);
        editObservacoes.setEnabled(false);
        editObservacoes.setFocusable(false);
        
        TextView txtLabelDiff = findViewById(R.id.txtLabelDificuldade);
        if (txtLabelDiff != null) txtLabelDiff.setText(R.string.difficulty_recorded);

        if (treino != null) {
            sliderDificuldade.setValue(Math.max(0, treino.getGrauDificuldade()));
            editObservacoes.setText(treino.getObservacao() != null ? treino.getObservacao() : "");
        }
    }

    private void setupExecutionMode() {
        sliderDificuldade.addOnChangeListener((slider, value, fromUser) -> {
            // O valor inicial do componente não conta como uma resposta dada pelo aluno.
            if (fromUser) {
                dificuldadeInformada = true;
            }
        });

        btnFinalizar.setOnClickListener(v -> {
            if (!dificuldadeInformada) {
                Toast.makeText(this, R.string.error_difficulty_required, Toast.LENGTH_SHORT).show();
                return;
            }

            float dificuldade = sliderDificuldade.getValue();
            String observacao = editObservacoes.getText() != null
                    ? editObservacoes.getText().toString().trim()
                    : "";

            SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
            int idAluno = prefs.getInt("idUsuario", -1);
            int idPersonal = prefs.getInt("idPersonal", -1);
            String nomeTreino = treino != null
                    ? treino.getNome()
                    : getString(R.string.simple_workout_name);

            if (idAluno == -1 || idPersonal == -1 || idPersonal == 1) {
                Toast.makeText(this, R.string.success_workout_saved, Toast.LENGTH_LONG).show();
                finalizarComSucesso();
                return;
            }

            setCarregando(true);
            SupabaseClient supabaseClient = supabaseClient();
            supabaseClient.finalizarTreinoAtribuido(
                    treino != null ? treino.getId() : "",
                    idAluno,
                    idPersonal,
                    treino != null ? treino.getData() : "",
                    treino != null ? treino.getNome() : getString(R.string.simple_workout_name),
                    treino != null ? treino.getDescricao() : "",
                    Math.round(dificuldade),
                    observacao,
                    new SupabaseClient.CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            // Primeiro garantimos o histórico; a notificação é uma etapa posterior.
                            enviarNotificacaoFinalizacao(
                                    supabaseClient,
                                    idAluno,
                                    idPersonal,
                                    nomeTreino,
                                    dificuldade,
                                    observacao
                            );
                        }

                        @Override
                        public void onErro(String mensagem) {
                            setCarregando(false);
                            Toast.makeText(ExecucaoTreinoActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                        }
                    }
            );
        });
    }

    private void enviarNotificacaoFinalizacao(
            SupabaseClient supabaseClient,
            int idAluno,
            int idPersonal,
            String nomeTreino,
            float dificuldade,
            String observacao
    ) {
        supabaseClient.enviarNotificacaoTreinoFinalizado(
                    idAluno,
                    idPersonal,
                    nomeTreino,
                    dificuldade,
                    observacao,
                    new SupabaseClient.CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            Toast.makeText(
                                    ExecucaoTreinoActivity.this,
                                    getString(R.string.success_workout_notified),
                                    Toast.LENGTH_LONG
                            ).show();
                            finalizarComSucesso();
                        }

                        @Override
                        public void onErro(String mensagem) {
                            // Uma falha de notificação não desfaz o treino que já foi salvo.
                            Toast.makeText(
                                    ExecucaoTreinoActivity.this,
                                    getString(R.string.success_workout_without_notification),
                                    Toast.LENGTH_LONG
                            ).show();
                            finalizarComSucesso();
                        }
                    }
        );
    }

    private SupabaseClient supabaseClient() {
        return new SupabaseClient(this);
    }

    private void finalizarComSucesso() {
        Intent result = new Intent();
        if (treino != null) {
            result.putExtra("id_treino_finalizado", treino.getId());
        }
        setResult(RESULT_OK, result);
        finish();
    }

    private void setCarregando(boolean carregando) {
        // Bloqueia os controles enquanto a requisição está ativa para evitar dois envios.
        btnFinalizar.setEnabled(!carregando);
        sliderDificuldade.setEnabled(!carregando);
        editObservacoes.setEnabled(!carregando);
        progressFinalizarTreino.setVisibility(carregando ? View.VISIBLE : View.GONE);
    }

    @Override
    public void onEdit(Exercicio exercicio, int position) {}

    @Override
    public void onToggleSelection(Exercicio exercicio, int position) {}
}
