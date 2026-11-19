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

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.model.AlunoRanking;
import br.edu.ifsp.olympiafitrix.adapter.RankingPersonalAdapter;
import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;

/** Ranking privado dos alunos vinculados ao personal autenticado. */
public class RankingPersonalActivity extends BaseActivity {

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

    private int idPersonal;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ranking_personal);

        supabaseClient = new SupabaseClient(this);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idPersonal = prefs.getInt("idUsuario", -1);

        inicializarComponentes();

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorPersonalHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuGrafico);

        limparRanking();
    }



    private void inicializarComponentes() {
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

    private void buscarRanking() {
        if (idPersonal == -1) {
            Toast.makeText(this, "Sessão inválida.", Toast.LENGTH_SHORT).show();
            return;
        }

        supabaseClient.buscarRankingAlunosDoPersonal(
                idPersonal,
                new SupabaseClient.RankingAlunosCallback() {
                    @Override
                    public void onSucesso(List<AlunoRanking> alunos) {
                        preencherRanking(alunos);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        Log.e("RANKING_PERSONAL", mensagem);
                        Toast.makeText(
                                RankingPersonalActivity.this,
                                mensagem,
                                Toast.LENGTH_SHORT
                        ).show();
                    }
                }
        );
    }

    private void preencherRanking(List<AlunoRanking> alunos) {
        limparRanking();

        if (alunos.isEmpty()) {
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

        RankingPersonalAdapter adapter = new RankingPersonalAdapter(restante);
        rvRanking.setAdapter(adapter);
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
        android.content.Intent intent = new android.content.Intent(
                this, DetalheAlunoPersonalActivity.class);
        intent.putExtra("id_aluno", aluno.getIdAluno());
        intent.putExtra("vinculado", true);
        startActivity(intent);
    }

    private String pegarInicial(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            return "-";
        }

        return nome.trim().substring(0, 1).toUpperCase();
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "workout_finished".equals(tipo)) {
            buscarRanking();
        }
    }
}
