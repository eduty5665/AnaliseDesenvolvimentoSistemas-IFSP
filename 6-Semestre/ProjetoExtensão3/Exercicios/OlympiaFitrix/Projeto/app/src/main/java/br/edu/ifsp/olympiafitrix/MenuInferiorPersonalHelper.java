package br.edu.ifsp.olympiafitrix;

import android.app.Activity;
import android.content.Intent;
import android.widget.Toast;

import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MenuInferiorPersonalHelper {

    public static void configurar(
            Activity activity,
            BottomNavigationView bottomNavigationView
    ) {
        bottomNavigationView.setOnItemSelectedListener(item -> {

            int id = item.getItemId();

            if (id == R.id.menuTreino) {
                if (!(activity instanceof PersonalHomeActivity)) {
                    Intent intent = new Intent(activity, PersonalHomeActivity.class);
                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            if (id == R.id.menuGrafico) {

                if (!(activity instanceof RankingPersonalActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    RankingPersonalActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            if (id == R.id.menuRelogio) {

                if (!(activity instanceof HistoricoPersonalActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    HistoricoPersonalActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            if (id == R.id.menuUsuario) {

                if (!(activity instanceof PerfilPersonalActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    PerfilPersonalActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            if (id == R.id.menuPersonal) {

                if (!(activity instanceof AlunosPersonalActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    AlunosPersonalActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            return false;
        });
    }
}