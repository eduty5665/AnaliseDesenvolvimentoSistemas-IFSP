package br.edu.ifsp.olympiafitrix;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import br.edu.ifsp.olympiafitrix.adapter.TreinoAdapter;
import br.edu.ifsp.olympiafitrix.model.Treino;
import br.edu.ifsp.olympiafitrix.model.AlunoSimples;

/** Filtra o histórico do personal por aluno e data e abre resultados em modo somente leitura. */
public class HistoricoPersonalActivity extends BaseActivity implements TreinoAdapter.OnTreinoActionListener {

    private AutoCompleteTextView spinnerAlunos;
    private CalendarView calendarView;
    private Button btnBuscarTreino;
    private LinearLayout layoutResultadosHistorico;
    private TextView txtResultadoTitulo;
    private TextView txtResultadoMensagem;
    private RecyclerView rvTreinosHistorico;
    private TreinoAdapter treinoAdapter;
    private final List<Treino> treinosHistorico = new ArrayList<>();
    private SupabaseClient supabaseClient;
    private int idPersonal;
    private AlunoSimples alunoSelecionado;
    private String dataSelecionada;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_historico_personal);

        supabaseClient = new SupabaseClient(this);
        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idPersonal = prefs.getInt("idUsuario", -1);

        inicializarComponentes();
        configurarMenu();
        configurarCalendario();

        btnBuscarTreino.setOnClickListener(v -> buscarTreino());
    }

    private void inicializarComponentes() {
        spinnerAlunos = findViewById(R.id.spinnerAlunos);
        calendarView = findViewById(R.id.calendarView);
        btnBuscarTreino = findViewById(R.id.btnBuscarTreino);
        layoutResultadosHistorico = findViewById(R.id.layoutResultadosHistorico);
        txtResultadoTitulo = findViewById(R.id.txtResultadoTitulo);
        txtResultadoMensagem = findViewById(R.id.txtResultadoMensagem);
        rvTreinosHistorico = findViewById(R.id.rvTreinosHistoricoPersonal);

        treinoAdapter = new TreinoAdapter(
                treinosHistorico,
                TreinoAdapter.MODO_HISTORICO_PERSONAL,
                this
        );
        rvTreinosHistorico.setLayoutManager(new LinearLayoutManager(this) {
            @Override
            public boolean canScrollVertically() {
                return false;
            }
        });
        rvTreinosHistorico.setNestedScrollingEnabled(false);
        rvTreinosHistorico.setVerticalScrollBarEnabled(false);
        rvTreinosHistorico.setOverScrollMode(View.OVER_SCROLL_NEVER);
        rvTreinosHistorico.setAdapter(treinoAdapter);

        dataSelecionada = obterDataAtual();
    }

    private void configurarMenu() {
        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorPersonalHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuRelogio);
    }

    private void configurarCalendario() {
        calendarView.setOnDateChangeListener((view, year, month, dayOfMonth) -> {
            dataSelecionada = String.format(Locale.getDefault(), "%04d-%02d-%02d", year, month + 1, dayOfMonth);
        });
    }

    private String obterDataAtual() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Calendar.getInstance().getTime());
    }

    private void carregarAlunos() {
        if (idPersonal == -1) {
            Toast.makeText(this, "Sessão inválida.", Toast.LENGTH_SHORT).show();
            return;
        }

        supabaseClient.buscarAlunosDoPersonalSimples(idPersonal, new SupabaseClient.AlunosSimplesCallback() {
            @Override
            public void onSucesso(List<AlunoSimples> alunos) {
                if (alunos.isEmpty()) {
                    Toast.makeText(HistoricoPersonalActivity.this, "Você ainda não possui alunos vinculados.", Toast.LENGTH_SHORT).show();
                    return;
                }
                configurarSelectAlunos(alunos);
            }

            @Override
            public void onErro(String mensagem) {
                Log.e("HISTORICO_ALUNOS", mensagem);
                Toast.makeText(HistoricoPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void configurarSelectAlunos(List<AlunoSimples> alunos) {
        ArrayAdapter<AlunoSimples> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_dropdown_item_1line,
                alunos
        );

        spinnerAlunos.setAdapter(adapter);
        spinnerAlunos.setOnItemClickListener((parent, view, position, id) -> {
            alunoSelecionado = (AlunoSimples) parent.getItemAtPosition(position);
        });
    }

    private void buscarTreino() {
        if (alunoSelecionado == null) {
            Toast.makeText(this, "Selecione um aluno.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnBuscarTreino.setEnabled(false);
        btnBuscarTreino.setText(R.string.state_searching);
        rvTreinosHistorico.setVisibility(View.GONE);

        supabaseClient.buscarHistoricoTreinosPersonal(
                alunoSelecionado.getIdAluno(),
                idPersonal,
                dataSelecionada,
                new SupabaseClient.TreinosCallback() {
                    @Override
                    public void onSucesso(List<Treino> treinos) {
                        btnBuscarTreino.setEnabled(true);
                        btnBuscarTreino.setText(R.string.ui_buscar_treino);
                        layoutResultadosHistorico.setVisibility(View.VISIBLE);

                        treinosHistorico.clear();
                        treinosHistorico.addAll(treinos);
                        treinoAdapter.notifyDataSetChanged();

                        if (treinos.isEmpty()) {
                            txtResultadoTitulo.setText(R.string.history_none_title);
                            txtResultadoMensagem.setText(getString(
                                    R.string.history_none_message, alunoSelecionado.getNome()));
                            rvTreinosHistorico.setVisibility(View.GONE);
                        } else {
                            txtResultadoTitulo.setText(R.string.history_found_title);
                            txtResultadoMensagem.setText(getString(
                                    R.string.history_found_message,
                                    alunoSelecionado.getNome(), dataSelecionada));
                            rvTreinosHistorico.setVisibility(View.VISIBLE);
                        }
                    }

                    @Override
                    public void onErro(String mensagem) {
                        btnBuscarTreino.setEnabled(true);
                        btnBuscarTreino.setText(R.string.ui_buscar_treino);
                        Log.e("BUSCAR_TREINO", mensagem);
                        Toast.makeText(HistoricoPersonalActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    @Override
    public void onEdit(Treino treino, int position) {}

    @Override
    public void onDelete(Treino treino, int position) {}

    @Override
    public void onAssign(Treino treino) {
        Intent intent = new Intent(this, ExecucaoTreinoActivity.class);
        intent.putExtra("treino", treino);
        intent.putExtra("isDetail", true);
        startActivity(intent);
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "workout_finished".equals(tipo)) {
            carregarAlunos();
            if (alunoSelecionado != null) buscarTreino();
        }
    }
}
