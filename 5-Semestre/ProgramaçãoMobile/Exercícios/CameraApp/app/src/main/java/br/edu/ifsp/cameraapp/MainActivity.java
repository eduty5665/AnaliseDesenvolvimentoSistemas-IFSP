package br.edu.ifsp.cameraapp;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class MainActivity extends AppCompatActivity {

    public static final int REQ_CODE_CAMERA = 0;

    private Uri uriFoto;

    TextView tvPath;

    private ActivityResultLauncher<Intent> cameraLauncher;

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

        Button btnFoto = findViewById(R.id.btnFoto);
        ImageView ivFoto = findViewById(R.id.ivFoto);
        tvPath = findViewById(R.id.tvPath);

        cameraLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(),
                resultado -> {
                    if(resultado.getResultCode() == RESULT_OK) {
                        ivFoto.setImageURI(uriFoto);
                    }
                });

        btnFoto.setOnClickListener(v -> {
            //Verificar e Pedir Permissão
            if (verificarPermissoes()) {
                //Abrir o aplicativo da Camera (intent)
                abrirCamera();
            }
        });
    }

    private boolean verificarPermissoes() {
         if(ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                 == PackageManager.PERMISSION_GRANTED) {
             //Tenho permissão!
             return true;
         }
         else {
             //Não tenho permissão
             ActivityCompat.requestPermissions(this,
                     new String[]{Manifest.permission.CAMERA},REQ_CODE_CAMERA);

             return false;
         }
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults, int deviceId) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults, deviceId);

        if(requestCode == REQ_CODE_CAMERA) {

            if(grantResults.length > 0 &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {

                abrirCamera();
            }
            else {
                Toast.makeText(getApplicationContext(),
                        "Você não deu permissão para usar a Camera!",
                        Toast.LENGTH_LONG).show();
            }

        }
    }


    private void abrirCamera() {

        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

        //Verificando se há algum aplicativo que resolve a acao ACTION_IMAGE_CAPTURE
        if(intent.resolveActivity(getPackageManager()) != null) {
            //tirar a foto

            //criar arquivo
            File foto = null;

            try {
                foto = criarArquivoFoto();
                tvPath.setText(foto.getAbsolutePath());
            }
            catch (IOException ex) {
                Toast.makeText(getApplicationContext(),
                        ex.getLocalizedMessage(), Toast.LENGTH_LONG).show();
            }

            uriFoto = FileProvider.getUriForFile(this,
                    getPackageName() + ".provider",
                    foto);

            intent.putExtra(MediaStore.EXTRA_OUTPUT, uriFoto);

            cameraLauncher.launch(intent);

        }
    }

    private File criarArquivoFoto() throws IOException {

        String nomeArquivo =
                    new SimpleDateFormat("yyyyMMdd_HHmmss")
                            .format(new Date());

        String nomeArquivoFinal = "CameraApp_" + nomeArquivo;

        File diretorio = getExternalFilesDir(Environment.DIRECTORY_PICTURES);

        return File.createTempFile(nomeArquivoFinal, ".jpg", diretorio);

    }

}