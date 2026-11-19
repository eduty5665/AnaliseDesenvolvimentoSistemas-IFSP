package br.edu.ifsp.olympiafitrix;

import android.os.Handler;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;

/** Comportamento comum de saída usado nas telas principais do aplicativo. */
public class BaseActivity extends LocalizedActivity {

    private boolean pressionouVoltar = false;

    @Override
    protected void onStart() {
        super.onStart();

        getOnBackPressedDispatcher().addCallback(
                this,
                new OnBackPressedCallback(true) {

                    @Override
                    public void handleOnBackPressed() {

                        if (pressionouVoltar) {
                            finishAffinity();
                            return;
                        }

                        pressionouVoltar = true;

                        Toast.makeText(
                                BaseActivity.this,
                                R.string.back_again_to_exit,
                                Toast.LENGTH_SHORT
                        ).show();

                        new Handler().postDelayed(() ->
                                pressionouVoltar = false, 2000);
                    }
                });
    }
}
