package br.edu.ifsp.olympiafitrix.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RadioButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.util.TextoDominio;
import br.edu.ifsp.olympiafitrix.model.Nivel;

public class NivelAdapter extends RecyclerView.Adapter<NivelAdapter.NivelViewHolder> {

    private final List<Nivel> niveis;
    private int selectedPosition = -1;

    public NivelAdapter(List<Nivel> niveis) {
        this.niveis = niveis;
    }

    public Nivel getSelectedNivel() {
        if (selectedPosition != -1) {
            return niveis.get(selectedPosition);
        }
        return null;
    }

    @NonNull
    @Override
    public NivelViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_nivel, parent, false);
        return new NivelViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NivelViewHolder holder, int position) {
        Nivel nivel = niveis.get(position);
        holder.txtNome.setText(TextoDominio.nivel(holder.itemView.getContext(), nivel.getNome()));
        holder.txtDescricao.setText(TextoDominio.descricaoNivel(
                holder.itemView.getContext(), nivel.getNome(), nivel.getDescricao()));
        holder.radioButton.setChecked(position == selectedPosition);

        View.OnClickListener clickListener = v -> {
            selectedPosition = holder.getAdapterPosition();
            notifyDataSetChanged();
        };

        holder.itemView.setOnClickListener(clickListener);
        holder.radioButton.setOnClickListener(clickListener);
    }

    @Override
    public int getItemCount() {
        return niveis.size();
    }

    static class NivelViewHolder extends RecyclerView.ViewHolder {
        TextView txtNome, txtDescricao;
        RadioButton radioButton;

        public NivelViewHolder(@NonNull View itemView) {
            super(itemView);
            txtNome = itemView.findViewById(R.id.txtNomeNivelItem);
            txtDescricao = itemView.findViewById(R.id.txtDescricaoNivelItem);
            radioButton = itemView.findViewById(R.id.radioNivel);
        }
    }
}
