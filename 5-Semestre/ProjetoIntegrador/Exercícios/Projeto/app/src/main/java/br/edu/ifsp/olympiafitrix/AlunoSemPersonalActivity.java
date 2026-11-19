package br.edu.ifsp.olympiafitrix;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.appcompat.app.AlertDialog;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.card.MaterialCardView;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.adapter.TreinoAdapter;
import br.edu.ifsp.olympiafitrix.model.AlunoRanking;
import br.edu.ifsp.olympiafitrix.model.Treino;

/** Tela inicial do aluno, adaptada conforme vínculo, ranking e treinos pendentes. */
public class AlunoSemPersonalActivity extends BaseActivity implements TreinoAdapter.OnTreinoActionListener {

    private MaterialCardView cardEncontrarPersonal;
    private MaterialCardView cardSemTreinos;
    private Button btnEncontrarPersonal;
    private TextView txtScoreAlunoHome;
    private TextView txtPosicaoRankingHome;
    private RecyclerView rvTreinosAluno;
    private TreinoAdapter treinoAdapter;
    private final List<Treino> treinosAtribuidos = new ArrayList<>();
    private SupabaseClient supabaseClient;
    private ActivityResultLauncher<Intent> execucaoTreinoLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_aluno_sem_personal);

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuTreino);
        MenuInferiorHelper.configurar(this, bottomNavigation);

        cardEncontrarPersonal = findViewById(R.id.cardEncontrarPersonal);
        cardSemTreinos = findViewById(R.id.cardSemTreinos);
        btnEncontrarPersonal = findViewById(R.id.btnEncontrarPersonal);
        txtScoreAlunoHome = findViewById(R.id.txtScoreAlunoHome);
        txtPosicaoRankingHome = findViewById(R.id.txtPosicaoRankingHome);
        rvTreinosAluno = findViewById(R.id.rvTreinosAluno);
        supabaseClient = new SupabaseClient(this);
        execucaoTreinoLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() != RESULT_OK || result.getData() == null) {
                        return;
                    }

                    removerTreinoDaTela(result.getData().getStringExtra("id_treino_finalizado"));
                }
        );

        treinoAdapter = new TreinoAdapter(treinosAtribuidos, false, this);
        rvTreinosAluno.setLayoutManager(new LinearLayoutManager(this));
        rvTreinosAluno.setAdapter(treinoAdapter);

    }



    private void configurarTelaTreino() {
        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        int idAluno = prefs.getInt("idUsuario", -1);
        int idPersonal = prefs.getInt("idPersonal", 1);

        if (idPersonal != 1) {
            cardEncontrarPersonal.setVisibility(View.GONE);
            carregarScoreEPosicao(idAluno, idPersonal);
            carregarTreinosAtribuidos(idAluno);
            return;
        }

        txtScoreAlunoHome.setText("--");
        txtPosicaoRankingHome.setText("--");
        rvTreinosAluno.setVisibility(View.GONE);
        cardSemTreinos.setVisibility(View.GONE);
        cardEncontrarPersonal.setVisibility(View.VISIBLE);
        btnEncontrarPersonal.setOnClickListener(v -> {
            Intent intent = new Intent(this, PersonaisActivity.class);
            startActivity(intent);
        });
    }

    private void carregarScoreEPosicao(int idAluno, int idPersonal) {
        if (idAluno == -1) {
            return;
        }

        supabaseClient.buscarRankingAlunosDoPersonal(
                idPersonal,
                new SupabaseClient.RankingAlunosCallback() {
                    @Override
                    public void onSucesso(List<AlunoRanking> alunos) {
                        for (int i = 0; i < alunos.size(); i++) {
                            AlunoRanking aluno = alunos.get(i);
                            if (aluno.getIdAluno() == idAluno) {
                                txtScoreAlunoHome.setText(getString(
                                        R.string.score_value, aluno.getScoreFormatado()));
                                txtPosicaoRankingHome.setText(getString(
                                        R.string.position_value, i + 1));
                                return;
                            }
                        }

                        txtScoreAlunoHome.setText("--");
                        txtPosicaoRankingHome.setText("--");
                    }

                    @Override
                    public void onErro(String mensagem) {
                        Toast.makeText(AlunoSemPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private void carregarTreinosAtribuidos(int idAluno) {
        if (idAluno == -1) {
            mostrarTreinosVazios();
            return;
        }

        supabaseClient.buscarTreinosAtribuidosAluno(
                idAluno,
                new SupabaseClient.TreinosCallback() {
                    @Override
                    public void onSucesso(List<Treino> treinos) {
                        treinosAtribuidos.clear();
                        treinosAtribuidos.addAll(treinos);
                        treinoAdapter.notifyDataSetChanged();

                        rvTreinosAluno.setVisibility(treinos.isEmpty() ? View.GONE : View.VISIBLE);
                        cardSemTreinos.setVisibility(treinos.isEmpty() ? View.VISIBLE : View.GONE);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        mostrarTreinosVazios();
                        Toast.makeText(AlunoSemPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private void mostrarTreinosVazios() {
        treinosAtribuidos.clear();
        treinoAdapter.notifyDataSetChanged();
        rvTreinosAluno.setVisibility(View.GONE);
        cardSemTreinos.setVisibility(View.VISIBLE);
    }

    @Override
    public void onEdit(Treino treino, int position) {}

    @Override
    public void onDelete(Treino treino, int position) {}

    @Override
    public void onAssign(Treino treino) {}

    @Override
    public void onStart(Treino treino) {
        Intent intent = new Intent(this, ExecucaoTreinoActivity.class);
        intent.putExtra("treino", treino);
        execucaoTreinoLauncher.launch(intent);
    }

    @Override
    public void onDismiss(Treino treino, int position) {
        new AlertDialog.Builder(this)
                .setTitle(R.string.dialog_dismiss_workout_title)
                .setMessage(R.string.dialog_dismiss_workout_message)
                .setPositiveButton(R.string.action_yes, (dialog, which) -> {
                    SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
                    int idAluno = prefs.getInt("idUsuario", -1);
                    int idPersonal = prefs.getInt("idPersonal", -1);
                    supabaseClient.dispensarTreinoAtribuido(
                            treino.getId(),
                            idAluno,
                            idPersonal,
                            treino.getData(),
                            treino.getNome(),
                            treino.getDescricao(),
                            new SupabaseClient.CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            removerTreinoDaTela(treino.getId());
                        }

                        @Override
                        public void onErro(String mensagem) {
                            Toast.makeText(AlunoSemPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton(R.string.action_no, null)
                .show();
    }

    private void removerTreinoDaTela(String idTreino) {
        if (idTreino == null || idTreino.trim().isEmpty()) {
            SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
            carregarTreinosAtribuidos(prefs.getInt("idUsuario", -1));
            return;
        }

        for (int i = 0; i < treinosAtribuidos.size(); i++) {
            if (idTreino.equals(treinosAtribuidos.get(i).getId())) {
                treinosAtribuidos.remove(i);
                treinoAdapter.notifyItemRemoved(i);
                break;
            }
        }

        if (treinosAtribuidos.isEmpty()) {
            mostrarTreinosVazios();
            return;
        }

        rvTreinosAluno.setVisibility(View.VISIBLE);
        cardSemTreinos.setVisibility(View.GONE);
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "link_response".equals(tipo) || "workout_assigned".equals(tipo)) {
            atualizarVinculoAluno(this::configurarTelaTreino);
        }
    }
}
