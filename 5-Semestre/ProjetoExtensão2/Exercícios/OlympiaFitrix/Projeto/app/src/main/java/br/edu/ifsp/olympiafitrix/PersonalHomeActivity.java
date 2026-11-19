package br.edu.ifsp.olympiafitrix;

import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import br.edu.ifsp.olympiafitrix.adapter.TreinoAdapter;
import br.edu.ifsp.olympiafitrix.model.Treino;
import br.edu.ifsp.olympiafitrix.data.TreinoLocalStore;

/** Tela de trabalho do personal para consultar, criar, visualizar e atribuir treinos. */
public class PersonalHomeActivity extends BaseActivity implements TreinoAdapter.OnTreinoActionListener {

    private RecyclerView rvTreinosPersonal;
    private TreinoAdapter adapter;
    private TextInputEditText editFiltroDataTreino;
    private TextInputLayout layoutFiltroDataTreino;
    private final List<Treino> listaTreinos = new ArrayList<>();
    private final List<Treino> todosTreinos = new ArrayList<>();
    private SupabaseClient supabaseClient;
    private int idPersonal = -1;
    private String filtroData = "";
    private boolean ignorarProximoOnResume = false;

    private final ActivityResultLauncher<Intent> criarTreinoLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Treino treinoSalvo =
                            (Treino) result.getData().getSerializableExtra("treino_salvo");

                    if (treinoSalvo != null) {
                        adicionarOuAtualizarTreino(treinoSalvo);
                    }
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_personal_home);

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        idPersonal = prefs.getInt("idUsuario", -1);
        supabaseClient = new SupabaseClient(this);

        Button btnCriarNovoTreino = findViewById(R.id.btnCriarNovoTreino);
        Button btnLimparFiltroTreino = findViewById(R.id.btnLimparFiltroTreino);
        editFiltroDataTreino = findViewById(R.id.editFiltroDataTreino);
        layoutFiltroDataTreino = findViewById(R.id.layoutFiltroDataTreino);
        rvTreinosPersonal = findViewById(R.id.rvTreinosPersonal);

        adapter = new TreinoAdapter(listaTreinos, true, this);
        rvTreinosPersonal.setLayoutManager(new LinearLayoutManager(this));
        rvTreinosPersonal.setAdapter(adapter);

        btnCriarNovoTreino.setOnClickListener(v -> {
            Intent intent = new Intent(this, CriarTreinoActivity.class);
            criarTreinoLauncher.launch(intent);
        });

        editFiltroDataTreino.setOnClickListener(v -> abrirFiltroData());
        layoutFiltroDataTreino.setEndIconOnClickListener(v -> abrirFiltroData());
        btnLimparFiltroTreino.setOnClickListener(v -> {
            filtroData = "";
            editFiltroDataTreino.setText("");
            aplicarFiltro();
        });

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorPersonalHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuTreino);

        carregarTreinosSalvos();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (adapter != null) {
            if (ignorarProximoOnResume) {
                ignorarProximoOnResume = false;
                return;
            }
            carregarTreinosSalvos();
        }
    }

    private void adicionarOuAtualizarTreino(Treino treino) {
        if (idPersonal == -1) {
            Toast.makeText(this, "Sessão inválida.", Toast.LENGTH_SHORT).show();
            return;
        }

        int index = -1;
        for (int i = 0; i < todosTreinos.size(); i++) {
            if (todosTreinos.get(i).getId().equals(treino.getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            todosTreinos.set(index, treino);
        } else {
            todosTreinos.add(0, treino);
        }

        ignorarProximoOnResume = true;
        aplicarFiltro();
        rvTreinosPersonal.scrollToPosition(0);
    }

    private void carregarTreinosSalvos() {
        if (idPersonal == -1) {
            todosTreinos.clear();
            aplicarFiltro();
            return;
        }

        supabaseClient.buscarTreinosDoPersonal(idPersonal, new SupabaseClient.TreinosCallback() {
            @Override
            public void onSucesso(List<Treino> treinos) {
                todosTreinos.clear();
                todosTreinos.addAll(treinos);
                aplicarFiltro();
            }

            @Override
            public void onErro(String mensagem) {
                todosTreinos.clear();
                aplicarFiltro();
                Toast.makeText(PersonalHomeActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void aplicarFiltro() {
        listaTreinos.clear();
        for (Treino treino : todosTreinos) {
            if (filtroData.isEmpty() || filtroData.equals(treino.getData())) {
                listaTreinos.add(treino);
            }
        }
        adapter.notifyDataSetChanged();
    }

    private void abrirFiltroData() {
        Calendar c = Calendar.getInstance();
        DatePickerDialog dpd = new DatePickerDialog(this, (view, year, month, day) -> {
            filtroData = String.format(Locale.getDefault(), "%02d/%02d/%d", day, month + 1, year);
            editFiltroDataTreino.setText(filtroData);
            aplicarFiltro();
        }, c.get(Calendar.YEAR), c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH));
        dpd.show();
    }

    @Override
    public void onEdit(Treino treino, int position) {
        if (treino.isAtribuido()) {
            Intent intent = new Intent(this, CriarTreinoActivity.class);
            intent.putExtra("treino_visualizar", treino);
            intent.putExtra("somente_leitura", true);
            startActivity(intent);
            return;
        }

        Intent intent = new Intent(this, CriarTreinoActivity.class);
        intent.putExtra("treino_para_editar", treino);
        criarTreinoLauncher.launch(intent);
    }

    @Override
    public void onDelete(Treino treino, int position) {
        if (treino.isAtribuido()) {
            Toast.makeText(this, "Treinos atribuídos não podem ser apagados.", Toast.LENGTH_SHORT).show();
            return;
        }

        new AlertDialog.Builder(this)
                .setTitle(R.string.dialog_delete_title)
                .setMessage(getString(R.string.dialog_delete_message, treino.getNome()))
                .setPositiveButton(R.string.action_yes, (dialog, which) -> {
                    if (!TreinoLocalStore.removerSeNaoAtribuido(this, idPersonal, treino.getId())) {
                        Toast.makeText(this, "Treinos atribuídos não podem ser apagados.", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    listaTreinos.remove(position);
                    todosTreinos.removeIf(item -> item.getId().equals(treino.getId()));
                    adapter.notifyItemRemoved(position);
                    Toast.makeText(this, "Treino removido.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton(R.string.action_no, null)
                .show();
    }

    @Override
    public void onAssign(Treino treino) {
        Intent intent = new Intent(this, AtribuirTreinoActivity.class);
        intent.putExtra("treino", treino);
        startActivity(intent);
    }
}
