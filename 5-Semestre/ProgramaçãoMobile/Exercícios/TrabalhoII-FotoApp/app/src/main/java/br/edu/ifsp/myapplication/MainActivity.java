package br.edu.ifsp.myapplication;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.google.android.material.textfield.TextInputEditText;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    private static final int CAMERA_PERMISSION_CODE = 100;
    private static final String PREFS_NAME = "BadgePrefs";
    private static final String KEY_USER_NAME = "userName";
    private static final String KEY_USER_PRONTUARIO = "userProntuario";
    private static final String IMAGE_FILE_NAME = "user_photo.jpg";
    private static final String TEMP_IMAGE_FILE_NAME = "temp_user_photo.jpg";

    private ImageView imageViewPhoto;
    private TextInputEditText editTextName;
    private TextInputEditText editTextProntuario;
    private Button buttonTakePhoto;
    private Button buttonSave;
    private ImageButton buttonGenerateBadge;
    private ImageButton buttonExit;

    private String tempPhotoPath;
    private Bitmap tempBitmap;

    private final ActivityResultLauncher<Intent> takePictureLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK) {
                    setTempPic();
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Inicialização dos componentes
        imageViewPhoto = findViewById(R.id.imageViewPhoto);
        editTextName = findViewById(R.id.editTextName);
        editTextProntuario = findViewById(R.id.editTextProntuario);
        buttonTakePhoto = findViewById(R.id.buttonTakePhoto);
        buttonSave = findViewById(R.id.buttonSave);
        buttonGenerateBadge = findViewById(R.id.buttonGenerateBadge);
        buttonExit = findViewById(R.id.buttonExit);

        // Listeners
        buttonTakePhoto.setOnClickListener(v -> checkPermissionAndOpenCamera());
        buttonSave.setOnClickListener(v -> saveAllData());
        
        buttonExit.setOnClickListener(v -> {
            finish(); // Fecha a activity e sai do app
        });

        buttonGenerateBadge.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, BadgeActivity.class);
            startActivity(intent);
        });

        loadData();
    }

    private void checkPermissionAndOpenCamera() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_CODE);
        } else {
            dispatchTakePictureIntent();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                dispatchTakePictureIntent();
            } else {
                Toast.makeText(this, "Permissão da câmera é necessária para tirar foto", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void dispatchTakePictureIntent() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
            File photoFile = null;
            try {
                photoFile = createTempImageFile();
            } catch (IOException ex) {
                Toast.makeText(this, "Erro ao criar arquivo temporário", Toast.LENGTH_SHORT).show();
            }
            if (photoFile != null) {
                Uri photoURI = FileProvider.getUriForFile(this,
                        getApplicationContext().getPackageName() + ".fileprovider",
                        photoFile);
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                takePictureLauncher.launch(takePictureIntent);
            }
        }
    }

    private File createTempImageFile() throws IOException {
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File image = new File(storageDir, TEMP_IMAGE_FILE_NAME);
        tempPhotoPath = image.getAbsolutePath();
        return image;
    }

    private void setTempPic() {
        if (tempPhotoPath != null) {
            tempBitmap = BitmapFactory.decodeFile(tempPhotoPath);
            imageViewPhoto.setImageBitmap(tempBitmap);
        }
    }

    private void saveAllData() {
        String name = editTextName.getText().toString();
        String prontuario = editTextProntuario.getText().toString();

        // 1. Salvar Nome e Prontuário no SharedPreferences
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(KEY_USER_NAME, name);
        editor.putString(KEY_USER_PRONTUARIO, prontuario);
        editor.apply();

        // 2. Salvar a Foto (mover do temporário para o definitivo)
        if (tempBitmap != null) {
            saveBitmapToFile(tempBitmap);
        }

        Toast.makeText(this, "Dados e foto salvos com sucesso!", Toast.LENGTH_SHORT).show();
    }

    private void saveBitmapToFile(Bitmap bitmap) {
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File imageFile = new File(storageDir, IMAGE_FILE_NAME);
        try (FileOutputStream out = new FileOutputStream(imageFile)) {
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out);
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(this, "Erro ao salvar imagem final", Toast.LENGTH_SHORT).show();
        }
    }

    private void loadData() {
        // Carregar Nome e Prontuário
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String savedName = sharedPreferences.getString(KEY_USER_NAME, "");
        String savedProntuario = sharedPreferences.getString(KEY_USER_PRONTUARIO, "");
        
        editTextName.setText(savedName);
        editTextProntuario.setText(savedProntuario);

        // Carregar Foto Definitiva
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File imageFile = new File(storageDir, IMAGE_FILE_NAME);
        if (imageFile.exists()) {
            Bitmap savedBitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
            imageViewPhoto.setImageBitmap(savedBitmap);
        }
    }
}