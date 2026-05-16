package br.edu.ifsp.intentapp;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import br.edu.ifsp.intentapp.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {

    ActivityMainBinding amb;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        amb = ActivityMainBinding.inflate(getLayoutInflater());

        EdgeToEdge.enable(this);
        setContentView(amb.getRoot());
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        amb.btnGoogle.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                browser("http://www.google.com");
            }
        });


        amb.btnDial.setOnClickListener(v -> dial());
        amb.btnSms.setOnClickListener(v -> sms());
        amb.btnWhatsapp.setOnClickListener(v -> whatsapp());

        //ActionBar ab = getSupportActionBar();
        //ab.hide();
        //ab.show();
    }

    private void browser(String url) {
        Intent intent =
                new Intent(Intent.ACTION_VIEW,
                        Uri.parse(url));

        startActivity(intent);
    }

    private void whatsapp() {

        try {

            String cel = "5517982105555";
            String msg = "Olá testando o envio de mensagem pelo Zap!";

            String url = "https://wa.me/" + cel + "?text=" + Uri.encode(msg);

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse(url));

            intent.setPackage("com.whatsapp"); //Força o uso do aplicativo do whatsapp

            startActivity(intent);


        }
        catch (Exception ex) {
            Toast.makeText(getApplicationContext(), "O Whatsapp não está instalado", 8000).show();
        }

    }

    private void sms() {
        Intent intent =
                new Intent(Intent.ACTION_VIEW, Uri.parse("sms:999999999"));
        startActivity(intent);
    }

    private void dial() {
        Intent intent =
                new Intent(Intent.ACTION_DIAL, Uri.parse("tel:999999999"));
        startActivity(intent);
    }

    public void call(View v) {
        
        try {

            //Cuidado para fazer uma chamada pode precisar de permissão
            //TODO: Requisitar a permissão para chamada ao usuário
            Intent intent =
                    new Intent(Intent.ACTION_CALL, Uri.parse("tel:999999999"));
            startActivity(intent);

        } catch (Exception e) {
            Toast.makeText(getApplicationContext(), e.getMessage(), 8000).show();
        }

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {

        int itemMenuId = item.getItemId();

        if(itemMenuId == R.id.im_about) {
            browser("https://stackoverflow.com/");
        }
        else if(itemMenuId == R.id.im_whatsapp) {
            whatsapp();
        }
        else if(itemMenuId == R.id.im_exit) {
            finish();
        }

        return super.onOptionsItemSelected(item);
    }
}