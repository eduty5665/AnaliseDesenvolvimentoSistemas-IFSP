package br.edu.ifsp.aulasqlite.view;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;

import java.util.ArrayList;

import br.edu.ifsp.aulasqlite.R;
import br.edu.ifsp.aulasqlite.controller.MainActivityController;
import br.edu.ifsp.aulasqlite.databinding.ActivityMainBinding;
import br.edu.ifsp.aulasqlite.model.entity.Pessoa;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding activityMainBinding;
    private MainActivityController controller;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        activityMainBinding = ActivityMainBinding.inflate(getLayoutInflater());

        EdgeToEdge.enable(this);
        setContentView(activityMainBinding.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        controller = new MainActivityController(this);
        activityMainBinding.recyclerview
                .setLayoutManager(new LinearLayoutManager(this));

        carregarPessoas();

    }

    private void carregarPessoas() {
        ArrayList<Pessoa> arrPessoas = controller.getListPessoas();

        ListPessoasRecyclerViewAdapter adapter =
                new ListPessoasRecyclerViewAdapter(arrPessoas);

        activityMainBinding.recyclerview.setAdapter(adapter);

        ListPessoasRecyclerViewAdapter.OnItemClickListener listener =
                new ListPessoasRecyclerViewAdapter.OnItemClickListener() {
                    @Override
                    public void onEditarClick(Integer pos) {
                        Pessoa p = arrPessoas.get(pos);
                        Intent intent = new Intent(getApplicationContext(),
                                CadastroActivity.class);
                        intent.putExtra(CadastroActivity.ID_PESSOA, p.getId());
                        startActivity(intent);
                    }

                    @Override
                    public void onExcluirClick(Integer pos) {
                        Pessoa p = arrPessoas.get(pos);
                        removerPessoa(p);
                    }
                };

        adapter.setClickListener(listener);

    }


    private void removerPessoa(Pessoa p) {

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Atenção!");
        builder.setMessage("Deseja excluir a Pessoa: " + p.getNome() + " ?");
        builder.setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                controller.removerPessoa(p);

                Toast.makeText(getApplicationContext(),
                        "Pessoa removida com sucesso!",
                        Toast.LENGTH_LONG).show();

                carregarPessoas();
            }
        });
        builder.setNegativeButton(android.R.string.cancel, null);
        builder.create().show();

    }


    @Override
    protected void onResume() {
        super.onResume();
        carregarPessoas();
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu,menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {

        int id = item.getItemId();

        if(id == R.id.im_adicionar) {
            Intent intent = new Intent(getApplicationContext(),
                    CadastroActivity.class);
            intent.putExtra(CadastroActivity.ID_PESSOA, 0);
            startActivity(intent);
        }


        return super.onOptionsItemSelected(item);
    }
}