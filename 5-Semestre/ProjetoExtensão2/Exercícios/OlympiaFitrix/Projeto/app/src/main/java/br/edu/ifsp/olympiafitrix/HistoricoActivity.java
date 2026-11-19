package br.edu.ifsp.olympiafitrix;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import br.edu.ifsp.olympiafitrix.model.Treino;
import br.edu.ifsp.olympiafitrix.util.TextoDominio;

/** Consulta todos os treinos do aluno na data selecionada, independentemente do status. */
public class HistoricoActivity extends BaseActivity {

    private Button btnBuscarTreino;
    private TextView txtSemResultado;
    private LinearLayout layoutResultadosHistorico;
    private LinearLayout containerCardsHistoricoAluno;
    private SupabaseClient supabaseClient;
    private int idAluno = -1;
    private String dataSelecionada;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_historico);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idAluno = prefs.getInt("idUsuario", -1);
        supabaseClient = new SupabaseClient(this);

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuRelogio);
        MenuInferiorHelper.configurar(this, bottomNavigation);

        CalendarView calendarView = findViewById(R.id.calendarView);
        btnBuscarTreino = findViewById(R.id.btnBuscarTreino);
        txtSemResultado = findViewById(R.id.txtSemResultado);
        layoutResultadosHistorico = findViewById(R.id.layoutResultadosHistorico);
        containerCardsHistoricoAluno = findViewById(R.id.containerCardsHistoricoAluno);

        dataSelecionada = obterDataAtual();
        calendarView.setOnDateChangeListener((view, year, month, dayOfMonth) -> {
            dataSelecionada = String.format(Locale.getDefault(), "%04d-%02d-%02d", year, month + 1, dayOfMonth);
        });

        btnBuscarTreino.setOnClickListener(v -> buscarHistorico());
    }

    private String obterDataAtual() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Calendar.getInstance().getTime());
    }

    private void buscarHistorico() {
        if (idAluno == -1) {
            Toast.makeText(this, "Sessão inválida.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnBuscarTreino.setEnabled(false);
        btnBuscarTreino.setText(R.string.state_searching);
        txtSemResultado.setVisibility(View.GONE);
        containerCardsHistoricoAluno.removeAllViews();
        layoutResultadosHistorico.setVisibility(View.GONE);

        supabaseClient.buscarHistoricoTreinosAluno(idAluno, dataSelecionada, new SupabaseClient.TreinosCallback() {
            @Override
            public void onSucesso(List<Treino> treinos) {
                btnBuscarTreino.setEnabled(true);
                btnBuscarTreino.setText(R.string.state_search);

                containerCardsHistoricoAluno.removeAllViews();
                for (Treino treino : treinos) {
                    adicionarCardTreino(treino);
                }

                boolean vazio = treinos.isEmpty();
                txtSemResultado.setVisibility(vazio ? View.VISIBLE : View.GONE);
                layoutResultadosHistorico.setVisibility(vazio ? View.GONE : View.VISIBLE);
            }

            @Override
            public void onErro(String mensagem) {
                btnBuscarTreino.setEnabled(true);
                btnBuscarTreino.setText(R.string.state_search);
                Toast.makeText(HistoricoActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void adicionarCardTreino(Treino treino) {
        View card = LayoutInflater.from(this).inflate(
                R.layout.item_treino_personal,
                containerCardsHistoricoAluno,
                false
        );

        TextView txtNome = card.findViewById(R.id.txtNomeTreinoItem);
        TextView txtData = card.findViewById(R.id.txtDataTreinoItem);
        TextView txtDescricao = card.findViewById(R.id.txtDescricaoTreinoItem);
        TextView txtExercicios = card.findViewById(R.id.txtExerciciosCountItem);
        TextView txtInfoExtraLabel = card.findViewById(R.id.lblInfoExtraItem);
        TextView txtInfoExtraValue = card.findViewById(R.id.txtInfoExtraValueItem);
        LinearLayout layoutButtonsPersonal = card.findViewById(R.id.layoutButtonsPersonal);
        LinearLayout layoutButtonsAluno = card.findViewById(R.id.layoutButtonsAluno);
        Button btnEditar = card.findViewById(R.id.btnEditarTreino);
        Button btnDeletar = card.findViewById(R.id.btnDeletarTreino);
        Button btnVisualizar = card.findViewById(R.id.btnAtribuirTreino);

        txtNome.setText(treino.getNome());
        txtData.setText(formatarDataBrasileira(treino.getData()));
        txtDescricao.setText(formatarDescricaoComPersonal(treino));
        txtExercicios.setText(String.valueOf(
                treino.getListaExercicios() != null ? treino.getListaExercicios().size() : 0
        ));
        txtInfoExtraLabel.setText(R.string.status_label);
        txtInfoExtraValue.setText(formatarStatus(treino.getStatus()));

        layoutButtonsPersonal.setVisibility(View.VISIBLE);
        layoutButtonsAluno.setVisibility(View.GONE);
        btnEditar.setVisibility(View.GONE);
        btnDeletar.setVisibility(View.GONE);
        btnVisualizar.setText(R.string.action_view_workout);
        btnVisualizar.setOnClickListener(v -> abrirDetalhesTreino(treino));

        containerCardsHistoricoAluno.addView(card);
    }

    private String formatarDescricaoComPersonal(Treino treino) {
        String descricao = treino.getDescricao() != null
                ? treino.getDescricao().trim()
                : "";
        String nomePersonal = treino.getNomePersonal() != null
                && !treino.getNomePersonal().trim().isEmpty()
                ? treino.getNomePersonal().trim()
                : "Não informado";

        if (descricao.isEmpty()) {
            return getString(R.string.trainer_value, nomePersonal);
        }
        return descricao + "\n" + getString(R.string.trainer_value, nomePersonal);
    }

    private void abrirDetalhesTreino(Treino treino) {
        Intent intent = new Intent(this, ExecucaoTreinoActivity.class);
        intent.putExtra("treino", treino);
        intent.putExtra("isDetail", true);
        startActivity(intent);
    }

    private String formatarStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "PENDENTE";
        }
        return TextoDominio.status(this, status);
    }

    private String formatarDataBrasileira(String data) {
        if (data == null || data.trim().isEmpty()) {
            return "";
        }

        String valor = data.trim();
        if (valor.matches("\\d{2}/\\d{2}/\\d{4}")) {
            return valor;
        }

        String apenasData = valor.length() >= 10 ? valor.substring(0, 10) : valor;
        try {
            java.util.Date dataParseada = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(apenasData);
            if (dataParseada != null) {
                return new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(dataParseada);
            }
        } catch (Exception ignored) {
            return valor;
        }

        return valor;
    }
}
