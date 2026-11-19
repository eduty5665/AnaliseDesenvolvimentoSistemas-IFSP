package br.edu.ifsp.olympiafitrix;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.adapter.NivelAdapter;
import br.edu.ifsp.olympiafitrix.model.Nivel;

public class NiveisListaActivity extends LocalizedActivity {

    private NivelAdapter adapter;
    private List<Nivel> listaNiveis;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_niveis_lista);

        RecyclerView rvNiveis = findViewById(R.id.rvNiveis);
        Button btnAtribuir = findViewById(R.id.btnAtribuirNivel);

        listaNiveis = new ArrayList<>();
        adapter = new NivelAdapter(listaNiveis);
        rvNiveis.setLayoutManager(new LinearLayoutManager(this));
        rvNiveis.setAdapter(adapter);

        btnAtribuir.setOnClickListener(v -> {
            Nivel selecionado = adapter.getSelectedNivel();
            if (selecionado == null) {
                Toast.makeText(this, R.string.error_select_level, Toast.LENGTH_SHORT).show();
                return;
            }

            Intent resultIntent = new Intent();
            resultIntent.putExtra("nivel_selecionado", selecionado);
            setResult(RESULT_OK, resultIntent);
            finish();
        });

        carregarNiveis();
    }

    private void carregarNiveis() {
        new SupabaseClient(this).buscarNiveis(new SupabaseClient.NiveisCallback() {
            @Override
            public void onSucesso(List<Nivel> niveis) {
                listaNiveis.clear();
                listaNiveis.addAll(niveis);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onErro(String mensagem) {
                Toast.makeText(NiveisListaActivity.this, mensagem, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
