package br.edu.ifsp.olympiafitrix.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.util.TextoDominio;
import br.edu.ifsp.olympiafitrix.model.Treino;

public class TreinoAdapter extends RecyclerView.Adapter<TreinoAdapter.TreinoViewHolder> {

    public static final int MODO_ALUNO = 0;
    public static final int MODO_PERSONAL = 1;
    public static final int MODO_HISTORICO_PERSONAL = 2;
    public static final int MODO_HISTORICO_ALUNO = 3;

    private final List<Treino> treinos;
    private final OnTreinoActionListener listener;
    private final int modo;

    public interface OnTreinoActionListener {
        void onEdit(Treino treino, int position);
        void onDelete(Treino treino, int position);
        void onAssign(Treino treino);
        default void onStart(Treino treino) {}
        default void onDismiss(Treino treino, int position) {}
    }

    public TreinoAdapter(List<Treino> treinos, boolean isPersonal, OnTreinoActionListener listener) {
        this(treinos, isPersonal ? MODO_PERSONAL : MODO_ALUNO, listener);
    }

    public TreinoAdapter(List<Treino> treinos, int modo, OnTreinoActionListener listener) {
        this.treinos = treinos;
        this.modo = modo;
        this.listener = listener;
    }

    @NonNull
    @Override
    public TreinoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_treino_personal, parent, false);
        return new TreinoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull TreinoViewHolder holder, int position) {
        holder.bind(treinos.get(position), modo, listener, position);
    }

    @Override
    public int getItemCount() {
        return treinos.size();
    }

    static class TreinoViewHolder extends RecyclerView.ViewHolder {
        private final TextView txtNome, txtData, txtDescricao, txtExercicios, txtInfoExtraLabel, txtInfoExtraValue;
        private final LinearLayout layoutButtonsPersonal, layoutButtonsAluno;
        private final Button btnEditar, btnDeletar, btnAtribuir, btnIniciar, btnDispensar;

        TreinoViewHolder(@NonNull View itemView) {
            super(itemView);
            txtNome = itemView.findViewById(R.id.txtNomeTreinoItem);
            txtData = itemView.findViewById(R.id.txtDataTreinoItem);
            txtDescricao = itemView.findViewById(R.id.txtDescricaoTreinoItem);
            txtExercicios = itemView.findViewById(R.id.txtExerciciosCountItem);
            txtInfoExtraLabel = itemView.findViewById(R.id.lblInfoExtraItem);
            txtInfoExtraValue = itemView.findViewById(R.id.txtInfoExtraValueItem);
            layoutButtonsPersonal = itemView.findViewById(R.id.layoutButtonsPersonal);
            layoutButtonsAluno = itemView.findViewById(R.id.layoutButtonsAluno);
            btnEditar = itemView.findViewById(R.id.btnEditarTreino);
            btnDeletar = itemView.findViewById(R.id.btnDeletarTreino);
            btnAtribuir = itemView.findViewById(R.id.btnAtribuirTreino);
            btnIniciar = itemView.findViewById(R.id.btnIniciarTreinoItem);
            btnDispensar = itemView.findViewById(R.id.btnDispensarTreinoItem);
        }

        void bind(Treino treino, int modo, OnTreinoActionListener listener, int position) {
            txtNome.setText(treino.getNome());
            txtData.setText(formatarDataBrasileira(treino.getData()));
            txtDescricao.setText(treino.getDescricao());

            int numExercicios = treino.getListaExercicios() != null ? treino.getListaExercicios().size() : 0;
            txtExercicios.setText(String.valueOf(numExercicios));

            if (modo == MODO_PERSONAL) {
                layoutButtonsPersonal.setVisibility(View.VISIBLE);
                layoutButtonsAluno.setVisibility(View.GONE);
                btnEditar.setVisibility(View.VISIBLE);
                btnDeletar.setVisibility(treino.isAtribuido() ? View.GONE : View.VISIBLE);
                btnEditar.setText(treino.isAtribuido() ? R.string.action_view : R.string.action_edit);
                btnAtribuir.setText(R.string.action_assign);
                txtInfoExtraLabel.setText(R.string.level_label);
                txtInfoExtraValue.setText(TextoDominio.nivel(itemView.getContext(), treino.getNivel()));
            } else if (modo == MODO_HISTORICO_PERSONAL) {
                layoutButtonsPersonal.setVisibility(View.VISIBLE);
                layoutButtonsAluno.setVisibility(View.GONE);
                btnEditar.setVisibility(View.GONE);
                btnDeletar.setVisibility(View.GONE);
                btnAtribuir.setText(R.string.action_view_workout);
                txtInfoExtraLabel.setText(R.string.status_label);
                txtInfoExtraValue.setText(formatarStatus(treino.getStatus()));
            } else if (modo == MODO_HISTORICO_ALUNO) {
                layoutButtonsPersonal.setVisibility(View.VISIBLE);
                layoutButtonsAluno.setVisibility(View.GONE);
                btnEditar.setVisibility(View.GONE);
                btnDeletar.setVisibility(View.GONE);
                btnAtribuir.setText(R.string.action_view_workout);
                txtDescricao.setText(formatarDescricaoHistoricoAluno(treino));
                txtInfoExtraLabel.setText(R.string.status_label);
                txtInfoExtraValue.setText(formatarStatus(treino.getStatus()));
            } else {
                layoutButtonsPersonal.setVisibility(View.GONE);
                layoutButtonsAluno.setVisibility(View.VISIBLE);
                txtInfoExtraLabel.setText(R.string.status_label);
                txtInfoExtraValue.setText(formatarStatus(treino.getStatus()));
            }

            btnEditar.setOnClickListener(v -> listener.onEdit(treino, position));
            btnDeletar.setOnClickListener(v -> listener.onDelete(treino, position));
            btnAtribuir.setOnClickListener(v -> listener.onAssign(treino));
            btnIniciar.setOnClickListener(v -> listener.onStart(treino));
            btnDispensar.setOnClickListener(v -> listener.onDismiss(treino, position));
        }

        private String formatarStatus(String status) {
            if (status == null || status.trim().isEmpty()) {
                return itemView.getContext().getString(R.string.status_pending);
            }
            return TextoDominio.status(itemView.getContext(), status);
        }

        private String formatarDescricaoHistoricoAluno(Treino treino) {
            String descricao = treino.getDescricao() != null ? treino.getDescricao().trim() : "";
            String nomePersonal = treino.getNomePersonal() != null && !treino.getNomePersonal().trim().isEmpty()
                    ? treino.getNomePersonal().trim()
                    : itemView.getContext().getString(R.string.generic_trainer);

            if (descricao.isEmpty()) {
                return itemView.getContext().getString(R.string.trainer_value, nomePersonal);
            }

            return descricao + "\n"
                    + itemView.getContext().getString(R.string.trainer_value, nomePersonal);
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
            String[] formatosEntrada = {
                    "yyyy-MM-dd",
                    "yyyy/MM/dd",
                    "dd-MM-yyyy"
            };

            for (String formato : formatosEntrada) {
                try {
                    Date dataParseada = new SimpleDateFormat(formato, Locale.US).parse(apenasData);
                    if (dataParseada != null) {
                        return new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(dataParseada);
                    }
                } catch (Exception ignored) {
                    // Tenta o proximo formato conhecido.
                }
            }

            return valor;
        }
    }
}
