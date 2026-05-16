package br.edu.ifsp.cameraxapp;

import android.Manifest;
import android.content.ContentValues;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.common.util.concurrent.ListenableFuture;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;

import br.edu.ifsp.cameraxapp.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity implements View.OnClickListener {

    ActivityMainBinding amb;

    private static final int CAMERA_REQUEST_CODE = 100;
    private static final int WRITE_EXT_STO_REQUEST_CODE = 200;

    private ImageCapture imageCaptureFoto;
    private ListenableFuture<ProcessCameraProvider> cameraProviderFuture;


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

        cameraProviderFuture = ProcessCameraProvider.getInstance(this);
        cameraProviderFuture.addListener(()->{

            ProcessCameraProvider cameraProvider = null;
            try {
                cameraProvider = cameraProviderFuture.get();
                startCameraX(cameraProvider);
            } catch (ExecutionException eex) {
               eex.printStackTrace();
            } catch (InterruptedException iex) {
                iex.printStackTrace();
            }

        }, getMainExecutor());

        amb.btnTirarFoto.setOnClickListener(this);
    }

    private void startCameraX(ProcessCameraProvider cameraProvider) {

        cameraProvider.unbindAll();

        CameraSelector cameraSelector = new CameraSelector.Builder()
                .requireLensFacing(CameraSelector.LENS_FACING_BACK)
                .build();

        Preview preview = new Preview.Builder().build();
        preview.setSurfaceProvider(amb.pvFoto.getSurfaceProvider());

        imageCaptureFoto = new ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build();

        cameraProvider.bindToLifecycle(this,
                cameraSelector,
                preview,
                imageCaptureFoto);

    }

    @Override
    public void onClick(View v) {

        if(v.getId() == R.id.btnTirarFoto) {
            //clicou no botao TirarFoto

            //Verificar as permissões
            if(ContextCompat.checkSelfPermission(getApplicationContext(),
                    Manifest.permission.CAMERA) == PackageManager.PERMISSION_DENIED) {

                Toast.makeText(getApplicationContext(),
                        "É necessário permitir o uso da Camera!",
                        Toast.LENGTH_LONG).show();

                requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_REQUEST_CODE);

            }
            else {
                //Já tem permissao para usar a Camera
                if(verificarVersaoAndroidEPermissao()) {
                    tirarFoto();
                }
                else {
                    Toast.makeText(getApplicationContext(),
                            "Sem permissão para acessar os arquivos.",
                            Toast.LENGTH_LONG).show();
                }
            }

        }

    }

    private boolean verificarVersaoAndroidEPermissao() {

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return true;
        }
        else {
            if(ContextCompat.checkSelfPermission(getApplicationContext(),
                    Manifest.permission.WRITE_EXTERNAL_STORAGE) ==
                    PackageManager.PERMISSION_GRANTED) {
                return true;
            }
            else {
                Toast.makeText(getApplicationContext(),
                        "É necessário o acesso aos Arquivos para salvar a Foto!",
                        Toast.LENGTH_LONG).show();

                requestPermissions(new String[]{
                        Manifest.permission.WRITE_EXTERNAL_STORAGE},
                        WRITE_EXT_STO_REQUEST_CODE);

                return false;
            }
        }

    }


    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults, int deviceId) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults, deviceId);

        if(requestCode == CAMERA_REQUEST_CODE) {
            //resposta da permissão da camera
            if(grantResults.length > 0 &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(getApplicationContext(),
                        "Permissão da Camera concedida!",
                        Toast.LENGTH_LONG).show();
            }
            else {
                Toast.makeText(getApplicationContext(),
                        "Permissão da Camera negada!",
                        Toast.LENGTH_LONG).show();
            }
        }

        if(requestCode == WRITE_EXT_STO_REQUEST_CODE) {
            //resposta da permissão da escrita em arquivos
            if(grantResults.length > 0 &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(getApplicationContext(),
                        "Permissão de escrita da foto concedida!",
                        Toast.LENGTH_LONG).show();
            }
            else {
                Toast.makeText(getApplicationContext(),
                        "Permissão de escrita da foto negada!",
                        Toast.LENGTH_LONG).show();
            }
        }
    }


    private void tirarFoto() {

        String nomeFoto = "CameraXApp";

        ContentValues contentValues = new ContentValues();
        contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, nomeFoto);
        contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");

        imageCaptureFoto.takePicture(
                new ImageCapture.OutputFileOptions.Builder(
                        getContentResolver(),
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                        contentValues
                ).build(),
                getExecutor(),
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(@NonNull ImageCapture.OutputFileResults outputFileResults) {
                        Toast.makeText(getApplicationContext(),
                                "Foto capturada com sucesso!",
                                Toast.LENGTH_LONG).show();
                    }

                    @Override
                    public void onError(@NonNull ImageCaptureException exception) {
                        Toast.makeText(getApplicationContext(),
                                "Erro ao capturar a Foto!",
                                Toast.LENGTH_LONG).show();

                        exception.printStackTrace();
                    }
                }
    );
    }

    private Executor getExecutor() {
        return ContextCompat.getMainExecutor(this);
    }

}