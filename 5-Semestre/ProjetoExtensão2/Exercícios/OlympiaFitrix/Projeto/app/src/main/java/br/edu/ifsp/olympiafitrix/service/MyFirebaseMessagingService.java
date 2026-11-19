package br.edu.ifsp.olympiafitrix.service;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

import br.edu.ifsp.olympiafitrix.LocalizedActivity;
import br.edu.ifsp.olympiafitrix.AlunoSemPersonalActivity;
import br.edu.ifsp.olympiafitrix.AlunosPersonalActivity;
import br.edu.ifsp.olympiafitrix.HistoricoPersonalActivity;
import br.edu.ifsp.olympiafitrix.R;
import br.edu.ifsp.olympiafitrix.SupabaseClient;

/** Recebe mensagens FCM, sincroniza tokens e direciona cada notificação para sua tela. */
public class MyFirebaseMessagingService extends FirebaseMessagingService {

    public static final String CHANNEL_SOLICITACOES = "solicitacoes_vinculo";

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);

        salvarTokenLocal(token);
        sincronizarTokenComSupabase(token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        criarCanalNotificacao();

        String titulo = "Nova solicitação";
        String mensagem = "Um aluno solicitou vínculo com você.";

        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null) {
                titulo = remoteMessage.getNotification().getTitle();
            }
            if (remoteMessage.getNotification().getBody() != null) {
                mensagem = remoteMessage.getNotification().getBody();
            }
        }

        Map<String, String> data = remoteMessage.getData();
        if (data.containsKey("title")) {
            titulo = data.get("title");
        }
        if (data.containsKey("body")) {
            mensagem = data.get("body");
        }

        sendBroadcast(new Intent(LocalizedActivity.ACTION_DADOS_ATUALIZADOS)
                .setPackage(getPackageName()).putExtra("type", data.get("type")));
        exibirNotificacao(titulo, mensagem, data.get("type"));
    }

    private void salvarTokenLocal(String token) {
        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        prefs.edit().putString("fcmToken", token).apply();
    }

    private void sincronizarTokenComSupabase(String token) {
        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);

        String tipoUsuario = prefs.getString("tipoUsuario", "");
        int idUsuario = prefs.getInt("idUsuario", -1);

        if (tipoUsuario.isEmpty() || idUsuario == -1) {
            // O token será sincronizado no próximo login, quando houver um usuário identificado.
            return;
        }

        SupabaseClient supabaseClient = new SupabaseClient(this);
        supabaseClient.atualizarFcmToken(tipoUsuario, idUsuario, token, new SupabaseClient.CadastroCallback() {
            @Override
            public void onSucesso() {
                Log.d("FCM_TOKEN", "Token atualizado no Supabase.");
            }

            @Override
            public void onErro(String mensagem) {
                Log.e("FCM_TOKEN", "Erro ao atualizar token: " + mensagem);
            }
        });
    }

    private void exibirNotificacao(String titulo, String mensagem, String type) {
        Intent intent;
        // Cada tipo abre a tela em que o usuário consegue agir sobre a notificação.
        if ("workout_assigned".equals(type) || "link_response".equals(type)) {
            intent = new Intent(this, AlunoSemPersonalActivity.class);
        } else if ("workout_finished".equals(type)) {
            intent = new Intent(this, HistoricoPersonalActivity.class);
        } else {
            intent = new Intent(this, AlunosPersonalActivity.class);
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_SOLICITACOES)
                .setSmallIcon(R.drawable.olympiafitrix)
                .setLargeIcon(BitmapFactory.decodeResource(getResources(), R.drawable.olympiafitrix))
                .setContentTitle(titulo)
                .setContentText(mensagem)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(mensagem))
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent);

        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        if (notificationManager != null) {
            // O horário como ID permite exibir notificações diferentes sem substituir a anterior.
            notificationManager.notify((int) System.currentTimeMillis(), builder.build());
        }
    }

    private void criarCanalNotificacao() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
                CHANNEL_SOLICITACOES,
                "Notificações OlympiaFitrix",
                NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Notificações de vínculos e treinos.");

        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        if (notificationManager != null) {
            notificationManager.createNotificationChannel(channel);
        }
    }
}
