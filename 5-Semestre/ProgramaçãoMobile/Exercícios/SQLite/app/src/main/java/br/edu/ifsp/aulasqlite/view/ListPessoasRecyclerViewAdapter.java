package br.edu.ifsp.aulasqlite.view;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import br.edu.ifsp.aulasqlite.R;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

public class ListPessoasRecyclerViewAdapter extends RecyclerView.Adapter<ListPessoasRecyclerViewAdapter.ViewHolder> {

    private ArrayList<Pessoa> mArray;
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onEditarClick(Integer pos);
        void onExcluirClick(Integer pos);
    }

    public void setClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    public ListPessoasRecyclerViewAdapter(ArrayList<Pessoa> arrPessoas) {
        this.mArray = arrPessoas;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {

        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.pessoa_layout, parent, false);

        return new ViewHolder(view);

    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {

        Pessoa p = mArray.get(position);
        holder.getTextViewNome().setText(p.getNome());
        holder.getTextViewCpf().setText(p.getCpf());
        holder.getTextViewEmail().setText(p.getEmail());

        holder.getBtnEditar()
                .setOnClickListener(v -> listener.onEditarClick(position));

        holder.btnExcluir
                .setOnClickListener(v -> listener.onExcluirClick(position));

    }

    @Override
    public int getItemCount() {
        return mArray.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {


        private TextView tvNome, tvCpf, tvEmail;
        private ImageButton btnEditar, btnExcluir;


        public ViewHolder(View view) {
            super(view);

            tvNome = view.findViewById(R.id.tvNomePessoa);
            tvNome.setTextColor(Color.parseColor("#FFFFFF"));

            tvCpf = view.findViewById(R.id.tvCpfPessoa);
            tvCpf.setTextColor(Color.parseColor("#FFFFFF"));

            tvEmail = view.findViewById(R.id.tvEmailPessoa);
            tvEmail.setTextColor(Color.parseColor("#FFFFFF"));

            btnEditar = view.findViewById(R.id.btnEditarPessoa);
            btnExcluir = view.findViewById(R.id.btnExcluirPessoa);
        }

        public TextView getTextViewNome() {
            return this.tvNome;
        }

        public TextView getTextViewCpf() {
            return this.tvCpf;
        }

        public TextView getTextViewEmail() {
            return this.tvEmail;
        }

        public ImageButton getBtnEditar() {
            return this.btnEditar;
        }

        public ImageButton getBtnExcluir() {
            return this.btnExcluir;
        }

    }

}
