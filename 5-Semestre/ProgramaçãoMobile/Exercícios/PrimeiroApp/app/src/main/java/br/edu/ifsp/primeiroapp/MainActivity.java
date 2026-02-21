package br.edu.ifsp.primeiroapp;

import android.os.Bundle;
import android.util.Log;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

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

        Log.v("CICLO_ACTIVITY","onCreate: Inicio Ciclo de Vida");
    }

    @Override
    protected void onStart() {
        super.onStart();

        Log.v("CICLO_ACTIVITY", "onStart: Tela Visível");
    }

    @Override
    protected void onResume() {
        super.onResume();

        Log.v("CICLO_ACTIVITY", "onResume: Volta ao Primeiro Plano");
    }

    @Override
    protected void onPause() {
        super.onPause();

        Log.v("CICLO_ACTIVITY", "onPause: Saindo do Primeiro Plano");
    }

    @Override
    protected void onStop() {
        super.onStop();

        Log.v("CICLO_ACTIVITY","onStop: Finalizando, mas ainda vísivel");
    }

    @Override
    protected void onRestart() {
        super.onRestart();

        Log.v("CICLO_ACTIVITY", "onRestart: Reiniciando a Activity");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        Log.v("CICLO_ACTIVITY", "onDestroy: Finalizando a Activity");
    }
}

