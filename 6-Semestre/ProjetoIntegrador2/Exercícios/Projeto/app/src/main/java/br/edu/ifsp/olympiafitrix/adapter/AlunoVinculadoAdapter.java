package br.edu.ifsp.olympiafitrix.adapter;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.DetalheAlunoPersonalActivity;
import br.edu.ifsp.olympiafitrix.util.FotoPerfilUtils;
import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.model.AlunoPersonal;

/** Exibe os alunos vinculados e encaminha o toque para o perfil completo. */
public class AlunoVinculadoAdapter extends RecyclerView.Adapter<AlunoVinculadoAdapter.ViewHolder> {

    private List<AlunoPersonal> alunos;
    private Context context;

    public AlunoVinculadoAdapter(List<AlunoPersonal> alunos, Context context) {
        this.alunos = alunos;
        this.context = context;
    }

    @NonNull
    @Override
    public AlunoVinculadoAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_aluno_vinculado, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull AlunoVinculadoAdapter.ViewHolder holder, int position) {
        AlunoPersonal aluno = alunos.get(position);

        holder.txtNomeAluno.setText(aluno.getNome());
        holder.txtInfoAluno.setText(context.getString(
                R.string.score_label_value, String.valueOf(aluno.getScore())));
        FotoPerfilUtils.carregar(holder.imgFotoAluno, aluno.getFotoUrl());

        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(context, DetalheAlunoPersonalActivity.class);
            intent.putExtra("id_aluno", aluno.getIdAluno());
            intent.putExtra("vinculado", true);
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return alunos.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {

        TextView txtNomeAluno;
        TextView txtInfoAluno;
        ImageView imgFotoAluno;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);

            txtNomeAluno = itemView.findViewById(R.id.txtNomeAluno);
            txtInfoAluno = itemView.findViewById(R.id.txtInfoAluno);
            imgFotoAluno = itemView.findViewById(R.id.imgFotoAluno);
        }
    }
}
