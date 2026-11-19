package br.edu.ifsp.olympiafitrix;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.model.AlunoRanking;
import br.edu.ifsp.olympiafitrix.adapter.RankingPersonalAdapter;
import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;
import br.edu.ifsp.olympiafitrix.util.RankingDialogHelper;

/** Ranking dos alunos ligados ao mesmo personal, com detalhes públicos protegidos. */
public class RankingActivity extends BaseActivity {

    private TextView txtSubtituloRanking;
    private TextView txtShortFirst;
    private TextView txtNomeFirst;
    private TextView txtScoreFirst;
    private TextView txtShortSecond;
    private TextView txtNomeSecond;
    private TextView txtScoreSecond;
    private TextView txtShortThird;
    private TextView txtNomeThird;
    private TextView txtScoreThird;
    private TextView txtSemAlunos;
    private ImageView imgFotoFirst;
    private ImageView imgFotoSecond;
    private ImageView imgFotoThird;
    private RecyclerView rvRanking;
    private View podiumFirst;
    private View podiumSecond;
    private View podiumThird;

    private SupabaseClient supabaseClient;
    private int idAluno;
    private int idPersonal;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ranking);

        supabaseClient = new SupabaseClient(this);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idAluno = prefs.getInt("idUsuario", -1);
        idPersonal = prefs.getInt("idPersonal", 1);

        inicializarComponentes();

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuGrafico);
        MenuInferiorHelper.configurar(this, bottomNavigation);

        limparRanking();
    }



    private void inicializarComponentes() {
        txtSubtituloRanking = findViewById(R.id.txtSubtituloRanking);

        txtShortFirst = findViewById(R.id.txtShortFirst);
        txtNomeFirst = findViewById(R.id.txtNomeFirst);
        txtScoreFirst = findViewById(R.id.txtScoreFirst);

        txtShortSecond = findViewById(R.id.txtShortSecond);
        txtNomeSecond = findViewById(R.id.txtNomeSecond);
        txtScoreSecond = findViewById(R.id.txtScoreSecond);

        txtShortThird = findViewById(R.id.txtShortThird);
        txtNomeThird = findViewById(R.id.txtNomeThird);
        txtScoreThird = findViewById(R.id.txtScoreThird);
        imgFotoFirst = findViewById(R.id.imgFotoFirst);
        imgFotoSecond = findViewById(R.id.imgFotoSecond);
        imgFotoThird = findViewById(R.id.imgFotoThird);

        txtSemAlunos = findViewById(R.id.txtSemAlunos);

        rvRanking = findViewById(R.id.rvRanking);
        rvRanking.setLayoutManager(new LinearLayoutManager(this));
        podiumFirst = findViewById(R.id.podiumFirst);
        podiumSecond = findViewById(R.id.podiumSecond);
        podiumThird = findViewById(R.id.podiumThird);
    }

    private void carregarPersonalAtualizado() {
        if (idAluno == -1) {
            mostrarSemPersonal();
            return;
        }

        supabaseClient.buscarPerfilAluno(idAluno, new SupabaseClient.PerfilAlunoCallback() {
            @Override
            public void onSucesso(JSONObject perfil) {
                idPersonal = perfil.optInt("id_personal", 1);
                getSharedPreferences("sessao", MODE_PRIVATE)
                        .edit()
                        .putInt("idPersonal", idPersonal)
                        .apply();

                if (idPersonal == 1) {
                    mostrarSemPersonal();
                    return;
                }

                buscarRanking();
            }

            @Override
            public void onErro(String mensagem) {
                Log.e("RANKING_ALUNO", mensagem);

                if (idPersonal == 1) {
                    mostrarSemPersonal();
                    return;
                }

                buscarRanking();
            }
        });
    }

    private void buscarRanking() {
        txtSubtituloRanking.setText(R.string.ui_ranking_dos_alunos_do_seu_personal);

        supabaseClient.buscarRankingAlunosDoPersonal(
                idPersonal,
                new SupabaseClient.RankingAlunosCallback() {
                    @Override
                    public void onSucesso(List<AlunoRanking> alunos) {
                        preencherRanking(alunos);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        Log.e("RANKING_ALUNO", mensagem);
                        Toast.makeText(RankingActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private void preencherRanking(List<AlunoRanking> alunos) {
        limparRanking();

        if (alunos.isEmpty()) {
            txtSemAlunos.setText(R.string.ui_nenhum_aluno_vinculado);
            txtSemAlunos.setVisibility(View.VISIBLE);
            rvRanking.setAdapter(new RankingPersonalAdapter(new ArrayList<>()));
            return;
        }

        txtSemAlunos.setVisibility(View.GONE);

        if (alunos.size() >= 1) {
            preencherPrimeiro(alunos.get(0));
        }

        if (alunos.size() >= 2) {
            preencherSegundo(alunos.get(1));
        }

        if (alunos.size() >= 3) {
            preencherTerceiro(alunos.get(2));
        }

        List<AlunoRanking> restante = new ArrayList<>();
        if (alunos.size() > 3) {
            restante.addAll(alunos.subList(3, alunos.size()));
        }

        rvRanking.setAdapter(new RankingPersonalAdapter(restante));
    }

    private void mostrarSemPersonal() {
        limparRanking();
        txtSubtituloRanking.setText(R.string.ui_voce_nao_esta_vinculado_a_um_personal);
        txtSemAlunos.setText(R.string.ui_voce_nao_esta_vinculado_a_um_personal);
        txtSemAlunos.setVisibility(View.VISIBLE);
        rvRanking.setAdapter(new RankingPersonalAdapter(new ArrayList<>()));
    }

    private void preencherPrimeiro(AlunoRanking aluno) {
        txtShortFirst.setText(pegarInicial(aluno.getNome()));
        txtNomeFirst.setText(aluno.getNome());
        txtScoreFirst.setText(getString(R.string.score_value, aluno.getScoreFormatado()));
        FotoPerfilUtils.carregar(imgFotoFirst, aluno.getFotoUrl());
        podiumFirst.setOnClickListener(v -> abrirDetalheAluno(aluno));
    }

    private void preencherSegundo(AlunoRanking aluno) {
        txtShortSecond.setText(pegarInicial(aluno.getNome()));
        txtNomeSecond.setText(aluno.getNome());
        txtScoreSecond.setText(getString(R.string.score_value, aluno.getScoreFormatado()));
        FotoPerfilUtils.carregar(imgFotoSecond, aluno.getFotoUrl());
        podiumSecond.setOnClickListener(v -> abrirDetalheAluno(aluno));
    }

    private void preencherTerceiro(AlunoRanking aluno) {
        txtShortThird.setText(pegarInicial(aluno.getNome()));
        txtNomeThird.setText(aluno.getNome());
        txtScoreThird.setText(getString(R.string.score_value, aluno.getScoreFormatado()));
        FotoPerfilUtils.carregar(imgFotoThird, aluno.getFotoUrl());
        podiumThird.setOnClickListener(v -> abrirDetalheAluno(aluno));
    }

    private void limparRanking() {
        txtShortFirst.setText("-");
        txtNomeFirst.setText("");
        txtScoreFirst.setText("");

        txtShortSecond.setText("-");
        txtNomeSecond.setText("");
        txtScoreSecond.setText("");

        txtShortThird.setText("-");
        txtNomeThird.setText("");
        txtScoreThird.setText("");
        imgFotoFirst.setImageResource(R.drawable.guerreiro);
        imgFotoSecond.setImageResource(R.drawable.guerreiro);
        imgFotoThird.setImageResource(R.drawable.guerreiro);
        podiumFirst.setOnClickListener(null);
        podiumSecond.setOnClickListener(null);
        podiumThird.setOnClickListener(null);

        txtSemAlunos.setVisibility(View.GONE);
    }

    private void abrirDetalheAluno(AlunoRanking aluno) {
        RankingDialogHelper.mostrar(this, aluno);
    }

    private String pegarInicial(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return "-";
        }

        return nome.trim().substring(0, 1).toUpperCase();
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "link_response".equals(tipo)) {
            carregarPersonalAtualizado();
        }
    }
}
