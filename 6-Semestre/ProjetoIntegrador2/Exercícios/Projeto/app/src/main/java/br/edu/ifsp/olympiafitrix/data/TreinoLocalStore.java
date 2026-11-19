package br.edu.ifsp.olympiafitrix.data;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.olympiafitrix.model.Exercicio;
import br.edu.ifsp.olympiafitrix.model.Treino;

/**
 * Mantém uma cópia local dos treinos criados pelo personal.
 * O banco continua sendo a fonte oficial; esta cópia preserva a tela durante a navegação.
 */
public class TreinoLocalStore {
    private static final String PREFS = "treinos_personal";

    private TreinoLocalStore() {}

    public static List<Treino> carregar(Context context, int idPersonal) {
        // Os rascunhos ficam separados por personal para não misturar dados no mesmo aparelho.
        List<Treino> treinos = new ArrayList<>();

        try {
            JSONArray array = new JSONArray(obterPrefs(context).getString(chave(idPersonal), "[]"));
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                Treino treino = new Treino(
                        obj.optString("id"),
                        obj.optString("nome"),
                        obj.optString("descricao"),
                        obj.optString("data"),
                        obj.optString("nomePersonal", "Personal"),
                        obj.optString("nivel"),
                        obj.optString("duracao", "60 min"),
                        montarExercicios(obj.optJSONArray("exercicios"))
                );
                treino.setIdNivel(obj.optInt("idNivel", 0));
                treino.setAtribuido(obj.optBoolean("atribuido", false));
                treinos.add(treino);
            }
        } catch (Exception ignored) {
            // Um conteúdo local antigo ou corrompido não deve impedir a abertura da tela.
            return new ArrayList<>();
        }

        return treinos;
    }

    public static void salvarOuAtualizar(Context context, int idPersonal, Treino treino) {
        List<Treino> treinos = carregar(context, idPersonal);
        int index = -1;

        for (int i = 0; i < treinos.size(); i++) {
            if (treinos.get(i).getId().equals(treino.getId())) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            // Editar o conteúdo não pode apagar a informação de que o treino já foi atribuído.
            treino.setAtribuido(treinos.get(index).isAtribuido());
            treinos.set(index, treino);
        } else {
            treinos.add(0, treino);
        }

        salvarLista(context, idPersonal, treinos);
    }

    public static boolean removerSeNaoAtribuido(Context context, int idPersonal, String idTreino) {
        List<Treino> treinos = carregar(context, idPersonal);

        for (int i = 0; i < treinos.size(); i++) {
            Treino treino = treinos.get(i);
            if (treino.getId().equals(idTreino)) {
                // Treinos já enviados fazem parte do histórico do aluno e não podem sumir do personal.
                if (treino.isAtribuido()) {
                    return false;
                }

                treinos.remove(i);
                salvarLista(context, idPersonal, treinos);
                return true;
            }
        }

        return false;
    }

    public static void marcarAtribuido(Context context, int idPersonal, String idTreino) {
        List<Treino> treinos = carregar(context, idPersonal);
        for (Treino treino : treinos) {
            if (treino.getId().equals(idTreino)) {
                treino.setAtribuido(true);
                break;
            }
        }
        salvarLista(context, idPersonal, treinos);
    }

    public static void salvarLista(Context context, int idPersonal, List<Treino> treinos) {
        JSONArray array = new JSONArray();

        try {
            for (Treino treino : treinos) {
                JSONObject obj = new JSONObject();
                obj.put("id", treino.getId());
                obj.put("nome", treino.getNome());
                obj.put("descricao", treino.getDescricao());
                obj.put("data", treino.getData());
                obj.put("nomePersonal", treino.getNomePersonal());
                obj.put("nivel", treino.getNivel());
                obj.put("idNivel", treino.getIdNivel());
                obj.put("duracao", treino.getDuracao());
                obj.put("atribuido", treino.isAtribuido());
                obj.put("exercicios", exerciciosToJson(treino.getListaExercicios()));
                array.put(obj);
            }
        } catch (Exception ignored) {
            return;
        }

        obterPrefs(context).edit().putString(chave(idPersonal), array.toString()).apply();
    }

    private static JSONArray exerciciosToJson(List<Exercicio> exercicios) throws Exception {
        JSONArray array = new JSONArray();
        if (exercicios == null) {
            return array;
        }

        for (Exercicio exercicio : exercicios) {
            JSONObject obj = new JSONObject();
            obj.put("idExercicio", exercicio.getIdExercicio());
            obj.put("nome", exercicio.getNome());
            obj.put("descricao", exercicio.getDescricao());
            obj.put("series", exercicio.getNumSeries());
            obj.put("repeticoes", exercicio.getRepeticoes());
            obj.put("peso", exercicio.getPeso());
            array.put(obj);
        }

        return array;
    }

    private static List<Exercicio> montarExercicios(JSONArray array) {
        List<Exercicio> exercicios = new ArrayList<>();
        if (array == null) {
            return exercicios;
        }

        for (int i = 0; i < array.length(); i++) {
            JSONObject obj = array.optJSONObject(i);
            if (obj == null) {
                continue;
            }

            exercicios.add(new Exercicio(
                    obj.optInt("idExercicio", -1),
                    obj.optString("nome"),
                    obj.optString("descricao"),
                    obj.optString("series", "1"),
                    obj.optString("repeticoes"),
                    obj.optString("peso")
            ));
        }

        return exercicios;
    }

    private static SharedPreferences obterPrefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static String chave(int idPersonal) {
        return "personal_" + idPersonal;
    }
}
