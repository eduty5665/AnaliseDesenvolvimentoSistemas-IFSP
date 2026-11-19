package br.edu.ifsp.olympiafitrix;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.List;

import br.edu.ifsp.olympiafitrix.adapter.PersonalAdapter;
import br.edu.ifsp.olympiafitrix.model.Personal;

import android.content.SharedPreferences;

public class PersonaisActivity extends BaseActivity {

    private RecyclerView rvPersonais;
    private SupabaseClient supabaseClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_personais);

        rvPersonais = findViewById(R.id.rvPersonais);
        rvPersonais.setLayoutManager(new LinearLayoutManager(this));

        supabaseClient = new SupabaseClient(this);

        BottomNavigationView bottomNavigation = findViewById(R.id.bottomNavigation);
        MenuInferiorHelper.configurar(this, bottomNavigation);
        bottomNavigation.setSelectedItemId(R.id.menuPersonal);

    }



    private void carregarPersonais() {
        SharedPreferences prefs = getSharedPreferences("sessao", MODE_PRIVATE);
        int idPersonalAtual = prefs.getInt("idPersonal", 1);

        supabaseClient.buscarPersonaisDisponiveis(
                idPersonalAtual,
                new SupabaseClient.PersonaisCallback() {
                    @Override
                    public void onSucesso(List<Personal> personais) {
                        PersonalAdapter adapter = new PersonalAdapter(personais);
                        rvPersonais.setAdapter(adapter);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        Log.e("PERSONAIS", mensagem);

                        Toast.makeText(
                                PersonaisActivity.this,
                                mensagem,
                                Toast.LENGTH_SHORT
                        ).show();
                    }
                }
        );
    }

    @Override
    protected void atualizarDadosNotificacao(String tipo) {
        if (tipo == null || "link_response".equals(tipo)) {
            atualizarVinculoAluno(this::carregarPersonais);
        }
    }
}
