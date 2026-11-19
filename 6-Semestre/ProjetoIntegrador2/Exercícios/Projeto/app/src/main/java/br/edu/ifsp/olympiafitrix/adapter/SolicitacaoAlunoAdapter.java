package br.edu.ifsp.olympiafitrix.adapter;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.DetalheAlunoPersonalActivity;
import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.SupabaseClient;
import br.edu.ifsp.olympiafitrix.model.AlunoPersonal;

/** Controla a aprovação e recusa das solicitações de vínculo recebidas pelo personal. */
public class SolicitacaoAlunoAdapter extends RecyclerView.Adapter<SolicitacaoAlunoAdapter.ViewHolder> {

    private List<AlunoPersonal> alunos;
    private Context context;
    private int idPersonal;
    private Runnable aoAtualizar;

    public SolicitacaoAlunoAdapter(
            List<AlunoPersonal> alunos,
            Context context,
            int idPersonal,
            Runnable aoAtualizar
    ) {
        this.alunos = alunos;
        this.context = context;
        this.idPersonal = idPersonal;
        this.aoAtualizar = aoAtualizar;
    }

    @NonNull
    @Override
    public SolicitacaoAlunoAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_solicitacao_aluno, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SolicitacaoAlunoAdapter.ViewHolder holder, int position) {
        AlunoPersonal aluno = alunos.get(position);

        holder.txtNomeAluno.setText(aluno.getNome());
        holder.txtInfoAluno.setText(R.string.request_connection);

        holder.layoutInfoAluno.setOnClickListener(v -> abrirPerfil(aluno, false));
        holder.itemView.setOnClickListener(v -> abrirPerfil(aluno, false));

        holder.btnAceitar.setOnClickListener(v -> {
            SupabaseClient supabaseClient = new SupabaseClient(context);

            supabaseClient.aceitarSolicitacaoVinculo(
                    aluno.getIdSolicitacao(),
                    aluno.getIdAluno(),
                    idPersonal,
                    new SupabaseClient.CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            Toast.makeText(context, R.string.success_request_accepted, Toast.LENGTH_SHORT).show();
                            aoAtualizar.run();
                        }

                        @Override
                        public void onErro(String mensagem) {
                            Toast.makeText(context, mensagem, Toast.LENGTH_SHORT).show();
                        }
                    }
            );
        });

        holder.btnRecusar.setOnClickListener(v -> {
            SupabaseClient supabaseClient = new SupabaseClient(context);

            supabaseClient.recusarSolicitacaoVinculo(
                    aluno.getIdSolicitacao(),
                    aluno.getIdAluno(),
                    idPersonal,
                    new SupabaseClient.CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            Toast.makeText(context, R.string.success_request_rejected, Toast.LENGTH_SHORT).show();
                            aoAtualizar.run();
                        }

                        @Override
                        public void onErro(String mensagem) {
                            Toast.makeText(context, mensagem, Toast.LENGTH_SHORT).show();
                        }
                    }
            );
        });
    }

    private void abrirPerfil(AlunoPersonal aluno, boolean vinculado) {
        Intent intent = new Intent(context, DetalheAlunoPersonalActivity.class);
        intent.putExtra("id_aluno", aluno.getIdAluno());
        intent.putExtra("vinculado", vinculado);
        context.startActivity(intent);
    }

    @Override
    public int getItemCount() {
        return alunos.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {

        LinearLayout layoutInfoAluno;
        TextView txtNomeAluno;
        TextView txtInfoAluno;
        Button btnAceitar;
        Button btnRecusar;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);

            layoutInfoAluno = itemView.findViewById(R.id.layoutInfoAluno);
            txtNomeAluno = itemView.findViewById(R.id.txtNomeAluno);
            txtInfoAluno = itemView.findViewById(R.id.txtInfoAluno);
            btnAceitar = itemView.findViewById(R.id.btnAceitar);
            btnRecusar = itemView.findViewById(R.id.btnRecusar);
        }
    }
}
