package br.edu.ifsp.olympiafitrix;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import br.edu.ifsp.olympiafitrix.adapter.ExercicioAdapter;
import br.edu.ifsp.olympiafitrix.model.Exercicio;
import br.edu.ifsp.olympiafitrix.model.Nivel;
import br.edu.ifsp.olympiafitrix.model.Treino;
import br.edu.ifsp.olympiafitrix.util.TextoDominio;

/** Monta o treino em etapas, reunindo dados gerais, nível e exercícios selecionados. */
public class CriarTreinoActivity extends LocalizedActivity {

    private TextInputEditText editNome, editDescricao, editData;
    private TextInputLayout layoutData;
    private TextView txtLabelExercicios, txtNivelSelecionado;
    private RecyclerView rvExerciciosSelecionados;
    private ExercicioAdapter adapter;
    private final List<Exercicio> listaExerciciosSelecionados = new ArrayList<>();
    private Nivel nivelSelecionado;
    private String treinoId = null;
    private boolean somenteLeitura = false;
    private Button btnExercicio, btnNivel, btnSalvar;
    private TextView txtTitulo;

    private final ActivityResultLauncher<Intent> exerciciosLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                // A seleção acontece em outra tela, mas o treino continua sendo montado aqui.
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    ArrayList<Exercicio> selecionados =
                            (ArrayList<Exercicio>) result.getData().getSerializableExtra("exercicios_selecionados");
                    if (selecionados != null) {
                        atualizarListaExercicios(selecionados);
                    }
                }
            }
    );

    private final ActivityResultLauncher<Intent> nivelLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Nivel nivel = (Nivel) result.getData().getSerializableExtra("nivel_selecionado");
                    if (nivel != null) {
                        nivelSelecionado = nivel;
                        txtNivelSelecionado.setText(
                                TextoDominio.nivel(this, nivel.getNome()).toUpperCase());
                        txtNivelSelecionado.setVisibility(View.VISIBLE);
                    }
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_criar_treino);

        editNome = findViewById(R.id.editNome);
        editDescricao = findViewById(R.id.editDescricao);
        editData = findViewById(R.id.editData);
        layoutData = findViewById(R.id.layoutData);
        btnExercicio = findViewById(R.id.btnExercicio);
        btnNivel = findViewById(R.id.btnNivel);
        btnSalvar = findViewById(R.id.btnSalvar);
        txtTitulo = findViewById(R.id.txtTitulo);
        txtLabelExercicios = findViewById(R.id.txtLabelExercicios);
        txtNivelSelecionado = findViewById(R.id.txtNivelSelecionado);
        rvExerciciosSelecionados = findViewById(R.id.rvExerciciosSelecionados);

        somenteLeitura = getIntent().getBooleanExtra("somente_leitura", false);
        adapter = new ExercicioAdapter(listaExerciciosSelecionados, null);
        rvExerciciosSelecionados.setLayoutManager(new LinearLayoutManager(this));
        rvExerciciosSelecionados.setAdapter(adapter);

        Treino treinoParaEditar = (Treino) getIntent().getSerializableExtra("treino_para_editar");
        if (treinoParaEditar == null) {
            treinoParaEditar = (Treino) getIntent().getSerializableExtra("treino_visualizar");
        }
        if (treinoParaEditar != null) {
            treinoId = treinoParaEditar.getId();
            editNome.setText(treinoParaEditar.getNome());
            editDescricao.setText(treinoParaEditar.getDescricao());
            editData.setText(treinoParaEditar.getData());
            if (treinoParaEditar.getNivel() != null) {
                nivelSelecionado = new Nivel(treinoParaEditar.getIdNivel(), treinoParaEditar.getNivel(), "");
                txtNivelSelecionado.setText(
                        TextoDominio.nivel(this, nivelSelecionado.getNome()).toUpperCase());
                txtNivelSelecionado.setVisibility(View.VISIBLE);
            }
            if (treinoParaEditar.getListaExercicios() != null) {
                atualizarListaExercicios(treinoParaEditar.getListaExercicios());
            }
        }

        editData.setOnClickListener(v -> showDatePicker());
        layoutData.setEndIconOnClickListener(v -> showDatePicker());
        btnExercicio.setOnClickListener(v -> exerciciosLauncher.launch(new Intent(this, ExerciciosListaActivity.class)));
        btnNivel.setOnClickListener(v -> nivelLauncher.launch(new Intent(this, NiveisListaActivity.class)));
        btnSalvar.setOnClickListener(v -> salvarTreino());

        if (somenteLeitura) {
            configurarSomenteLeitura();
        }
    }

    private void configurarSomenteLeitura() {
        // O mesmo formulário é reaproveitado para visualização, escondendo apenas as ações de edição.
        txtTitulo.setText(R.string.action_view_workout);
        editNome.setEnabled(false);
        editDescricao.setEnabled(false);
        editData.setEnabled(false);
        editData.setFocusable(false);
        layoutData.setEndIconVisible(false);
        btnExercicio.setVisibility(View.GONE);
        btnNivel.setVisibility(View.GONE);
        btnSalvar.setText(R.string.action_back);
        btnSalvar.setOnClickListener(v -> finish());
        adapter.setReadOnly(true);

        txtNivelSelecionado.setVisibility(View.VISIBLE);
        if (nivelSelecionado != null) {
            txtNivelSelecionado.setText(getString(
                    R.string.level_value,
                    TextoDominio.nivel(this, nivelSelecionado.getNome())));
        }
        txtLabelExercicios.setVisibility(View.VISIBLE);
    }

    private void salvarTreino() {
        String nome = editNome.getText() != null ? editNome.getText().toString().trim() : "";
        String descricao = editDescricao.getText() != null ? editDescricao.getText().toString().trim() : "";
        String data = editData.getText() != null ? editData.getText().toString().trim() : "";

        if (nome.isEmpty()) {
            editNome.setError(getString(R.string.error_required));
            return;
        }

        if (descricao.isEmpty()) {
            editDescricao.setError(getString(R.string.error_required));
            return;
        }

        if (data.isEmpty()) {
            editData.setError(getString(R.string.error_required));
            return;
        }

        if (nivelSelecionado == null) {
            Toast.makeText(this, R.string.error_select_level, Toast.LENGTH_SHORT).show();
            return;
        }

        if (treinoId == null) {
            treinoId = UUID.randomUUID().toString();
        }

        Treino novoTreino = new Treino(
                treinoId,
                nome,
                descricao,
                data,
                "Personal",
                nivelSelecionado.getNome(),
                "60 min",
                new ArrayList<>(listaExerciciosSelecionados)
        );
        novoTreino.setIdNivel(nivelSelecionado.getIdNivel());

        Intent resultIntent = new Intent();
        resultIntent.putExtra("treino_salvo", novoTreino);
        resultIntent.putExtra("id_nivel", nivelSelecionado.getIdNivel());
        setResult(RESULT_OK, resultIntent);

        Toast.makeText(this, R.string.success_workout_saved, Toast.LENGTH_SHORT).show();
        finish();
    }

    private void atualizarListaExercicios(List<Exercicio> novos) {
        listaExerciciosSelecionados.clear();
        listaExerciciosSelecionados.addAll(novos);
        adapter.notifyDataSetChanged();
        txtLabelExercicios.setVisibility(listaExerciciosSelecionados.isEmpty() ? View.GONE : View.VISIBLE);
    }

    private void showDatePicker() {
        final Calendar c = Calendar.getInstance();
        DatePickerDialog dpd = new DatePickerDialog(this, (view, year, month, day) -> {
            editData.setText(String.format(Locale.getDefault(), "%02d/%02d/%d", day, month + 1, year));
        }, c.get(Calendar.YEAR), c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH));
        dpd.show();
    }
}
