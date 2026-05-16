package br.edu.ifsp.aulafirebase2026.view;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.Locale;

import br.edu.ifsp.aulafirebase2026.R;
import br.edu.ifsp.aulafirebase2026.model.entity.Carro;

public class ListCarroRecyclerViewAdapter extends RecyclerView.Adapter<ListCarroRecyclerViewAdapter.ViewHolder> {


    private ArrayList<Carro> lista;

    private CarrosListener listener;
    private CarrosLongListener longlistener;

    interface CarrosListener {
        void onItemClick(int pos);
    }

    interface CarrosLongListener {
        void onItemLongClick(int pos);
    }

    public void setClickListener(CarrosListener _listener) {
        this.listener = _listener;
    }

    public void setLongClickListener(CarrosLongListener _longlistener) {
        this.longlistener = _longlistener;
    }

    public ListCarroRecyclerViewAdapter(ArrayList<Carro> list) {
        this.lista = list;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {

        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_carro_layout, parent, false);


        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {

        Carro c = lista.get(position);
        holder.getTextViewNomeCarro().setText(c.getNome());
        holder.getTextViewAnoCarro().setText(String.valueOf(c.getAno()));
        Locale locBR = new Locale("pt", "BR");
        holder.getTextViewValorCarro().setText(String.format(locBR,"%,.2f", c.getValor()));

        if(c.isVendido()) {
            holder.getImageViewVendidoCarro().setImageResource(R.mipmap.ic_sold);
        }
        else {
            holder.getImageViewVendidoCarro().setImageResource(R.mipmap.ic_for_sale);
        }
    }

    @Override
    public int getItemCount() {
        return lista.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {

        private TextView tvNome;
        private TextView tvAno;
        private TextView tvValor;
        private ImageView ivVendido;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);

            tvNome = itemView.findViewById(R.id.tvNomeCarro);
            tvAno = itemView.findViewById(R.id.tvAnoCarro);
            tvValor = itemView.findViewById(R.id.tvValorCarro);
            ivVendido = itemView.findViewById(R.id.ivVendidoCarro);

            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    listener.onItemClick(getBindingAdapterPosition());
                }
            });

            itemView.setOnLongClickListener(new View.OnLongClickListener() {
                @Override
                public boolean onLongClick(View v) {
                    longlistener.onItemLongClick(getBindingAdapterPosition());
                    return true;
                }
            });

        }

        public TextView getTextViewNomeCarro() {
            return this.tvNome;
        }
        public TextView getTextViewAnoCarro() {
            return this.tvAno;
        }
        public TextView getTextViewValorCarro() {
            return this.tvValor;
        }
        public ImageView getImageViewVendidoCarro() {
            return this.ivVendido;
        }
    }

}
