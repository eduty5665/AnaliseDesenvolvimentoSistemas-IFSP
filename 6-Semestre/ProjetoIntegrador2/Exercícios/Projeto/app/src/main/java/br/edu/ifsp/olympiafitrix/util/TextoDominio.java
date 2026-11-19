package br.edu.ifsp.olympiafitrix.util;

import android.content.Context;

import br.edu.ifsp.olympiafitrix.R;

import java.util.Locale;

public final class TextoDominio {
    private TextoDominio() {}

    public static String status(Context context, String status) {
        // O banco mantém os valores em português; somente a apresentação é traduzida.
        String valor = status == null ? "" : status.trim().toLowerCase(Locale.ROOT);
        if ("realizado".equals(valor) || "concluido".equals(valor)
                || "concluído".equals(valor) || "finalizado".equals(valor)) {
            return context.getString(R.string.status_completed);
        }
        if ("dispensado".equals(valor)) {
            return context.getString(R.string.status_dismissed);
        }
        return context.getString(R.string.status_pending);
    }

    public static String nivel(Context context, String nivel) {
        String valor = nivel == null ? "" : nivel.trim().toLowerCase(Locale.ROOT);
        if ("iniciante".equals(valor)) return context.getString(R.string.level_beginner);
        if ("intermediário".equals(valor) || "intermediario".equals(valor)) {
            return context.getString(R.string.level_intermediate);
        }
        if ("avançado".equals(valor) || "avancado".equals(valor)) {
            return context.getString(R.string.level_advanced);
        }
        return nivel == null ? "" : nivel;
    }

    public static String descricaoNivel(Context context, String nomeNivel, String descricao) {
        String valor = nomeNivel == null ? "" : nomeNivel.trim().toLowerCase(Locale.ROOT);
        if ("iniciante".equals(valor)) {
            return context.getString(R.string.level_beginner_description);
        }
        if ("intermediário".equals(valor) || "intermediario".equals(valor)) {
            return context.getString(R.string.level_intermediate_description);
        }
        if ("avançado".equals(valor) || "avancado".equals(valor)) {
            return context.getString(R.string.level_advanced_description);
        }
        return descricao == null ? "" : descricao;
    }
}
