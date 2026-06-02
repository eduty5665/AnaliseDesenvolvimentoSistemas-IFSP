package br.edu.ifsp.myapplication;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.Environment;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class BadgeActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "BadgePrefs";
    private static final String KEY_USER_NAME = "userName";
    private static final String KEY_USER_PRONTUARIO = "userProntuario";
    private static final String IMAGE_FILE_NAME = "user_photo.jpg";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_badge);

        TextView textViewName = findViewById(R.id.badgeUserName);
        TextView textViewProntuario = findViewById(R.id.badgeUserProntuario);
        TextView textViewValidity = findViewById(R.id.badgeValidity);
        ImageView imageViewPhoto = findViewById(R.id.badgeUserPhoto);
        MaterialButton buttonEdit = findViewById(R.id.buttonEdit);
        MaterialButton buttonPrint = findViewById(R.id.buttonPrint);

        // Carregar dados do SharedPreferences
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String name = prefs.getString(KEY_USER_NAME, "Nome não informado");
        String prontuario = prefs.getString(KEY_USER_PRONTUARIO, "Prontuário não informado");

        textViewName.setText(name);
        textViewProntuario.setText(prontuario);

        // Calcular validade (1 ano à frente)
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.YEAR, 1);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
        String validityDate = "Validade: " + sdf.format(calendar.getTime());
        textViewValidity.setText(validityDate);

        // Carregar foto salva
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File imageFile = new File(storageDir, IMAGE_FILE_NAME);
        if (imageFile.exists()) {
            Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
            imageViewPhoto.setImageBitmap(bitmap);
        }

        // Listeners dos botões
        buttonEdit.setOnClickListener(v -> finish()); // Volta para a tela anterior

        buttonPrint.setOnClickListener(v -> {
            Toast.makeText(this, "Funcionalidade de impressão em breve!", Toast.LENGTH_SHORT).show();
        });
    }
}