package br.edu.ifsp.olympiafitrix.util;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;

import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.model.AlunoRanking;

/** Mostra no ranking somente as informações públicas de outro aluno. */
public final class RankingDialogHelper {

    private RankingDialogHelper() {
    }

    public static void mostrar(Context context, AlunoRanking aluno) {
        View conteudo = LayoutInflater.from(context)
                .inflate(R.layout.dialog_aluno_ranking, null, false);
        ImageView foto = conteudo.findViewById(R.id.imgFotoDialogRanking);
        TextView nome = conteudo.findViewById(R.id.txtNomeDialogRanking);
        TextView score = conteudo.findViewById(R.id.txtScoreDialogRanking);

        nome.setText(aluno.getNome());
        score.setText(context.getString(R.string.score_value, aluno.getScoreFormatado()));
        FotoPerfilUtils.carregar(foto, aluno.getFotoUrl());

        new AlertDialog.Builder(context)
                .setView(conteudo)
                .setPositiveButton(R.string.action_close, null)
                .show();
    }
}
