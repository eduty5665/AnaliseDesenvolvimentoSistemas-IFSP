package br.edu.ifsp.olympiafitrix.adapter;

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
import br.edu.ifsp.olympiafitrix.util.RankingDialogHelper;
import br.edu.ifsp.olympiafitrix.RankingPersonalActivity;
import br.edu.ifsp.olympiafitrix.model.AlunoRanking;

/** Renderiza as posições posteriores ao pódio e respeita o nível de acesso de cada perfil. */
public class RankingPersonalAdapter extends RecyclerView.Adapter<RankingPersonalAdapter.RankingViewHolder> {

    private final List<AlunoRanking> alunos;

    public RankingPersonalAdapter(List<AlunoRanking> alunos) {
        this.alunos = alunos;
    }

    @NonNull
    @Override
    public RankingViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater
                .from(parent.getContext())
                .inflate(R.layout.item_ranking, parent, false);

        return new RankingViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull RankingViewHolder holder, int position) {
        AlunoRanking aluno = alunos.get(position);

        int posicaoReal = position + 4;

        holder.txtPosicaoRanking.setText(holder.itemView.getContext().getString(
                R.string.position_value, posicaoReal));
        holder.txtNomeRanking.setText(aluno.getNome());
        holder.txtScoreRanking.setText(holder.itemView.getContext().getString(
                R.string.score_value, aluno.getScoreFormatado()));
        FotoPerfilUtils.carregar(holder.imgFotoRanking, aluno.getFotoUrl());
        holder.itemView.setOnClickListener(v -> {
            // Alunos veem somente dados públicos; o personal pode abrir o cadastro completo.
            if (!(v.getContext() instanceof RankingPersonalActivity)) {
                RankingDialogHelper.mostrar(v.getContext(), aluno);
                return;
            }
            Intent intent = new Intent(v.getContext(), DetalheAlunoPersonalActivity.class);
            intent.putExtra("id_aluno", aluno.getIdAluno());
            intent.putExtra("vinculado", true);
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return alunos.size();
    }

    static class RankingViewHolder extends RecyclerView.ViewHolder {

        TextView txtPosicaoRanking;
        TextView txtNomeRanking;
        TextView txtScoreRanking;
        ImageView imgFotoRanking;

        public RankingViewHolder(@NonNull View itemView) {
            super(itemView);

            txtPosicaoRanking = itemView.findViewById(R.id.txtPosicaoRanking);
            txtNomeRanking = itemView.findViewById(R.id.txtNomeRanking);
            txtScoreRanking = itemView.findViewById(R.id.txtScoreRanking);
            imgFotoRanking = itemView.findViewById(R.id.imgFotoRanking);
        }
    }
}
