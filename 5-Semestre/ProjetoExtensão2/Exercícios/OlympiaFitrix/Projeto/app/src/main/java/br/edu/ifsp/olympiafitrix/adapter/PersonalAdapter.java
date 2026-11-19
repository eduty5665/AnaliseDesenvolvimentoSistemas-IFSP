package br.edu.ifsp.olympiafitrix.adapter;

import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.ImageView;
import android.content.res.ColorStateList;
import android.graphics.Color;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.card.MaterialCardView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.DetalhePersonalActivity;
import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;
import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.model.Personal;

/** Lista personais disponíveis e destaca aquele que já está vinculado ao aluno. */
public class PersonalAdapter extends RecyclerView.Adapter<PersonalAdapter.PersonalViewHolder> {

    private final List<Personal> listaPersonais;

    public PersonalAdapter(List<Personal> listaPersonais) {
        this.listaPersonais = listaPersonais;
    }

    @NonNull
    @Override
    public PersonalViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater
                .from(parent.getContext())
                .inflate(R.layout.item_personal, parent, false);

        return new PersonalViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PersonalViewHolder holder, int position) {
        Personal personal = listaPersonais.get(position);

        holder.txtNomePersonal.setText(personal.getNome());
        holder.txtCrefPersonal.setText(holder.itemView.getContext().getString(
                R.string.cref_value, personal.getCref()));
        holder.txtTelefonePersonal.setText(holder.itemView.getContext().getString(
                R.string.phone_value, personal.getTelefone()));
        FotoPerfilUtils.carregar(holder.imgFotoPersonal, personal.getFotoUrl());

        if (personal.isVinculado()) {
            holder.txtStatusVinculado.setVisibility(View.VISIBLE);
            holder.cardPersonal.setStrokeColor(Color.parseColor("#FFD700"));
            holder.cardPersonal.setStrokeWidth(3);
        } else {
            holder.txtStatusVinculado.setVisibility(View.GONE);
            holder.cardPersonal.setStrokeColor(Color.parseColor("#444444"));
            holder.cardPersonal.setStrokeWidth(1);
        }

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), DetalhePersonalActivity.class);
            intent.putExtra("id_personal", personal.getIdPersonal());
            intent.putExtra("personal_vinculado", personal.isVinculado());
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return listaPersonais.size();
    }

    static class PersonalViewHolder extends RecyclerView.ViewHolder {

        MaterialCardView cardPersonal;
        TextView txtStatusVinculado;
        TextView txtNomePersonal;
        TextView txtCrefPersonal;
        TextView txtTelefonePersonal;
        ImageView imgFotoPersonal;

        public PersonalViewHolder(@NonNull View itemView) {
            super(itemView);

            cardPersonal = itemView.findViewById(R.id.cardPersonal);
            txtStatusVinculado = itemView.findViewById(R.id.txtStatusVinculado);
            txtNomePersonal = itemView.findViewById(R.id.txtNomePersonal);
            txtCrefPersonal = itemView.findViewById(R.id.txtCrefPersonal);
            txtTelefonePersonal = itemView.findViewById(R.id.txtTelefonePersonal);
            imgFotoPersonal = itemView.findViewById(R.id.imgFotoPersonal);
        }
    }
}
