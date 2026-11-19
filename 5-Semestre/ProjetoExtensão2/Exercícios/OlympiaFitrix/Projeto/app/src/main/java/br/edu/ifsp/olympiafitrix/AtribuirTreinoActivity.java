package br.edu.ifsp.olympiafitrix;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import br.edu.ifsp.olympiafitrix.model.Treino;
import br.edu.ifsp.olympiafitrix.model.AlunoPersonal;
import br.edu.ifsp.olympiafitrix.data.TreinoLocalStore;
import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;

/** Seleciona alunos elegíveis e cria uma cópia completa do treino para cada um. */
public class AtribuirTreinoActivity extends BaseActivity {

    private RecyclerView rvAlunos;
    private TextView txtNomeTreino;
    private TextView txtTitulo;
    private Button btnEnviarTreino;
    private ProgressBar progressAtribuirTreino;
    private AlunosSelecionaveisAdapter adapter;
    private SupabaseClient supabaseClient;
    private Treino treino;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_atribuir_treino);

        treino = (Treino) getIntent().getSerializableExtra("treino");
        supabaseClient = new SupabaseClient(this);

        txtTitulo = findViewById(R.id.txtTituloAtribuir);
        txtNomeTreino = findViewById(R.id.txtNomeTreinoAtribuir);
        rvAlunos = findViewById(R.id.rvAlunosAtribuir);
        btnEnviarTreino = findViewById(R.id.btnEnviarTreino);
        progressAtribuirTreino = findViewById(R.id.progressAtribuirTreino);
        findViewById(R.id.btnVoltarAtribuir).setOnClickListener(v -> finish());

        txtTitulo.setText(R.string.ui_atribuir_treino);
        if (treino != null) {
            txtNomeTreino.setText(getString(R.string.workout_value, treino.getNome()));
        }

        adapter = new AlunosSelecionaveisAdapter(new ArrayList<>());
        rvAlunos.setLayoutManager(new LinearLayoutManager(this));
        rvAlunos.setAdapter(adapter);

        btnEnviarTreino.setOnClickListener(v -> enviarTreino());
        carregarAlunosVinculados();
    }

    private void carregarAlunosVinculados() {
        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        int idPersonal = prefs.getInt("idPersonal", -1);

        if (idPersonal == -1) {
            Toast.makeText(this, R.string.error_trainer_session, Toast.LENGTH_SHORT).show();
            return;
        }

        supabaseClient.buscarAlunosVinculadosPersonal(idPersonal, new SupabaseClient.AlunosPersonalCallback() {
            @Override
            public void onSucesso(List<AlunoPersonal> alunos) {
                filtrarAlunosQueAindaNaoReceberamTreino(idPersonal, alunos);
            }

            @Override
            public void onErro(String mensagem) {
                Toast.makeText(AtribuirTreinoActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void filtrarAlunosQueAindaNaoReceberamTreino(int idPersonal, List<AlunoPersonal> alunos) {
        supabaseClient.buscarIdsAlunosComTreinoAtribuido(idPersonal, treino, new SupabaseClient.IdsAlunosCallback() {
            @Override
            public void onSucesso(List<Integer> idsAlunosJaAtribuidos) {
                Set<Integer> bloqueados = new HashSet<>(idsAlunosJaAtribuidos);
                List<AlunoPersonal> disponiveis = new ArrayList<>();

                for (AlunoPersonal aluno : alunos) {
                    if (!bloqueados.contains(aluno.getIdAluno())) {
                        disponiveis.add(aluno);
                    }
                }

                adapter.atualizar(disponiveis);
                if (disponiveis.isEmpty()) {
                    Toast.makeText(
                            AtribuirTreinoActivity.this,
                            alunos.isEmpty()
                                    ? getString(R.string.no_connected_students)
                                    : getString(R.string.all_students_already_assigned),
                            Toast.LENGTH_LONG
                    ).show();
                }
            }

            @Override
            public void onErro(String mensagem) {
                Toast.makeText(AtribuirTreinoActivity.this, mensagem, Toast.LENGTH_SHORT).show();
                adapter.atualizar(alunos);
            }
        });
    }

    private void enviarTreino() {
        List<Integer> alunosSelecionados = adapter.getIdsSelecionados();
        if (alunosSelecionados.isEmpty()) {
            Toast.makeText(this, R.string.error_select_student, Toast.LENGTH_SHORT).show();
            return;
        }

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        int idPersonal = prefs.getInt("idPersonal", -1);
        if (idPersonal == -1) {
            Toast.makeText(this, R.string.error_trainer_session, Toast.LENGTH_SHORT).show();
            return;
        }

        setCarregando(true);
        atribuirProximoAluno(
                alunosSelecionados,
                0,
                idPersonal,
                treino != null ? treino.getNome() : getString(R.string.your_workout_name),
                new ResultadoAtribuicao()
        );
    }

    private void atribuirProximoAluno(
            List<Integer> alunosSelecionados,
            int index,
            int idPersonal,
            String nomeTreino,
            ResultadoAtribuicao resultado
    ) {
        // Processa um aluno por vez para evitar envios duplicados e registrar falhas parciais com clareza.
        if (index >= alunosSelecionados.size()) {
            finalizarAtribuicao(alunosSelecionados.size(), resultado);
            return;
        }

        int idAluno = alunosSelecionados.get(index);
        btnEnviarTreino.setText(getString(
                R.string.state_assigning_count, index + 1, alunosSelecionados.size()));

        supabaseClient.salvarTreinoAtribuido(idAluno, idPersonal, treino, new SupabaseClient.CadastroCallback() {
            @Override
            public void onSucesso() {
                enviarNotificacaoEContinuar(alunosSelecionados, index, idPersonal, nomeTreino, resultado);
            }

            @Override
            public void onErro(String mensagem) {
                resultado.falhasAtribuicao++;
                if (resultado.primeiraFalha.isEmpty()) {
                    resultado.primeiraFalha = mensagem;
                }
                atribuirProximoAluno(alunosSelecionados, index + 1, idPersonal, nomeTreino, resultado);
            }
        });
    }

    private void enviarNotificacaoEContinuar(
            List<Integer> alunosSelecionados,
            int index,
            int idPersonal,
            String nomeTreino,
            ResultadoAtribuicao resultado
    ) {
        int idAluno = alunosSelecionados.get(index);
        supabaseClient.enviarNotificacaoTreinoAtribuido(idAluno, idPersonal, nomeTreino, new SupabaseClient.CadastroCallback() {
            @Override
            public void onSucesso() {
                atribuirProximoAluno(alunosSelecionados, index + 1, idPersonal, nomeTreino, resultado);
            }

            @Override
            public void onErro(String mensagem) {
                resultado.falhasNotificacao++;
                atribuirProximoAluno(alunosSelecionados, index + 1, idPersonal, nomeTreino, resultado);
            }
        });
    }

    private void finalizarAtribuicao(int totalSelecionados, ResultadoAtribuicao resultado) {
        setCarregando(false);

        if (resultado.falhasAtribuicao > 0) {
            String detalhe = resultado.primeiraFalha.isEmpty()
                    ? ""
                    : getString(R.string.error_detail, resultado.primeiraFalha);
            Toast.makeText(
                    this,
                    getString(
                            R.string.error_assignment_count,
                            resultado.falhasAtribuicao,
                            totalSelecionados,
                            detalhe
                    ),
                    Toast.LENGTH_LONG
            ).show();
            return;
        }

        marcarTreinoComoAtribuido();
        if (resultado.falhasNotificacao > 0) {
            Toast.makeText(
                    this,
                    R.string.warning_assignment_notification,
                    Toast.LENGTH_SHORT
            ).show();
            finish();
            return;
        }

        Toast.makeText(
                this,
                getString(R.string.success_workout_assigned, totalSelecionados),
                Toast.LENGTH_SHORT
        ).show();
        finish();
    }

    private void setCarregando(boolean carregando) {
        btnEnviarTreino.setEnabled(!carregando);
        if (!carregando) {
            btnEnviarTreino.setText(R.string.action_send_workout);
        }
        rvAlunos.setEnabled(!carregando);
        progressAtribuirTreino.setVisibility(carregando ? View.VISIBLE : View.GONE);
    }

    private void marcarTreinoComoAtribuido() {
        if (treino == null) {
            return;
        }

        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        int idPersonal = prefs.getInt("idUsuario", -1);
        if (idPersonal != -1) {
            treino.setAtribuido(true);
            TreinoLocalStore.marcarAtribuido(this, idPersonal, treino.getId());
        }
    }

    private static class ResultadoAtribuicao {
        int falhasAtribuicao = 0;
        int falhasNotificacao = 0;
        String primeiraFalha = "";
    }

    private static class AlunosSelecionaveisAdapter
            extends RecyclerView.Adapter<AlunosSelecionaveisAdapter.ViewHolder> {

        private final List<AlunoPersonal> alunos;
        private final Set<Integer> selecionados = new HashSet<>();

        AlunosSelecionaveisAdapter(List<AlunoPersonal> alunos) {
            this.alunos = alunos;
        }

        void atualizar(List<AlunoPersonal> novosAlunos) {
            alunos.clear();
            alunos.addAll(novosAlunos);
            selecionados.clear();
            notifyDataSetChanged();
        }

        List<Integer> getIdsSelecionados() {
            return new ArrayList<>(selecionados);
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_aluno_vinculado, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            AlunoPersonal aluno = alunos.get(position);
            boolean selecionado = selecionados.contains(aluno.getIdAluno());

            holder.txtNomeAluno.setText(aluno.getNome());
            holder.txtInfoAluno.setText(holder.itemView.getContext().getString(
                    R.string.score_label_value, String.valueOf(aluno.getScore())));
            FotoPerfilUtils.carregar(holder.imgFotoAluno, aluno.getFotoUrl());
            holder.checkSelecionado.setChecked(selecionado);

            holder.itemView.setOnClickListener(v -> alternar(aluno, holder));
            holder.checkSelecionado.setOnClickListener(v -> alternar(aluno, holder));
        }

        private void alternar(AlunoPersonal aluno, ViewHolder holder) {
            int idAluno = aluno.getIdAluno();
            if (selecionados.contains(idAluno)) {
                selecionados.remove(idAluno);
                holder.checkSelecionado.setChecked(false);
            } else {
                selecionados.add(idAluno);
                holder.checkSelecionado.setChecked(true);
            }
        }

        @Override
        public int getItemCount() {
            return alunos.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            TextView txtNomeAluno;
            TextView txtInfoAluno;
            CheckBox checkSelecionado;
            android.widget.ImageView imgFotoAluno;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                txtNomeAluno = itemView.findViewById(R.id.txtNomeAluno);
                txtInfoAluno = itemView.findViewById(R.id.txtInfoAluno);
                checkSelecionado = itemView.findViewById(R.id.checkSelecionado);
                imgFotoAluno = itemView.findViewById(R.id.imgFotoAluno);
                checkSelecionado.setVisibility(View.VISIBLE);
            }
        }
    }
}
