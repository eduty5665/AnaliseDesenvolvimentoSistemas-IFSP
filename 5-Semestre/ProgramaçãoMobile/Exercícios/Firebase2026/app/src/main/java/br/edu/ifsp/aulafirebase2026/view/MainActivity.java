package br.edu.ifsp.aulafirebase2026.view;

import android.content.Intent;
import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;

import java.util.ArrayList;

import br.edu.ifsp.aulafirebase2026.R;
import br.edu.ifsp.aulafirebase2026.databinding.ActivityMainBinding;
import br.edu.ifsp.aulafirebase2026.model.entity.Carro;
import br.edu.ifsp.aulafirebase2026.viewmodel.AuthViewModel;
import br.edu.ifsp.aulafirebase2026.viewmodel.CarroViewModel;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;
    private AuthViewModel authViewModel;

    private CarroViewModel carroViewModel;

    private ArrayList<Carro> lista = new ArrayList<>();
    private ListCarroRecyclerViewAdapter adapter;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        authViewModel = new ViewModelProvider(this).get(AuthViewModel.class);

        carroViewModel = new ViewModelProvider(this).get(CarroViewModel.class);

        binding.recyclerview.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ListCarroRecyclerViewAdapter(lista);
        binding.recyclerview.setAdapter(adapter);

        carroViewModel.getCarros().observe(this, carros ->{
            lista.clear();
            lista.addAll(carros);
            adapter.notifyDataSetChanged();
        });

        carregarCarros();
    }

    private void carregarCarros() {
        ListCarroRecyclerViewAdapter.CarrosListener listener = new ListCarroRecyclerViewAdapter.CarrosListener() {
            @Override
            public void onItemClick(int pos) {

                Carro c = lista.get(pos);

                Intent intent = new Intent(getApplicationContext(),
                        CadastroActivity.class);
                intent.putExtra(CadastroActivity.ID_CARRO, c.getId());
                startActivity(intent);
            }
        };

        ListCarroRecyclerViewAdapter.CarrosLongListener longlistener = new ListCarroRecyclerViewAdapter.CarrosLongListener() {
            @Override
            public void onItemLongClick(int pos) {
                //TODO: Deletar o Carro
            }
        };
    }
}