package br.edu.ifsp.olympiafitrix.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.model.Exercicio;

public class ExercicioAdapter extends RecyclerView.Adapter<ExercicioAdapter.ExercicioViewHolder> {

    private final List<Exercicio> exercicios;
    private final OnExercicioActionListener listener;
    private boolean selectionMode = false;
    private boolean isReadOnly = false;

    public interface OnExercicioActionListener {
        void onEdit(Exercicio exercicio, int position);
        void onToggleSelection(Exercicio exercicio, int position);
    }

    public ExercicioAdapter(List<Exercicio> exercicios, OnExercicioActionListener listener) {
        this.exercicios = exercicios;
        this.listener = listener;
    }

    public void setSelectionMode(boolean selectionMode) {
        this.selectionMode = selectionMode;
        this.isReadOnly = false;
        notifyDataSetChanged();
    }

    public void setReadOnly(boolean readOnly) {
        this.isReadOnly = readOnly;
        this.selectionMode = false;
        notifyDataSetChanged();
    }

    public boolean isSelectionMode() {
        return selectionMode;
    }

    @NonNull
    @Override
    public ExercicioViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_exercicio, parent, false);
        return new ExercicioViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ExercicioViewHolder holder, int position) {
        Exercicio exercicio = exercicios.get(position);
        holder.txtNome.setText(exercicio.getNome());
        holder.txtDescricao.setText(exercicio.getDescricao());
        holder.txtSeries.setText(holder.itemView.getContext().getString(
                R.string.sets_value, exercicio.getNumSeries()));
        holder.txtRepeticoes.setText(holder.itemView.getContext().getString(
                R.string.reps_value, exercicio.getRepeticoes()));
        holder.txtPeso.setText(exercicio.getPeso());

        if (isReadOnly) {
            holder.btnEditar.setVisibility(View.GONE);
            holder.checkBox.setVisibility(View.GONE);
        } else if (selectionMode) {
            holder.btnEditar.setVisibility(View.GONE);
            holder.checkBox.setVisibility(View.VISIBLE);
            holder.checkBox.setChecked(exercicio.isSelected());
        } else {
            holder.btnEditar.setVisibility(View.VISIBLE);
            holder.checkBox.setVisibility(View.GONE);
        }

        holder.btnEditar.setOnClickListener(v -> {
            if (listener != null) listener.onEdit(exercicio, position);
        });
        
        holder.checkBox.setOnClickListener(v -> {
            exercicio.setSelected(holder.checkBox.isChecked());
            if (listener != null) listener.onToggleSelection(exercicio, position);
        });

        holder.itemView.setOnClickListener(v -> {
            if (selectionMode) {
                holder.checkBox.setChecked(!holder.checkBox.isChecked());
                exercicio.setSelected(holder.checkBox.isChecked());
                if (listener != null) listener.onToggleSelection(exercicio, position);
            }
        });
    }

    @Override
    public int getItemCount() {
        return exercicios.size();
    }

    static class ExercicioViewHolder extends RecyclerView.ViewHolder {
        TextView txtNome, txtDescricao, txtSeries, txtRepeticoes, txtPeso;
        ImageButton btnEditar;
        CheckBox checkBox;

        public ExercicioViewHolder(@NonNull View itemView) {
            super(itemView);
            txtNome = itemView.findViewById(R.id.txtNomeExercicioItem);
            txtDescricao = itemView.findViewById(R.id.txtDescricaoExercicioItem);
            txtSeries = itemView.findViewById(R.id.txtSeriesExercicioItem);
            txtRepeticoes = itemView.findViewById(R.id.txtRepeticoesExercicioItem);
            txtPeso = itemView.findViewById(R.id.txtPesoExercicioItem);
            btnEditar = itemView.findViewById(R.id.btnEditarExercicioItem);
            checkBox = itemView.findViewById(R.id.checkExercicio);
        }
    }
}
