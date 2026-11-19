package br.edu.ifsp.olympiafitrix;

import android.app.Activity;
import android.content.Intent;

import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MenuInferiorHelper {

    public static void configurar(
            Activity activity,
            BottomNavigationView bottomNavigationView
    ) {

        bottomNavigationView.setOnItemSelectedListener(item -> {

            int id = item.getItemId();

            // TREINO

            if (id == R.id.menuTreino) {

                if (!(activity instanceof AlunoSemPersonalActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    AlunoSemPersonalActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            // RANKING

            if (id == R.id.menuGrafico) {

                if (!(activity instanceof RankingActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    RankingActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            // HISTÓRICO

            if (id == R.id.menuRelogio) {

                if (!(activity instanceof HistoricoActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    HistoricoActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            // PERFIL

            if (id == R.id.menuUsuario) {

                if (!(activity instanceof PerfilActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    PerfilActivity.class
                            );

                    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    activity.startActivity(intent);
                    activity.finish();
                }

                return true;
            }

            // PERSONAL

            if (id == R.id.menuPersonal) {

                if (!(activity instanceof PersonaisActivity)) {

                    Intent intent =
                            new Intent(
                                    activity,
                                    PersonaisActivity.class
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