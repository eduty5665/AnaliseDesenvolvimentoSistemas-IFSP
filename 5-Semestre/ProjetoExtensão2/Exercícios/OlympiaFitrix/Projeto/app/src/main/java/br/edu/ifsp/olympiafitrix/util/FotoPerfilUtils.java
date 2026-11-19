package br.edu.ifsp.olympiafitrix.util;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.view.View;
import android.widget.ImageView;

import com.android.volley.RequestQueue;
import com.android.volley.toolbox.ImageRequest;
import com.android.volley.toolbox.Volley;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import br.edu.ifsp.olympiafitrix.R;

/** Operações de imagem compartilhadas pelos perfis, listas e ranking. */
public final class FotoPerfilUtils {

    private static final int TAMANHO_MAXIMO = 1200;
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();
    private static RequestQueue filaImagens;

    private FotoPerfilUtils() {
    }

    public interface PreparacaoCallback {
        void onSucesso(byte[] imagem);
        void onErro();
    }

    public static void carregar(ImageView imageView, String fotoUrl) {
        imageView.setImageResource(R.drawable.guerreiro);
        if (fotoUrl == null || fotoUrl.trim().isEmpty()) {
            return;
        }

        imageView.setTag(fotoUrl);
        ImageRequest request = new ImageRequest(
                fotoUrl,
                bitmap -> {
                    // RecyclerViews reutilizam ImageViews; a tag impede uma resposta antiga no card errado.
                    if (fotoUrl.equals(imageView.getTag())) {
                        imageView.setImageBitmap(bitmap);
                    }
                },
                600,
                600,
                ImageView.ScaleType.CENTER_CROP,
                Bitmap.Config.RGB_565,
                error -> imageView.setImageResource(R.drawable.guerreiro)
        );
        obterFila(imageView.getContext()).add(request);
    }

    public static void prepararParaUpload(File arquivo, View view, PreparacaoCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                Bitmap original = BitmapFactory.decodeFile(arquivo.getAbsolutePath());
                byte[] bytes = comprimir(original);
                view.post(() -> callback.onSucesso(bytes));
            } catch (Exception e) {
                view.post(callback::onErro);
            }
        });
    }

    public static void prepararParaUpload(
            Context context,
            Uri uri,
            View view,
            PreparacaoCallback callback
    ) {
        EXECUTOR.execute(() -> {
            try (InputStream entrada = context.getContentResolver().openInputStream(uri)) {
                Bitmap original = BitmapFactory.decodeStream(entrada);
                byte[] bytes = comprimir(original);
                view.post(() -> callback.onSucesso(bytes));
            } catch (Exception e) {
                view.post(callback::onErro);
            }
        });
    }

    private static byte[] comprimir(Bitmap original) {
        if (original == null) {
            throw new IllegalStateException("Imagem indisponível");
        }

        int largura = original.getWidth();
        int altura = original.getHeight();
        float escala = Math.min(1f, TAMANHO_MAXIMO / (float) Math.max(largura, altura));
        Bitmap ajustada = original;
        if (escala < 1f) {
            ajustada = Bitmap.createScaledBitmap(
                    original,
                    Math.round(largura * escala),
                    Math.round(altura * escala),
                    true
            );
        }

        ByteArrayOutputStream saida = new ByteArrayOutputStream();
        ajustada.compress(Bitmap.CompressFormat.JPEG, 85, saida);
        byte[] bytes = saida.toByteArray();
        if (ajustada != original) {
            ajustada.recycle();
        }
        original.recycle();
        return bytes;
    }

    private static synchronized RequestQueue obterFila(Context context) {
        if (filaImagens == null) {
            filaImagens = Volley.newRequestQueue(context.getApplicationContext());
        }
        return filaImagens;
    }
}
