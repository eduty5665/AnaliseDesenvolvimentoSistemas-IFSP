package br.edu.ifsp.olympiafitrix;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.textfield.TextInputEditText;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.adapter.ExercicioAdapter;
import br.edu.ifsp.olympiafitrix.model.Exercicio;

public class ExerciciosListaActivity extends LocalizedActivity implements ExercicioAdapter.OnExercicioActionListener {

    private ExercicioAdapter adapter;
    private List<Exercicio> listaExercicios;
    private Button btnSelecionar, btnAtribuir;
    private SupabaseClient supabaseClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_exercicios_lista);

        RecyclerView rvExercicios = findViewById(R.id.rvExercicios);
        Button btnAdicionar = findViewById(R.id.btnAdicionarExercicio);
        btnSelecionar = findViewById(R.id.btnSelecionarExercicios);
        btnAtribuir = findViewById(R.id.btnAtribuirExercicios);
        supabaseClient = new SupabaseClient(this);

        listaExercicios = new ArrayList<>();
        adapter = new ExercicioAdapter(listaExercicios, this);
        rvExercicios.setLayoutManager(new LinearLayoutManager(this));
        rvExercicios.setAdapter(adapter);

        btnAdicionar.setOnClickListener(v -> showExercicioDialog(null, -1));
        btnSelecionar.setOnClickListener(v -> alternarSelecao());
        btnAtribuir.setOnClickListener(v -> atribuirSelecionados());
        btnAtribuir.setVisibility(View.GONE);

        carregarExercicios();
    }

    private void carregarExercicios() {
        supabaseClient.buscarExercicios(new SupabaseClient.ExerciciosCallback() {
            @Override
            public void onSucesso(List<Exercicio> exercicios) {
                listaExercicios.clear();
                listaExercicios.addAll(exercicios);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onErro(String mensagem) {
                Toast.makeText(ExerciciosListaActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void alternarSelecao() {
        boolean novoModo = !adapter.isSelectionMode();
        adapter.setSelectionMode(novoModo);
        btnSelecionar.setText(novoModo
                ? R.string.action_cancel_upper
                : R.string.action_select_upper);
        btnAtribuir.setVisibility(novoModo ? View.VISIBLE : View.GONE);

        if (!novoModo) {
            for (Exercicio e : listaExercicios) {
                e.setSelected(false);
            }
            adapter.notifyDataSetChanged();
        }
    }

    private void atribuirSelecionados() {
        ArrayList<Exercicio> selecionados = new ArrayList<>();
        for (Exercicio e : listaExercicios) {
            if (e.isSelected()) {
                selecionados.add(e);
            }
        }

        if (selecionados.isEmpty()) {
            Toast.makeText(this, R.string.error_select_exercise, Toast.LENGTH_SHORT).show();
            return;
        }

        Intent resultIntent = new Intent();
        resultIntent.putExtra("exercicios_selecionados", selecionados);
        setResult(RESULT_OK, resultIntent);
        finish();
    }

    private void showExercicioDialog(Exercicio exercicioExistente, int position) {
        View view = LayoutInflater.from(this).inflate(R.layout.dialog_adicionar_exercicio, null);

        TextView txtTitulo = view.findViewById(R.id.txtTituloDialogExercicio);
        TextInputEditText editNome = view.findViewById(R.id.editNomeExercicio);
        TextInputEditText editDescricao = view.findViewById(R.id.editDescricaoExercicio);
        TextInputEditText editSeries = view.findViewById(R.id.editSeriesExercicio);
        TextInputEditText editRepeticao = view.findViewById(R.id.editRepeticaoExercicio);
        TextInputEditText editPeso = view.findViewById(R.id.editPesoExercicio);
        Button btnSalvar = view.findViewById(R.id.btnSalvarExercicio);

        if (exercicioExistente != null) {
            txtTitulo.setText(R.string.action_edit_exercise);
            editNome.setText(exercicioExistente.getNome());
            editDescricao.setText(exercicioExistente.getDescricao());
            editSeries.setText(exercicioExistente.getNumSeries());
            editRepeticao.setText(exercicioExistente.getRepeticoes());
            editPeso.setText(exercicioExistente.getPeso().replace(" kg", ""));
        }

        AlertDialog dialog = new AlertDialog.Builder(this).setView(view).create();
        btnSalvar.setOnClickListener(v -> {
            String nome = editNome.getText() != null ? editNome.getText().toString().trim() : "";
            String descricao = editDescricao.getText() != null ? editDescricao.getText().toString().trim() : "";
            String series = editSeries.getText() != null ? editSeries.getText().toString().trim() : "1";
            String repeticao = editRepeticao.getText() != null ? editRepeticao.getText().toString().trim() : "";
            String peso = editPeso.getText() != null ? editPeso.getText().toString().trim() : "0";

            if (nome.isEmpty()) {
                editNome.setError(getString(R.string.error_required));
                return;
            }

            if (repeticao.isEmpty()) {
                editRepeticao.setError(getString(R.string.error_required));
                return;
            }

            Exercicio exercicio = exercicioExistente != null
                    ? exercicioExistente
                    : new Exercicio(nome, descricao, series, repeticao, peso + " kg");

            exercicio.setNome(nome);
            exercicio.setDescricao(descricao);
            exercicio.setNumSeries(series);
            exercicio.setRepeticoes(repeticao);
            exercicio.setPeso(peso + " kg");

            supabaseClient.salvarExercicio(exercicio, new SupabaseClient.CadastroCallback() {
                @Override
                public void onSucesso() {
                    dialog.dismiss();
                    carregarExercicios();
                    Toast.makeText(
                            ExerciciosListaActivity.this,
                            R.string.success_exercise_saved,
                            Toast.LENGTH_SHORT
                    ).show();
                }

                @Override
                public void onErro(String mensagem) {
                    Toast.makeText(ExerciciosListaActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                }
            });
        });

        dialog.show();
    }

    @Override
    public void onEdit(Exercicio exercicio, int position) {
        showExercicioDialog(exercicio, position);
    }

    @Override
    public void onToggleSelection(Exercicio exercicio, int position) {}
}
