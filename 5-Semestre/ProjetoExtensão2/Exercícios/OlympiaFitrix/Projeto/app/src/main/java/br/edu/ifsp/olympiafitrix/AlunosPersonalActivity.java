package br.edu.ifsp.olympiafitrix;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.adapter.AlunoVinculadoAdapter;
import br.edu.ifsp.olympiafitrix.adapter.SolicitacaoAlunoAdapter;
import br.edu.ifsp.olympiafitrix.model.AlunoPersonal;

public class AlunosPersonalActivity extends BaseActivity {

    private RecyclerView rvSolicitacoes;
    private RecyclerView rvAlunosVinculados;
    private TextView txtSemSolicitacoes;
    private TextView txtSemAlunos;

    private SupabaseClient supabaseClient;
    private int idPersonal;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_alunos_personal);

        supabaseClient = new SupabaseClient(this);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idPersonal = prefs.getInt("idUsuario", -1);

        rvSolicitacoes = findViewById(R.id.rvSolicitacoes);
        rvAlunosVinculados = findViewById(R.id.rvAlunosVinculados);
        txtSemSolicitacoes = findViewById(R.id.txtSemSolicitacoes);
        txtSemAlunos = findViewById(R.id.txtSemAlunos);

        rvSolicitacoes.setLayoutManager(new LinearLayoutManager(this));
        rvAlunosVinculados.setLayoutManager(new LinearLayoutManager(this));

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorPersonalHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuPersonal);

    }

    private void carregarDados() {
        carregarSolicitacoes();
        carregarAlunosVinculados();
    }

    private void carregarSolicitacoes() {
        supabaseClient.buscarSolicitacoesPendentesPersonal(
                idPersonal,
                new SupabaseClient.AlunosPersonalCallback() {
                    @Override
                    public void onSucesso(List<AlunoPersonal> alunos) {
                        txtSemSolicitacoes.setVisibility(alunos.isEmpty() ? View.VISIBLE : View.GONE);

                        SolicitacaoAlunoAdapter adapter =
                                new SolicitacaoAlunoAdapter(
                                        alunos,
                                        AlunosPersonalActivity.this,
                                        idPersonal,
                                        () -> carregarDados()
                                );

                        rvSolicitacoes.setAdapter(adapter);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        Toast.makeText(AlunosPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    private void carregarAlunosVinculados() {
        supabaseClient.buscarAlunosVinculadosPersonal(
                idPersonal,
                new SupabaseClient.AlunosPersonalCallback() {
                    @Override
                    public void onSucesso(List<AlunoPersonal> alunos) {
                        txtSemAlunos.setVisibility(alunos.isEmpty() ? View.VISIBLE : View.GONE);

                        AlunoVinculadoAdapter adapter =
                                new AlunoVinculadoAdapter(alunos, AlunosPersonalActivity.this);

                        rvAlunosVinculados.setAdapter(adapter);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        Toast.makeText(AlunosPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "link_request".equals(tipo) || "workout_finished".equals(tipo)) {
            carregarDados();
        }
    }
}
