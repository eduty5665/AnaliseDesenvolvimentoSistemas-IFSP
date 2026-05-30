package br.edu.ifsp.weatherapp;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ImageView logo = findViewById(R.id.iv_splash_logo);
        TextView title = findViewById(R.id.tv_splash_title);

        // 1. Mostrar a foto primeiramente (já está visível no XML)
        // 2. Depois apareça o texto "Weather App" e jogue a foto abaixo do texto
        
        // Vamos animar o texto aparecendo e o logo se movendo
        new Handler().postDelayed(() -> {
            title.setVisibility(View.VISIBLE);
            title.setAlpha(0f);
            
            // Animação de Fade In para o texto
            title.animate()
                    .alpha(1f)
                    .setDuration(1000)
                    .start();

            // Animação para "jogar" a foto para baixo (o ConstraintLayout no XML já está configurado 
            // com chains, mas podemos forçar um deslocamento ou apenas confiar no layout final)
            // Para ser mais explícito no efeito de "movimento":
            logo.animate()
                    .translationY(50f) // Pequeno deslocamento para baixo para dar efeito de movimento
                    .setInterpolator(new AccelerateDecelerateInterpolator())
                    .setDuration(1000)
                    .start();

        }, 1000); // Espera 1 segundo antes de começar a animação do texto

        // Transição para a MainActivity após 3 segundos
        new Handler().postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            finish();
        }, 3500);
    }
}
