package br.edu.ifsp.olympiafitrix;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;

import java.util.Locale;

public final class LocaleHelper {

    private static final String PREFS = "configuracoes";
    private static final String CHAVE_IDIOMA = "idioma";
    public static final String PORTUGUES = "pt-BR";
    public static final String INGLES = "en";

    private LocaleHelper() {
    }

    public static Context aplicarIdioma(Context context) {
        String idioma = obterIdioma(context);
        Locale locale = Locale.forLanguageTag(idioma);
        Locale.setDefault(locale);

        // Um contexto localizado permite trocar o idioma sem alterar a configuração global do aparelho.
        Configuration configuration =
                new Configuration(context.getResources().getConfiguration());
        configuration.setLocale(locale);
        return context.createConfigurationContext(configuration);
    }

    public static String obterIdioma(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString(CHAVE_IDIOMA, PORTUGUES);
    }

    public static void selecionarIdioma(Activity activity, String idioma) {
        SharedPreferences preferences =
                activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (idioma.equals(preferences.getString(CHAVE_IDIOMA, PORTUGUES))) {
            return;
        }

        preferences.edit().putString(CHAVE_IDIOMA, idioma).apply();
        activity.recreate();
    }
}
