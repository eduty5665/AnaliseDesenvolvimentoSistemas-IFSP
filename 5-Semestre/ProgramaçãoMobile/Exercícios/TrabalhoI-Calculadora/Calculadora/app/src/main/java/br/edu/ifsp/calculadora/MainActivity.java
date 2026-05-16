package br.edu.ifsp.calculadora;

import android.content.res.Configuration;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    TextView expressao;
    TextView resultado;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // CAMPOS DA TELA
        expressao = findViewById(R.id.expressao);
        resultado = findViewById(R.id.resultado);

        // NUMEROS
        TextView um = findViewById(R.id.numero_um);
        TextView dois = findViewById(R.id.numero_dois);
        TextView tres = findViewById(R.id.numero_tres);
        TextView quatro = findViewById(R.id.numero_quatro);
        TextView cinco = findViewById(R.id.numero_cinco);
        TextView seis = findViewById(R.id.numero_seis);
        TextView sete = findViewById(R.id.numero_sete);
        TextView oito = findViewById(R.id.numero_oito);
        TextView nove = findViewById(R.id.numero_nove);
        TextView zero = findViewById(R.id.numero_zero);
        TextView ponto = findViewById(R.id.ponto);

        // OPERADORES
        TextView soma = findViewById(R.id.soma);
        TextView subtracao = findViewById(R.id.subtracao);
        TextView multiplicacao = findViewById(R.id.multiplicacao);
        TextView divisao = findViewById(R.id.divisao);

        // OUTROS
        TextView limpar = findViewById(R.id.limpar);
        TextView igual = findViewById(R.id.igual);
        TextView idioma = findViewById(R.id.idioma);
        ImageView backspace = findViewById(R.id.backspace);

        // NUMEROS
        um.setOnClickListener(v -> adicionar("1"));
        dois.setOnClickListener(v -> adicionar("2"));
        tres.setOnClickListener(v -> adicionar("3"));
        quatro.setOnClickListener(v -> adicionar("4"));
        cinco.setOnClickListener(v -> adicionar("5"));
        seis.setOnClickListener(v -> adicionar("6"));
        sete.setOnClickListener(v -> adicionar("7"));
        oito.setOnClickListener(v -> adicionar("8"));
        nove.setOnClickListener(v -> adicionar("9"));
        zero.setOnClickListener(v -> adicionar("0"));
        ponto.setOnClickListener(v -> adicionar("."));

        // OPERADORES
        soma.setOnClickListener(v -> adicionar("+"));
        subtracao.setOnClickListener(v -> adicionar("-"));
        multiplicacao.setOnClickListener(v -> adicionar("*"));
        divisao.setOnClickListener(v -> adicionar("/"));

        // LIMPAR
        limpar.setOnClickListener(v -> {
            expressao.setText("");
            resultado.setText("");
        });

        // BOTÃO DE TROCAR IDIOMA
        idioma.setOnClickListener(v -> trocarIdioma());

        // BACKSPACE
        backspace.setOnClickListener(v -> {

            String texto = expressao.getText().toString();

            if (!texto.isEmpty()) {
                expressao.setText(texto.substring(0, texto.length() - 1));
            }

        });

        // IGUAL
        igual.setOnClickListener(v -> calcular());
    }

    // FUNÇÃO PARA ADICIONAR NA EXPRESSÃO
    private void adicionar(String valor) {

        expressao.setText(expressao.getText().toString() + valor);

    }

    // FUNÇÃO DE CÁLCULO
    private void calcular() {

        try {

            String conta = expressao.getText().toString();

            double resultadoFinal = 0;

            if (conta.contains("+")) {

                String[] partes = conta.split("\\+");
                resultadoFinal = Double.parseDouble(partes[0]) + Double.parseDouble(partes[1]);

            }

            else if (conta.contains("-")) {

                String[] partes = conta.split("-");
                resultadoFinal = Double.parseDouble(partes[0]) - Double.parseDouble(partes[1]);

            }

            else if (conta.contains("*")) {

                String[] partes = conta.split("\\*");
                resultadoFinal = Double.parseDouble(partes[0]) * Double.parseDouble(partes[1]);

            }

            else if (conta.contains("/")) {

                String[] partes = conta.split("/");
                resultadoFinal = Double.parseDouble(partes[0]) / Double.parseDouble(partes[1]);

            }

            resultado.setText(String.valueOf(resultadoFinal));

        }

        catch (Exception e) {

            resultado.setText("Erro");

        }

    }

    // FUNÇÃO QUE ALTERNA ENTRE PORTUGUÊS E INGLÊS
    private void trocarIdioma() {

        Locale atual = getResources().getConfiguration().getLocales().get(0);

        if (atual.getLanguage().equals("default")) {

            setLocale("en");

        } else {

            setLocale("default");

        }

    }

    // FUNÇÃO QUE DEFINE O IDIOMA
    private void setLocale(String lang) {

        Locale locale = new Locale(lang);
        Locale.setDefault(locale);

        Configuration config = new Configuration();
        config.setLocale(locale);

        getResources().updateConfiguration(config, getResources().getDisplayMetrics());

        recreate(); // reinicia a activity

    }

}