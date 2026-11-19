package br.edu.ifsp.olympiafitrix;

import android.content.Context;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import androidx.core.content.ContextCompat;
import org.json.JSONObject;

import androidx.appcompat.app.AppCompatActivity;

public class LocalizedActivity extends AppCompatActivity {
    public static final String ACTION_DADOS_ATUALIZADOS = "br.edu.ifsp.olympiafitrix.DADOS_ATUALIZADOS";
    private final BroadcastReceiver notificacaoReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            atualizarDadosNotificacao(intent.getStringExtra("type"));
        }
    };

    @Override
    protected void onResume() {
        super.onResume();
        ContextCompat.registerReceiver(this, notificacaoReceiver,
                new IntentFilter(ACTION_DADOS_ATUALIZADOS), ContextCompat.RECEIVER_NOT_EXPORTED);
        // FCM pode exibir mensagens em segundo plano sem chamar o serviço.
        if (!isFinishing()) atualizarDadosNotificacao(null);
    }

    @Override
    protected void onPause() {
        unregisterReceiver(notificacaoReceiver);
        super.onPause();
    }

    /** null indica retorno à tela; os demais valores são tipos enviados pelo FCM. */
    protected void atualizarDadosNotificacao(String tipo) {}

    protected void atualizarVinculoAluno(Runnable aoAtualizar) {
        int idAluno = getSharedPreferences("sessao", MODE_PRIVATE).getInt("idUsuario", -1);
        if (idAluno == -1) return;
        new SupabaseClient(this).buscarPerfilAluno(idAluno, new SupabaseClient.PerfilAlunoCallback() {
            @Override
            public void onSucesso(JSONObject perfil) {
                if (isFinishing() || isDestroyed()) return;
                getSharedPreferences("sessao", MODE_PRIVATE).edit()
                        .putInt("idPersonal", perfil.optInt("id_personal", 1)).apply();
                aoAtualizar.run();
            }
            @Override
            public void onErro(String mensagem) {
                if (!isFinishing() && !isDestroyed()) aoAtualizar.run();
            }
        });
    }

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LocaleHelper.aplicarIdioma(newBase));
    }
}
