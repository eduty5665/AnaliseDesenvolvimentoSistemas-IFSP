package br.edu.ifsp.olympiafitrix;

import android.content.Context;
import android.net.Uri;
import android.util.Log;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import br.edu.ifsp.olympiafitrix.model.AlunoRanking;
import br.edu.ifsp.olympiafitrix.model.Personal;
import br.edu.ifsp.olympiafitrix.model.AlunoSimples;
import br.edu.ifsp.olympiafitrix.model.AlunoPersonal;
import br.edu.ifsp.olympiafitrix.model.Exercicio;
import br.edu.ifsp.olympiafitrix.model.Nivel;
import br.edu.ifsp.olympiafitrix.model.Treino;

/**
 * Ponto de acesso às APIs REST, Storage, RPCs e Edge Functions do Supabase.
 * As Activities recebem resultados por callbacks para não bloquear a thread da interface.
 */
public class SupabaseClient {

    private static final String SUPABASE_URL = "https://kfcqtbsdycljimyjmjtz.supabase.co";
    private static final String SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY3F0YnNkeWNsamlteWptanR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjU0MTksImV4cCI6MjA5NDY0MTQxOX0.S07qbCQDKH3fBbXFItJqkAmw0STFLwwIUoZoYWereNU";
    private static final String EDGE_SEND_LINK_REQUEST_NOTIFICATION =
            SUPABASE_URL + "/functions/v1/send-link-request-notification";
    private static final String EDGE_SEND_LINK_RESPONSE_NOTIFICATION =
            SUPABASE_URL + "/functions/v1/send-link-response-notification";
    private static final String EDGE_SEND_WORKOUT_ASSIGNED_NOTIFICATION =
            SUPABASE_URL + "/functions/v1/send-workout-assigned-notification";
    private static final String EDGE_SEND_WORKOUT_FINISHED_NOTIFICATION =
            SUPABASE_URL + "/functions/v1/send-workout-finished-notification";

    // O registro 1 representa "sem personal" no banco legado do projeto.
    private static final int ID_PERSONAL_PADRAO = 1;

    private final RequestQueue requestQueue;
    private final Context appContext;

    public SupabaseClient(Context context) {
        appContext = context.getApplicationContext();
        requestQueue = Volley.newRequestQueue(context);
    }

    private String traduzirErro(String mensagem) {
        if (!LocaleHelper.INGLES.equals(LocaleHelper.obterIdioma(appContext))) {
            return mensagem;
        }

        return mensagem
                .replace("E-mail ou senha inválidos.", "Invalid email or password.")
                .replace("Este e-mail já está cadastrado.", "This email is already registered.")
                .replace("Aluno não encontrado.", "Student not found.")
                .replace("Personal não encontrado.", "Trainer not found.")
                .replace("Login não encontrado.", "Login not found.")
                .replace("Usuário sem perfil cadastrado.", "User has no registered profile.")
                .replace("Você já está vinculado a um personal.", "You are already connected to a trainer.")
                .replace("Você já possui uma solicitação pendente.", "You already have a pending request.")
                .replace("Não foi possível atualizar o login.", "Could not update the login.")
                .replace("Tipo de usuario invalido.", "Invalid user type.")
                .replace("Erro ao ", "Failed to ")
                .replace("Erro ao", "Failed to")
                .replace("Erro de ", "Failed to ")
                .replace("Erro na ", "Failed while ")
                .replace("Erro no ", "Failed while ")
                .replace("buscar", "fetch")
                .replace("carregar", "load")
                .replace("montar", "prepare")
                .replace("verificar", "check")
                .replace("atualizar", "update")
                .replace("cadastrar", "register")
                .replace("salvar", "save")
                .replace("finalizar", "finish")
                .replace("dispensar", "dismiss")
                .replace("vincular", "connect")
                .replace("desvincular", "disconnect")
                .replace("treinos", "workouts")
                .replace("treino", "workout")
                .replace("alunos", "students")
                .replace("aluno", "student")
                .replace("histórico", "history")
                .replace("solicitação", "request")
                .replace("notificação", "notification");
    }

    public interface LoginCallback {
        void onSucesso(String tipoUsuario, int idUsuario, int idLogin, int idPersonal);
        void onErro(String mensagem);
    }

    public interface CadastroCallback {
        void onSucesso();
        void onErro(String mensagem);
    }

    public interface FotoPerfilCallback {
        void onSucesso(String fotoUrl);
        void onErro(String mensagem);
    }

    public interface PerfilAlunoCallback {
        void onSucesso(JSONObject perfil);
        void onErro(String mensagem);
    }

    public interface VerificacaoCallback {
        void onResultado(boolean existe);
        void onErro(String mensagem);
    }

    public void fazerLogin(String email, String senha, LoginCallback callback) {
        // A senha é validada pela função do banco; o aplicativo nunca recebe o hash salvo.
        JSONObject body = new JSONObject();
        try {
            body.put("p_email", email);
            body.put("p_senha", senha);
        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao preparar login."));
            return;
        }

        StringRequest request = new StringRequest(
                Request.Method.POST,
                SUPABASE_URL + "/rest/v1/rpc/autenticar_login",
                response -> {
                    try {
                        JSONArray resultado = new JSONArray(response);
                        if (resultado.length() == 0) {
                            callback.onErro(traduzirErro("E-mail ou senha inválidos."));
                            return;
                        }

                        JSONObject login = resultado.getJSONObject(0);
                        int idLogin = login.getInt("id_login");

                        if (login.has("tipo_usuario")
                                && !login.isNull("tipo_usuario")) {
                            callback.onSucesso(
                                    login.getString("tipo_usuario"),
                                    login.getInt("id_usuario"),
                                    idLogin,
                                    login.getInt("id_personal")
                            );
                            return;
                        }

                        verificarTipoUsuario(idLogin, callback);
                    } catch (Exception e) {
                        Log.e("LOGIN_SEGURO", e.toString());
                        callback.onErro(traduzirErro("Erro ao processar login."));
                    }
                },
                error -> {
                    String erro = obterErroVolley(error);
                    Log.e("LOGIN_SEGURO", erro);
                    if (erro.contains("\"code\":\"57014\"")
                            || erro.contains("statement timeout")) {
                        callback.onErro(
                                "O servidor demorou para validar a senha. Atualize as funções de login no Supabase."
                        );
                        return;
                    }
                    callback.onErro(traduzirErro("Erro ao conectar com o banco."));
                }
        ) {
            @Override
            public byte[] getBody() {
                return body.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void fazerLoginAntigo(String email, String senha, LoginCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/login")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("email", "eq." + email)
                .appendQueryParameter("senha", "eq." + senha)
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        if (response.length() == 0) {
                            callback.onErro(traduzirErro("E-mail ou senha inválidos."));
                            return;
                        }

                        int idLogin = response.getJSONObject(0).getInt("id_login");
                        verificarTipoUsuario(idLogin, callback);

                    } catch (Exception e) {
                        Log.e("LOGIN_ERRO", e.toString());
                        callback.onErro(traduzirErro("Erro ao processar login."));
                    }
                },
                error -> {
                    Log.e("LOGIN_SUPABASE", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao conectar com o banco."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void verificarTipoUsuario(int idLogin, LoginCallback callback) {
        String urlAluno = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_login", "eq." + idLogin)
                .build()
                .toString();

        JsonArrayRequest requestAluno = new JsonArrayRequest(
                Request.Method.GET,
                urlAluno,
                null,
                responseAluno -> {
                    try {
                        if (responseAluno.length() > 0) {
                            JSONObject aluno = responseAluno.getJSONObject(0);

                            int idAluno = aluno.getInt("id_aluno");
                            int idPersonal = aluno.getInt("id_personal");

                            callback.onSucesso("aluno", idAluno, idLogin, idPersonal);
                        } else {
                            verificarSeEhPersonal(idLogin, callback);
                        }

                    } catch (Exception e) {
                        Log.e("VERIFICAR_ALUNO", e.toString());
                        callback.onErro(traduzirErro("Erro ao verificar aluno."));
                    }
                },
                error -> {
                    Log.e("BUSCAR_ALUNO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar aluno."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestAluno);
    }

    private void verificarSeEhPersonal(int idLogin, LoginCallback callback) {
        String urlPersonal = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_login", "eq." + idLogin)
                .build()
                .toString();

        JsonArrayRequest requestPersonal = new JsonArrayRequest(
                Request.Method.GET,
                urlPersonal,
                null,
                responsePersonal -> {
                    try {
                        if (responsePersonal.length() > 0) {
                            JSONObject personal = responsePersonal.getJSONObject(0);

                            int idPersonal = personal.getInt("id_personal");

                            callback.onSucesso("personal", idPersonal, idLogin, idPersonal);
                        } else {
                            callback.onErro(traduzirErro("Usuário sem perfil cadastrado."));
                        }

                    } catch (Exception e) {
                        Log.e("VERIFICAR_PERSONAL", e.toString());
                        callback.onErro(traduzirErro("Erro ao verificar personal."));
                    }
                },
                error -> {
                    Log.e("BUSCAR_PERSONAL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar personal."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestPersonal);
    }

    public void cadastrarAluno(
            String email,
            String senha,
            String nome,
            String cpf,
            String telefone,
            boolean sexo,
            String doenca,
            String lesao,
            int idade,
            double peso,
            double altura,
            int treinosPlanejadosSemana,
            CadastroCallback callback
    ) {
        inserirLogin(email, senha, new CadastroLoginCallback() {
            @Override
            public void onSucesso(int idLogin) {
                try {
                    double imc = peso / (altura * altura);

                    JSONObject aluno = new JSONObject();
                    aluno.put("nome", nome);
                    aluno.put("cpf", cpf);
                    aluno.put("telefone", telefone);
                    aluno.put("sexo", sexo);
                    aluno.put("doenca", doenca);
                    aluno.put("lesao", lesao);
                    aluno.put("idade", idade);
                    aluno.put("peso", peso);
                    aluno.put("altura", altura);
                    aluno.put("imc", imc);
                    aluno.put("score", 0);
                    aluno.put("treinos_planejados_semana", treinosPlanejadosSemana);
                    aluno.put("id_login", idLogin);
                    aluno.put("id_personal", ID_PERSONAL_PADRAO);

                    inserirAluno(aluno, callback);

                } catch (JSONException e) {
                    Log.e("CADASTRO_ALUNO", e.toString());
                    callback.onErro(traduzirErro("Erro ao montar dados do aluno."));
                }
            }

            @Override
            public void onErro(String mensagem) {
                callback.onErro(mensagem);
            }
        });
    }

    public void cadastrarPersonal(
            String email,
            String senha,
            String nome,
            String cpf,
            String cref,
            String telefone,
            boolean sexo,
            CadastroCallback callback
    ) {
        inserirLogin(email, senha, new CadastroLoginCallback() {
            @Override
            public void onSucesso(int idLogin) {
                try {
                    JSONObject personal = new JSONObject();
                    personal.put("nome", nome);
                    personal.put("cpf", cpf);
                    personal.put("cref", cref);
                    personal.put("telefone", telefone);
                    personal.put("sexo", sexo);
                    personal.put("id_login", idLogin);

                    inserirPersonal(personal, callback);

                } catch (JSONException e) {
                    Log.e("CADASTRO_PERSONAL", e.toString());
                    callback.onErro(traduzirErro("Erro ao montar dados do personal."));
                }
            }

            @Override
            public void onErro(String mensagem) {
                callback.onErro(mensagem);
            }
        });
    }

    private interface CadastroLoginCallback {
        void onSucesso(int idLogin);
        void onErro(String mensagem);
    }

    private void inserirLogin(String email, String senha, CadastroLoginCallback callback) {
        JSONObject body = new JSONObject();
        try {
            body.put("p_email", email);
            body.put("p_senha", senha);
        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao preparar cadastro do login."));
            return;
        }

        StringRequest request = new StringRequest(
                Request.Method.POST,
                SUPABASE_URL + "/rest/v1/rpc/criar_login_seguro",
                response -> {
                    try {
                        JSONArray resultado = new JSONArray(response);
                        callback.onSucesso(
                                resultado.getJSONObject(0).getInt("id_login")
                        );
                    } catch (Exception e) {
                        Log.e("CADASTRO_LOGIN_SEGURO", e.toString());
                        callback.onErro(traduzirErro("Login criado, mas não foi possível obter o ID."));
                    }
                },
                error -> {
                    String erro = obterErroVolley(error);
                    Log.e("CADASTRO_LOGIN_SEGURO", erro);
                    if (erro.contains("PGRST202")
                            || erro.contains("criar_login_seguro")) {
                        callback.onErro(
                                "Função de login seguro não configurada no Supabase."
                        );
                        return;
                    }
                    if (erro.contains("\"code\":\"23505\"")
                            || erro.contains("login_email_key")
                            || erro.contains("email) already exists")) {
                        callback.onErro(traduzirErro("Este e-mail já está cadastrado."));
                        return;
                    }
                    callback.onErro(traduzirErro("Erro ao cadastrar login."));
                }
        ) {
            @Override
            public byte[] getBody() {
                return body.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void inserirLoginAntigo(String email, String senha, CadastroLoginCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/login?select=*";

        try {
            JSONObject login = new JSONObject();
            login.put("email", email);
            login.put("senha", senha);

            JSONArray array = new JSONArray();
            array.put(login);

            JsonArrayRequest request = new JsonArrayRequest(
                    Request.Method.POST,
                    url,
                    array,
                    response -> {
                        try {
                            JSONObject loginCriado = response.getJSONObject(0);
                            int idLogin = loginCriado.getInt("id_login");

                            callback.onSucesso(idLogin);

                        } catch (JSONException e) {
                            Log.e("SUPABASE_LOGIN_ERRO", e.toString());
                            callback.onErro(traduzirErro("Login criado, mas não foi possível obter o ID."));
                        }
                    },
                    error -> {
                        Log.e("SUPABASE_LOGIN_ERRO", obterErroVolley(error));
                        callback.onErro(traduzirErro("Erro ao cadastrar login."));
                    }
            ) {
                @Override
                public Map<String, String> getHeaders() {
                    return criarHeaders(true);
                }
            };

            requestQueue.add(request);

        } catch (JSONException e) {
            Log.e("MONTAR_LOGIN", e.toString());
            callback.onErro(traduzirErro("Erro ao montar dados de login."));
        }
    }

    private void inserirAluno(JSONObject aluno, CadastroCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/alunos";

        enviarPost(url, aluno, new CadastroCallback() {
            @Override
            public void onSucesso() {
                callback.onSucesso();
            }

            @Override
            public void onErro(String mensagem) {
                callback.onErro("Erro ao cadastrar aluno: " + mensagem);
            }
        });
    }

    private void inserirPersonal(JSONObject personal, CadastroCallback callback) {
        String url = SUPABASE_URL + "/rest/v1/personal";

        enviarPost(url, personal, new CadastroCallback() {
            @Override
            public void onSucesso() {
                callback.onSucesso();
            }

            @Override
            public void onErro(String mensagem) {
                callback.onErro("Erro ao cadastrar personal: " + mensagem);
            }
        });
    }

    private void enviarPost(String url, JSONObject jsonBody, CadastroCallback callback) {
        StringRequest request = new StringRequest(
                Request.Method.POST,
                url,
                response -> {
                    Log.d("SUPABASE_POST_OK", response);
                    callback.onSucesso();
                },
                error -> {
                    String erro = obterErroVolley(error);
                    Log.e("SUPABASE_POST_ERRO", erro);
                    callback.onErro(erro);
                }
        ) {
            @Override
            public byte[] getBody() {
                return jsonBody.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(true);
            }
        };

        requestQueue.add(request);
    }

    private void chamarEdgeFunction(String url, JSONObject jsonBody, CadastroCallback callback) {
        StringRequest request = new StringRequest(
                Request.Method.POST,
                url,
                response -> {
                    Log.d("EDGE_FUNCTION_OK", response);
                    callback.onSucesso();
                },
                error -> {


                    String erro = obterErroVolley(error);
                    Log.e("EDGE_FUNCTION_ERRO", erro);
                    callback.onErro(erro);
                }
        ) {
            @Override
            public byte[] getBody() {
                return jsonBody.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }

        };

        requestQueue.add(request);
    }

    public void buscarPerfilAluno(int idAluno, PerfilAlunoCallback callback) {
        String urlAluno = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .build()
                .toString();

        JsonArrayRequest requestAluno = new JsonArrayRequest(
                Request.Method.GET,
                urlAluno,
                null,
                responseAluno -> {
                    try {
                        if (responseAluno.length() == 0) {
                            callback.onErro(traduzirErro("Aluno não encontrado."));
                            return;
                        }

                        JSONObject aluno = responseAluno.getJSONObject(0);
                        int idLogin = aluno.getInt("id_login");

                        buscarLoginDoPerfil(aluno, idLogin, callback);

                    } catch (Exception e) {
                        Log.e("BUSCAR_PERFIL_ALUNO", e.toString());
                        callback.onErro(traduzirErro("Erro ao carregar dados do aluno."));
                    }
                },
                error -> {
                    Log.e("BUSCAR_PERFIL_ALUNO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar perfil do aluno."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestAluno.setShouldCache(false);
        requestQueue.add(requestAluno);
    }

    private void buscarLoginDoPerfil(
            JSONObject aluno,
            int idLogin,
            PerfilAlunoCallback callback
    ) {
        String urlLogin = Uri.parse(SUPABASE_URL + "/rest/v1/login")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_login", "eq." + idLogin)
                .build()
                .toString();

        JsonArrayRequest requestLogin = new JsonArrayRequest(
                Request.Method.GET,
                urlLogin,
                null,
                responseLogin -> {
                    try {
                        if (responseLogin.length() == 0) {
                            callback.onErro(traduzirErro("Login não encontrado."));
                            return;
                        }

                        JSONObject login = responseLogin.getJSONObject(0);

                        JSONObject perfil = new JSONObject();

                        perfil.put("id_aluno", aluno.optInt("id_aluno"));
                        perfil.put("id_login", aluno.optInt("id_login"));
                        perfil.put("id_personal", aluno.optInt("id_personal"));

                        perfil.put("nome", aluno.optString("nome"));
                        perfil.put("cpf", aluno.optString("cpf"));
                        perfil.put("telefone", aluno.optString("telefone"));
                        perfil.put("sexo", aluno.optBoolean("sexo"));
                        perfil.put("doenca", aluno.optString("doenca"));
                        perfil.put("lesao", aluno.optString("lesao"));
                        perfil.put("idade", aluno.optInt("idade"));
                        perfil.put("peso", aluno.optDouble("peso"));
                        perfil.put("altura", aluno.optDouble("altura"));
                        perfil.put("imc", aluno.optDouble("imc"));
                        perfil.put("score", aluno.optInt("score"));
                        perfil.put("foto_url", aluno.optString("foto_url"));
                        perfil.put("treinos_planejados_semana", aluno.optInt("treinos_planejados_semana", 1));

                        perfil.put("email", login.optString("email"));
                        perfil.put("senha", "");

                        callback.onSucesso(perfil);

                    } catch (Exception e) {
                        Log.e("BUSCAR_LOGIN_PERFIL", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar perfil."));
                    }
                },
                error -> {
                    Log.e("BUSCAR_LOGIN_PERFIL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar login do perfil."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestLogin);
    }

    public void atualizarPerfilAluno(
            int idAluno,
            int idLogin,
            String nome,
            String email,
            String senha,
            String cpf,
            String telefone,
            int idade,
            double peso,
            double altura,
            double imc,
            String doenca,
            String lesao,
            boolean sexo,
            int treinosPlanejadosSemana,
            CadastroCallback callback
    ) {
        try {
            JSONObject loginAtualizado = new JSONObject();
            loginAtualizado.put("email", email);
            loginAtualizado.put("senha", senha);

            atualizarLogin(idLogin, loginAtualizado, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    try {
                        JSONObject alunoAtualizado = new JSONObject();

                        alunoAtualizado.put("nome", nome);
                        alunoAtualizado.put("cpf", cpf);
                        alunoAtualizado.put("telefone", telefone);
                        alunoAtualizado.put("idade", idade);
                        alunoAtualizado.put("peso", peso);
                        alunoAtualizado.put("altura", altura);
                        alunoAtualizado.put("imc", imc);
                        alunoAtualizado.put("doenca", doenca);
                        alunoAtualizado.put("lesao", lesao);
                        alunoAtualizado.put("sexo", sexo);
                        alunoAtualizado.put("treinos_planejados_semana", treinosPlanejadosSemana);

                        atualizarAluno(idAluno, alunoAtualizado, callback);

                    } catch (JSONException e) {
                        Log.e("UPDATE_ALUNO_JSON", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar dados do aluno."));
                    }
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro("Erro ao atualizar login: " + mensagem);
                }
            });

        } catch (JSONException e) {
            Log.e("UPDATE_LOGIN_JSON", e.toString());
            callback.onErro(traduzirErro("Erro ao montar dados de login."));
        }
    }

    private void atualizarLogin(
            int idLogin,
            JSONObject loginAtualizado,
            CadastroCallback callback
    ) {
        atualizarLoginSeguro(
                idLogin,
                loginAtualizado.optString("email"),
                loginAtualizado.optString("senha"),
                callback
        );
    }

    private void atualizarLoginSeguro(
            int idLogin,
            String email,
            String novaSenha,
            CadastroCallback callback
    ) {
        JSONObject body = new JSONObject();
        try {
            body.put("p_id_login", idLogin);
            body.put("p_email", email);
            body.put("p_nova_senha", novaSenha);
        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao preparar atualização do login."));
            return;
        }

        StringRequest request = new StringRequest(
                Request.Method.POST,
                SUPABASE_URL + "/rest/v1/rpc/atualizar_login_seguro",
                response -> callback.onSucesso(),
                error -> {
                    Log.e("ATUALIZAR_LOGIN_SEGURO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Não foi possível atualizar o login."));
                }
        ) {
            @Override
            public byte[] getBody() {
                return body.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void atualizarAluno(
            int idAluno,
            JSONObject alunoAtualizado,
            CadastroCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .build()
                .toString();

        enviarPatch(url, alunoAtualizado, callback);
    }

    public void atualizarFcmToken(
            String tipoUsuario,
            int idUsuario,
            String token,
            CadastroCallback callback
    ) {
        try {
            JSONObject usuarioAtualizado = new JSONObject();
            usuarioAtualizado.put("fcm_token", token);

            String tabela;
            String colunaId;

            if ("personal".equals(tipoUsuario)) {
                tabela = "personal";
                colunaId = "id_personal";
            } else if ("aluno".equals(tipoUsuario)) {
                tabela = "alunos";
                colunaId = "id_aluno";
            } else {
                callback.onErro(traduzirErro("Tipo de usuario invalido."));
                return;
            }

            String url = Uri.parse(SUPABASE_URL + "/rest/v1/" + tabela)
                    .buildUpon()
                    .appendQueryParameter(colunaId, "eq." + idUsuario)
                    .build()
                    .toString();

            enviarPatch(url, usuarioAtualizado, callback);

        } catch (JSONException e) {
            Log.e("FCM_TOKEN_JSON", e.toString());
            callback.onErro(traduzirErro("Erro ao montar token FCM."));
        }
    }

    private void enviarPatch(
            String url,
            JSONObject jsonBody,
            CadastroCallback callback
    ) {
        StringRequest request = new StringRequest(
                Request.Method.PATCH,
                url,
                response -> {
                    Log.d("SUPABASE_PATCH_OK", response);
                    callback.onSucesso();
                },
                error -> {
                    String erro = obterErroVolley(error);
                    Log.e("SUPABASE_PATCH_ERRO", erro);
                    callback.onErro(erro);
                }
        ) {
            @Override
            public byte[] getBody() {
                return jsonBody.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }

            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(true);
            }
        };

        requestQueue.add(request);
    }

    public void verificarEmailExiste(String email, VerificacaoCallback callback) {
        String emailNormalizado = email == null
                ? ""
                : email.trim().toLowerCase(java.util.Locale.ROOT);

        String url = Uri.parse(SUPABASE_URL + "/rest/v1/login")
                .buildUpon()
                .appendQueryParameter("select", "id_login")
                .appendQueryParameter("email", "ilike." + emailNormalizado)
                .appendQueryParameter("limit", "1")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> callback.onResultado(response.length() > 0),
                error -> {
                    Log.e("VERIFICAR_EMAIL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao verificar o e-mail."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public void salvarFotoPerfil(
            String tipoUsuario,
            int idUsuario,
            byte[] imagem,
            FotoPerfilCallback callback
    ) {
        boolean aluno = "aluno".equalsIgnoreCase(tipoUsuario);
        String pasta = aluno ? "alunos" : "personais";
        String tabela = aluno ? "alunos" : "personal";
        String colunaId = aluno ? "id_aluno" : "id_personal";
        // Um nome novo evita que caches continuem mostrando a foto anterior após a troca.
        String caminho = pasta + "/" + idUsuario + "/foto_" + System.currentTimeMillis() + ".jpg";
        String urlUpload = SUPABASE_URL + "/storage/v1/object/fotos-perfil/" + caminho;

        StringRequest upload = new StringRequest(
                Request.Method.POST,
                urlUpload,
                response -> {
                    String fotoUrl = SUPABASE_URL
                            + "/storage/v1/object/public/fotos-perfil/" + caminho;
                    try {
                        JSONObject body = new JSONObject();
                        body.put("foto_url", fotoUrl);
                        String urlPerfil = Uri.parse(SUPABASE_URL + "/rest/v1/" + tabela)
                                .buildUpon()
                                .appendQueryParameter(colunaId, "eq." + idUsuario)
                                .build()
                                .toString();
                        enviarPatch(urlPerfil, body, new CadastroCallback() {
                            @Override
                            public void onSucesso() {
                                callback.onSucesso(fotoUrl);
                            }

                            @Override
                            public void onErro(String mensagem) {
                                callback.onErro(traduzirErro("Foto enviada, mas não foi possível atualizar o perfil."));
                            }
                        });
                    } catch (JSONException e) {
                        callback.onErro(traduzirErro("Erro ao preparar a foto do perfil."));
                    }
                },
                error -> {
                    Log.e("UPLOAD_FOTO_PERFIL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao enviar a foto do perfil."));
                }
        ) {
            @Override
            public byte[] getBody() {
                return imagem;
            }

            @Override
            public String getBodyContentType() {
                return "image/jpeg";
            }

            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = criarHeaders(false);
                headers.put("Content-Type", "image/jpeg");
                headers.put("x-upsert", "true");
                return headers;
            }
        };

        requestQueue.add(upload);
    }

    public void removerFotoPerfil(
            String tipoUsuario,
            int idUsuario,
            String fotoUrlAtual,
            CadastroCallback callback
    ) {
        boolean aluno = "aluno".equalsIgnoreCase(tipoUsuario);
        String tabela = aluno ? "alunos" : "personal";
        String colunaId = aluno ? "id_aluno" : "id_personal";
        try {
            JSONObject body = new JSONObject();
            body.put("foto_url", JSONObject.NULL);
            String urlPerfil = Uri.parse(SUPABASE_URL + "/rest/v1/" + tabela)
                    .buildUpon()
                    .appendQueryParameter(colunaId, "eq." + idUsuario)
                    .build()
                    .toString();
            enviarPatch(urlPerfil, body, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    excluirArquivoFoto(fotoUrlAtual);
                    callback.onSucesso();
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(traduzirErro("Erro ao remover a foto do perfil."));
                }
            });
        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao preparar a remoção da foto."));
        }
    }

    private void excluirArquivoFoto(String fotoUrl) {
        // Somente URLs do bucket conhecido podem virar uma requisição de exclusão.
        String marcador = "/storage/v1/object/public/fotos-perfil/";
        if (fotoUrl == null || !fotoUrl.contains(marcador)) {
            return;
        }
        String caminho = fotoUrl.substring(fotoUrl.indexOf(marcador) + marcador.length());
        StringRequest request = new StringRequest(
                Request.Method.DELETE,
                SUPABASE_URL + "/storage/v1/object/fotos-perfil/" + caminho,
                response -> Log.d("EXCLUIR_FOTO_PERFIL", "Foto antiga removida do Storage."),
                error -> Log.w("EXCLUIR_FOTO_PERFIL", obterErroVolley(error))
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };
        requestQueue.add(request);
    }

    public void verificarCpfExiste(String cpf, VerificacaoCallback callback) {
        String urlAlunos = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "cpf")
                .appendQueryParameter("cpf", "eq." + cpf)
                .build()
                .toString();

        JsonArrayRequest requestAluno = new JsonArrayRequest(
                Request.Method.GET,
                urlAlunos,
                null,
                responseAluno -> {
                    if (responseAluno.length() > 0) {
                        callback.onResultado(true);
                    } else {
                        verificarCpfPersonalExiste(cpf, callback);
                    }
                },
                error -> {
                    Log.e("VERIFICAR_CPF_ALUNO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao verificar CPF em alunos."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestAluno);
    }

    private void verificarCpfPersonalExiste(
            String cpf,
            VerificacaoCallback callback
    ) {
        String urlPersonal = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("select", "cpf")
                .appendQueryParameter("cpf", "eq." + cpf)
                .build()
                .toString();

        JsonArrayRequest requestPersonal = new JsonArrayRequest(
                Request.Method.GET,
                urlPersonal,
                null,
                responsePersonal -> callback.onResultado(responsePersonal.length() > 0),
                error -> {
                    Log.e("VERIFICAR_CPF_PERSONAL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao verificar CPF em personal."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestPersonal);
    }

    public void verificarCpfExisteIgnorandoAluno(
            String cpf,
            int idAluno,
            VerificacaoCallback callback
    ) {
        String urlAlunos = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "id_aluno,cpf")
                .appendQueryParameter("cpf", "eq." + cpf)
                .appendQueryParameter("id_aluno", "neq." + idAluno)
                .build()
                .toString();

        JsonArrayRequest requestAluno = new JsonArrayRequest(
                Request.Method.GET,
                urlAlunos,
                null,
                responseAluno -> {
                    if (responseAluno.length() > 0) {
                        callback.onResultado(true);
                    } else {
                        verificarCpfPersonalExiste(cpf, callback);
                    }
                },
                error -> {
                    Log.e("CPF_IGNORANDO_ALUNO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao verificar CPF."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestAluno);
    }

    public void verificarCrefExiste(String cref, VerificacaoCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("select", "cref")
                .appendQueryParameter("cref", "eq." + cref)
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> callback.onResultado(response.length() > 0),
                error -> {
                    Log.e("VERIFICAR_CREF", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao verificar CREF."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private Map<String, String> criarHeaders(boolean retornarRegistro) {
        Map<String, String> headers = new HashMap<>();

        headers.put("apikey", SUPABASE_KEY);
        headers.put("Authorization", "Bearer " + SUPABASE_KEY);
        headers.put("Content-Type", "application/json");

        if (retornarRegistro) {
            headers.put("Prefer", "return=representation");
        }

        return headers;
    }

    private String obterErroVolley(com.android.volley.VolleyError error) {
        if (error.networkResponse != null && error.networkResponse.data != null) {
            return new String(error.networkResponse.data, StandardCharsets.UTF_8);
        }

        if (error.getMessage() != null) {
            return error.getMessage();
        }

        return "Erro desconhecido";
    }

    public interface PersonaisCallback {
        void onSucesso(List<Personal> personais);
        void onErro(String mensagem);
    }

    public void buscarPersonaisDisponiveis(int idPersonalAtual, PersonaisCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("select", "id_personal,nome,cref,telefone,foto_url")
                .appendQueryParameter("id_personal", "neq.1")
                .appendQueryParameter("order", "nome.asc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<Personal> lista = new ArrayList<>();
                        Personal personalVinculado = null;

                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);

                            int idPersonal = obj.optInt("id_personal");
                            boolean vinculado = idPersonal == idPersonalAtual;

                            Personal personal = new Personal(
                                    idPersonal,
                                    obj.optString("nome"),
                                    obj.optString("cref"),
                                    obj.optString("telefone"),
                                    vinculado,
                                    obj.optString("foto_url")
                            );

                            if (vinculado) {
                                personalVinculado = personal;
                            } else {
                                lista.add(personal);
                            }
                        }

                        if (personalVinculado != null) {
                            lista.add(0, personalVinculado);
                        }

                        callback.onSucesso(lista);

                    } catch (Exception e) {
                        Log.e("BUSCAR_PERSONAIS", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar lista de personais."));
                    }
                },
                error -> {
                    Log.e("BUSCAR_PERSONAIS", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar personais."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public interface DetalhePersonalCallback {
        void onSucesso(JSONObject personal);
        void onErro(String mensagem);
    }

    public void buscarDetalhePersonal(int idPersonal, DetalhePersonalCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        if (response.length() == 0) {
                            callback.onErro(traduzirErro("Personal não encontrado."));
                            return;
                        }

                        callback.onSucesso(response.getJSONObject(0));

                    } catch (Exception e) {
                        Log.e("DETALHE_PERSONAL", e.toString());
                        callback.onErro(traduzirErro("Erro ao carregar personal."));
                    }
                },
                error -> {
                    Log.e("DETALHE_PERSONAL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar personal."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    public void solicitarVinculo(int idAluno, int idPersonal, CadastroCallback callback) {

        verificarAlunoJaTemPersonal(idAluno, new VerificacaoCallback() {
            @Override
            public void onResultado(boolean jaTemPersonal) {

                if (jaTemPersonal) {
                    callback.onErro(traduzirErro("Você já está vinculado a um personal."));
                    return;
                }

                verificarAlunoTemSolicitacaoPendente(idAluno, new VerificacaoCallback() {
                    @Override
                    public void onResultado(boolean temPendente) {

                        if (temPendente) {
                            callback.onErro(traduzirErro("Você já possui uma solicitação pendente."));
                            return;
                        }

                        criarSolicitacaoVinculo(idAluno, idPersonal, callback);
                    }

                    @Override
                    public void onErro(String mensagem) {
                        callback.onErro(mensagem);
                    }
                });
            }

            @Override
            public void onErro(String mensagem) {
                callback.onErro(mensagem);
            }
        });
    }

    private void verificarAlunoJaTemPersonal(
            int idAluno,
            VerificacaoCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "id_personal")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        if (response.length() == 0) {
                            callback.onErro(traduzirErro("Aluno não encontrado."));
                            return;
                        }

                        int idPersonalAtual =
                                response.getJSONObject(0).optInt("id_personal", 1);

                        callback.onResultado(idPersonalAtual != 1);

                    } catch (Exception e) {
                        callback.onErro(traduzirErro("Erro ao verificar vínculo do aluno."));
                    }
                },
                error -> callback.onErro("Erro ao verificar vínculo do aluno.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void verificarAlunoTemSolicitacaoPendente(
            int idAluno,
            VerificacaoCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                .buildUpon()
                .appendQueryParameter("select", "id_solicitacao")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .appendQueryParameter("status", "eq.pendente")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> callback.onResultado(response.length() > 0),
                error -> callback.onErro("Erro ao verificar solicitação pendente.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void criarSolicitacaoVinculo(
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject solicitacao = new JSONObject();

            solicitacao.put("id_aluno", idAluno);
            solicitacao.put("id_personal", idPersonal);
            solicitacao.put("status", "pendente");

            String url = SUPABASE_URL + "/rest/v1/solicitacao_vinculo";

            enviarPost(url, solicitacao, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    enviarNotificacaoSolicitacaoVinculo(idAluno, idPersonal, callback);
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(mensagem);
                }
            });

        } catch (Exception e) {
            callback.onErro(traduzirErro("Erro ao montar solicitação."));
        }
    }

    private void enviarNotificacaoSolicitacaoVinculo(
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject body = new JSONObject();
            body.put("id_aluno", idAluno);
            body.put("id_personal", idPersonal);

            chamarEdgeFunction(
                    EDGE_SEND_LINK_REQUEST_NOTIFICATION,
                    body,
                    new CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            callback.onSucesso();
                        }

                        @Override
                        public void onErro(String mensagem) {
                            Log.e("FCM_PUSH", "Solicitação criada, mas push falhou: " + mensagem);
                            callback.onErro("Solicitação criada, mas a notificação falhou: " + mensagem);
                        }
                    }
            );

        } catch (JSONException e) {
            Log.e("FCM_PUSH_JSON", e.toString());
            callback.onErro(traduzirErro("Solicitação criada, mas erro ao montar notificação."));
        }
    }

    private void verificarSolicitacaoPendente(
            int idAluno,
            int idPersonal,
            VerificacaoCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                .buildUpon()
                .appendQueryParameter("select", "id_solicitacao")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("status", "eq.pendente")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> callback.onResultado(response.length() > 0),
                error -> callback.onErro("Erro ao verificar solicitação.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    public void desvincularPersonal(int idAluno, int idPersonal, CadastroCallback callback) {
        try {
            JSONObject alunoAtualizado = new JSONObject();
            alunoAtualizado.put("id_personal", 1);

            String urlAluno = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                    .buildUpon()
                    .appendQueryParameter("id_aluno", "eq." + idAluno)
                    .build()
                    .toString();

            enviarPatch(urlAluno, alunoAtualizado, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    cancelarSolicitacaoVinculo(idAluno, idPersonal, callback);
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(traduzirErro("Erro ao desvincular aluno."));
                }
            });

        } catch (Exception e) {
            Log.e("DESVINCULAR_PERSONAL", e.toString());
            callback.onErro(traduzirErro("Erro ao montar desvinculação."));
        }
    }

    private void cancelarSolicitacaoVinculo(
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject solicitacaoAtualizada = new JSONObject();
            solicitacaoAtualizada.put("status", "cancelada");

            String url = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                    .buildUpon()
                    .appendQueryParameter("id_aluno", "eq." + idAluno)
                    .appendQueryParameter("id_personal", "eq." + idPersonal)
                    .build()
                    .toString();

            enviarPatch(url, solicitacaoAtualizada, callback);

        } catch (Exception e) {
            Log.e("CANCELAR_VINCULO", e.toString());
            callback.onErro(traduzirErro("Personal desvinculado, mas erro ao cancelar solicitação."));
        }
    }

    public interface RankingAlunosCallback {
        void onSucesso(List<AlunoRanking> alunos);
        void onErro(String mensagem);
    }

    public void buscarRankingAlunosDoPersonal(
            int idPersonal,
            RankingAlunosCallback callback
    ) {
        buscarRankingAlunosDoPersonalFallback(idPersonal, callback);
    }

    private void buscarRankingAlunosDoPersonalRpc(
            int idPersonal,
            RankingAlunosCallback callback
    ) {
        JSONObject body = new JSONObject();
        try {
            body.put("p_id_personal", idPersonal);
        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao montar busca do ranking."));
            return;
        }

        StringRequest request = new StringRequest(
                Request.Method.POST,
                SUPABASE_URL + "/rest/v1/rpc/ranking_alunos_personal",
                response -> {
                    try {
                        JSONArray rankingJson = new JSONArray(response);
                        List<AlunoRanking> alunos = new ArrayList<>();

                        for (int i = 0; i < rankingJson.length(); i++) {
                            JSONObject obj = rankingJson.getJSONObject(i);

                            AlunoRanking aluno = new AlunoRanking(
                                    obj.optInt("id_aluno"),
                                    obj.optString("nome"),
                                    Math.round(obj.optDouble("score", 0) * 100.0) / 100.0,
                                    optIntComAlternativas(obj, "treinos_planejados_semana", "treinosplanejadossemana", "treinosPlanejadosSemana"),
                                    optIntComAlternativas(obj, "treinos_realizados_semana", "treinosrealizadossemana", "treinosRealizadosSemana"),
                                    optIntComAlternativas(obj, "semanas_consecutivas_meta_cumprida", "semanasconsecutivasmetacumprida", "semanasConsecutivasMetaCumprida"),
                                    optIntComAlternativas(obj, "total_treinos_realizados", "totaltreinosrealizados", "totalTreinosRealizados")
                            );

                            alunos.add(aluno);
                        }

                        Collections.sort(alunos, (a, b) -> {
                            int porScore = Double.compare(b.getScore(), a.getScore());
                            if (porScore != 0) {
                                return porScore;
                            }

                            int porStreak = Integer.compare(
                                    b.getSemanasConsecutivasMetaCumprida(),
                                    a.getSemanasConsecutivasMetaCumprida()
                            );
                            if (porStreak != 0) {
                                return porStreak;
                            }

                            return Integer.compare(
                                    b.getTotalTreinosRealizados(),
                                    a.getTotalTreinosRealizados()
                            );
                        });

                        callback.onSucesso(alunos);

                    } catch (Exception e) {
                        Log.e("RANKING_ALUNOS", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar ranking."));
                    }
                },
                error -> {
                    Log.e("RANKING_ALUNOS", obterErroVolley(error));
                    buscarRankingAlunosDoPersonalFallback(idPersonal, callback);
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }

            @Override
            public byte[] getBody() {
                return body.toString().getBytes(StandardCharsets.UTF_8);
            }

            @Override
            public String getBodyContentType() {
                return "application/json; charset=utf-8";
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    private void buscarRankingAlunosDoPersonalFallback(
            int idPersonal,
            RankingAlunosCallback callback
    ) {
        String urlAlunos = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "id_aluno,nome,treinos_planejados_semana,foto_url")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .build()
                .toString();

        JsonArrayRequest alunosRequest = new JsonArrayRequest(
                Request.Method.GET,
                urlAlunos,
                null,
                alunosResponse -> buscarHistoricoParaRankingFallback(idPersonal, alunosResponse, callback),
                error -> {
                    Log.e("RANKING_ALUNOS_FALLBACK", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar ranking."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeadersSemCache();
            }
        };

        alunosRequest.setShouldCache(false);
        requestQueue.add(alunosRequest);
    }

    private void buscarHistoricoParaRankingFallback(
            int idPersonal,
            JSONArray alunosResponse,
            RankingAlunosCallback callback
    ) {
        if (alunosResponse.length() == 0) {
            callback.onSucesso(new ArrayList<>());
            return;
        }

        String urlHistorico = Uri.parse(SUPABASE_URL + "/rest/v1/historico_treinos")
                .buildUpon()
                .appendQueryParameter("select", "id_aluno,data_treino,status")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .build()
                .toString();

        JsonArrayRequest historicoRequest = new JsonArrayRequest(
                Request.Method.GET,
                urlHistorico,
                null,
                historicoResponse -> montarRankingFallback(alunosResponse, historicoResponse, callback),
                error -> {
                    Log.e("RANKING_HISTORICO_FALLBACK", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar ranking."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeadersSemCache();
            }
        };

        historicoRequest.setShouldCache(false);
        requestQueue.add(historicoRequest);
    }

    private Map<String, String> criarHeadersSemCache() {
        Map<String, String> headers = criarHeaders(false);
        headers.put("Cache-Control", "no-cache, no-store");
        headers.put("Pragma", "no-cache");
        return headers;
    }

    private void montarRankingFallback(
            JSONArray alunosResponse,
            JSONArray historicoResponse,
            RankingAlunosCallback callback
    ) {
        try {
            List<AlunoRanking> ranking = new ArrayList<>();
            java.util.Calendar hoje = java.util.Calendar.getInstance();
            // Usa uma data do próprio histórico caso o relógio do aparelho esteja fora do ano dos treinos.
            java.util.Calendar dataReferencia = obterDataReferenciaRanking(historicoResponse, hoje);
            java.util.Calendar inicioSemanaAtual = inicioDaSemana(dataReferencia);
            int anoAtual = dataReferencia.get(java.util.Calendar.YEAR);

            java.util.Calendar primeiroDiaAno = java.util.Calendar.getInstance();
            primeiroDiaAno.clear();
            primeiroDiaAno.set(anoAtual, java.util.Calendar.JANUARY, 1);
            java.util.Calendar primeiraSemanaAno = inicioDaSemana(primeiroDiaAno);

            for (int i = 0; i < alunosResponse.length(); i++) {
                JSONObject alunoJson = alunosResponse.getJSONObject(i);
                int idAluno = alunoJson.optInt("id_aluno");
                String nome = alunoJson.optString("nome");
                int planejados = Math.max(1, alunoJson.optInt("treinos_planejados_semana", 1));

                // O Set impede que dois treinos feitos no mesmo dia contem como dois dias de adesão.
                Map<String, Set<String>> diasTreinadosPorSemana = new HashMap<>();
                Set<String> diasTreinadosNoAno = new HashSet<>();

                for (int j = 0; j < historicoResponse.length(); j++) {
                    JSONObject historico = historicoResponse.getJSONObject(j);
                    if (historico.optInt("id_aluno") != idAluno) {
                        continue;
                    }

                    String status = historico.optString("status", "")
                            .trim()
                            .toLowerCase(java.util.Locale.ROOT);
                    if (!statusContaNoRanking(status)) {
                        continue;
                    }

                    String dataHistorico = normalizarDataParaComparacao(historico.optString("data_treino", ""));
                    if (dataHistorico.isEmpty()) {
                        continue;
                    }

                    java.util.Calendar data = calendarDeDataBanco(dataHistorico);
                    if (data == null) {
                        continue;
                    }

                    if (data.get(java.util.Calendar.YEAR) != anoAtual) {
                        continue;
                    }

                    diasTreinadosNoAno.add(dataHistorico);

                    String chaveSemana = formatarDataBanco(inicioDaSemana(data));
                    Set<String> diasDaSemana = diasTreinadosPorSemana.get(chaveSemana);
                    if (diasDaSemana == null) {
                        diasDaSemana = new HashSet<>();
                        diasTreinadosPorSemana.put(chaveSemana, diasDaSemana);
                    }
                    diasDaSemana.add(dataHistorico);
                }

                String chaveSemanaAtual = formatarDataBanco(inicioSemanaAtual);
                Set<String> diasSemanaAtual = diasTreinadosPorSemana.get(chaveSemanaAtual);
                int realizadosSemana = diasSemanaAtual != null ? diasSemanaAtual.size() : 0;

                double scoreAcumulado = 0.0;
                for (Map.Entry<String, Set<String>> semanaTreinada
                        : diasTreinadosPorSemana.entrySet()) {
                    java.util.Calendar inicioSemana =
                            calendarDeDataBanco(semanaTreinada.getKey());
                    if (inicioSemana == null || inicioSemana.after(inicioSemanaAtual)) {
                        continue;
                    }

                    int diasRealizados = semanaTreinada.getValue().size();
                    // Cada semana vale no máximo 100 pontos, independentemente do volume prescrito.
                    double scoreSemana =
                            (Math.min(diasRealizados, planejados) * 100.0) / planejados;
                    scoreAcumulado += scoreSemana;
                }

                int streak = calcularStreakAnual(
                        diasTreinadosPorSemana,
                        planejados,
                        primeiraSemanaAno,
                        inicioSemanaAtual
                );

                double score = Math.round(scoreAcumulado * 100.0) / 100.0;
                Log.d(
                        "RANKING_CALCULO",
                        "Aluno=" + idAluno
                                + " planejados=" + planejados
                                + " diasSemana=" + realizadosSemana
                                + " score=" + score
                );
                ranking.add(new AlunoRanking(
                        idAluno,
                        nome,
                        score,
                        planejados,
                        realizadosSemana,
                        streak,
                        diasTreinadosNoAno.size(),
                        alunoJson.optString("foto_url")
                ));
            }

            Collections.sort(ranking, (a, b) -> {
                int porScore = Double.compare(b.getScore(), a.getScore());
                if (porScore != 0) {
                    return porScore;
                }

                int porStreak = Integer.compare(
                        b.getSemanasConsecutivasMetaCumprida(),
                        a.getSemanasConsecutivasMetaCumprida()
                );
                if (porStreak != 0) {
                    return porStreak;
                }

                return Integer.compare(
                        b.getTotalTreinosRealizados(),
                        a.getTotalTreinosRealizados()
                );
            });

            callback.onSucesso(ranking);
        } catch (Exception e) {
            Log.e("RANKING_FALLBACK", e.toString());
            callback.onErro(traduzirErro("Erro ao montar ranking."));
        }
    }

    private java.util.Calendar obterDataReferenciaRanking(
            JSONArray historicoResponse,
            java.util.Calendar hoje
    ) {
        int anoDoAparelho = hoje.get(java.util.Calendar.YEAR);
        boolean possuiTreinoNoAnoDoAparelho = false;
        java.util.Calendar dataMaisRecente = null;

        for (int i = 0; i < historicoResponse.length(); i++) {
            JSONObject historico = historicoResponse.optJSONObject(i);
            if (historico == null) {
                continue;
            }

            String status = historico.optString("status", "")
                    .trim()
                    .toLowerCase(java.util.Locale.ROOT);
            if (!statusContaNoRanking(status)) {
                continue;
            }

            String dataNormalizada =
                    normalizarDataParaComparacao(historico.optString("data_treino", ""));
            java.util.Calendar data = calendarDeDataBanco(dataNormalizada);
            if (data == null) {
                continue;
            }

            if (data.get(java.util.Calendar.YEAR) == anoDoAparelho) {
                possuiTreinoNoAnoDoAparelho = true;
            }

            if (dataMaisRecente == null || data.after(dataMaisRecente)) {
                dataMaisRecente = data;
            }
        }

        if (possuiTreinoNoAnoDoAparelho || dataMaisRecente == null) {
            return hoje;
        }

        Log.w(
                "RANKING_CALCULO",
                "Ano do aparelho sem histórico; usando "
                        + formatarDataBanco(dataMaisRecente)
                        + " como referência."
        );
        return dataMaisRecente;
    }

    private boolean statusContaNoRanking(String status) {
        return "realizado".equals(status)
                || "finalizado".equals(status)
                || "concluido".equals(status)
                || "concluído".equals(status);
    }

    private int calcularStreakAnual(
            Map<String, Set<String>> diasTreinadosPorSemana,
            int planejados,
            java.util.Calendar primeiraSemanaAno,
            java.util.Calendar inicioSemanaAtual
    ) {
        java.util.Calendar semana = (java.util.Calendar) inicioSemanaAtual.clone();
        Set<String> diasSemanaAtual = diasTreinadosPorSemana.get(formatarDataBanco(semana));

        if (diasSemanaAtual == null || diasSemanaAtual.size() < planejados) {
            semana.add(java.util.Calendar.DAY_OF_MONTH, -7);
        }

        int streak = 0;
        while (!semana.before(primeiraSemanaAno)) {
            Set<String> dias = diasTreinadosPorSemana.get(formatarDataBanco(semana));
            if (dias == null || dias.size() < planejados) {
                break;
            }
            streak++;
            semana.add(java.util.Calendar.DAY_OF_MONTH, -7);
        }
        return streak;
    }

    private String formatarDataBanco(java.util.Calendar data) {
        return new java.text.SimpleDateFormat(
                "yyyy-MM-dd",
                java.util.Locale.US
        ).format(data.getTime());
    }

    private java.util.Calendar calendarDeDataBanco(String data) {
        try {
            java.util.Date date = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).parse(data);
            if (date == null) {
                return null;
            }
            java.util.Calendar calendar = java.util.Calendar.getInstance();
            calendar.setTime(date);
            return calendar;
        } catch (Exception e) {
            return null;
        }
    }

    private java.util.Calendar inicioDaSemana(java.util.Calendar data) {
        java.util.Calendar inicio = (java.util.Calendar) data.clone();
        inicio.setFirstDayOfWeek(java.util.Calendar.MONDAY);
        inicio.set(java.util.Calendar.DAY_OF_WEEK, java.util.Calendar.MONDAY);
        inicio.set(java.util.Calendar.HOUR_OF_DAY, 0);
        inicio.set(java.util.Calendar.MINUTE, 0);
        inicio.set(java.util.Calendar.SECOND, 0);
        inicio.set(java.util.Calendar.MILLISECOND, 0);
        return inicio;
    }

    private java.util.Calendar somarDias(java.util.Calendar data, int dias) {
        java.util.Calendar copia = (java.util.Calendar) data.clone();
        copia.add(java.util.Calendar.DAY_OF_MONTH, dias);
        return copia;
    }

    private int semanasEntre(java.util.Calendar inicio, java.util.Calendar fim) {
        long diff = fim.getTimeInMillis() - inicio.getTimeInMillis();
        return (int) (diff / (7L * 24L * 60L * 60L * 1000L));
    }

    public interface AlunosSimplesCallback {
        void onSucesso(List<AlunoSimples> alunos);
        void onErro(String mensagem);
    }

    public void buscarAlunosDoPersonalSimples(
            int idPersonal,
            AlunosSimplesCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "id_aluno,nome")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("order", "nome.asc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<AlunoSimples> alunos = new ArrayList<>();

                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);

                            AlunoSimples aluno = new AlunoSimples(
                                    obj.optInt("id_aluno"),
                                    obj.optString("nome")
                            );

                            alunos.add(aluno);
                        }

                        callback.onSucesso(alunos);

                    } catch (Exception e) {
                        Log.e("BUSCAR_ALUNOS_PERSONAL", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar lista de alunos."));
                    }
                },
                error -> {
                    Log.e("BUSCAR_ALUNOS_PERSONAL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar alunos."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public void verificarHistoricoTreino(
            int idAluno,
            int idPersonal,
            String dataTreino,
            VerificacaoCallback callback
    ) {
        buscarHistoricoTreinosPersonal(idAluno, idPersonal, dataTreino, new TreinosCallback() {
            @Override
            public void onSucesso(List<Treino> treinos) {
                callback.onResultado(!treinos.isEmpty());
            }

            @Override
            public void onErro(String mensagem) {
                callback.onErro(mensagem);
            }
        });
    }

    public void buscarHistoricoTreinosPersonal(
            int idAluno,
            int idPersonal,
            String dataTreino,
            TreinosCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/historico_treinos")
                .buildUpon()
                .appendQueryParameter("select", "*,treino(*,treino_exercicio(exercicio(*)))")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("data_treino", "gte." + dataTreino)
                .appendQueryParameter("data_treino", "lt." + obterProximoDia(dataTreino))
                .appendQueryParameter("order", "data_treino.desc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        Log.d("HISTORICO_ALUNO_RAW", response.toString());
                        List<Treino> treinos = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);
                            JSONObject treinoJson = obj.optJSONObject("treino");
                            if (treinoJson == null) {
                                treinoJson = obj;
                            }
                            Treino treino = new Treino(
                                    String.valueOf(treinoJson.optLong("id_treino", obj.optLong("id_treino"))),
                                    obj.optString("nome_treino", treinoJson.optString("nome")),
                                    obj.optString("descricao", treinoJson.optString("descricao")),
                                    obj.optString("data_treino", treinoJson.optString("data")),
                                    "Personal",
                                    obterNomeNivel(treinoJson.optInt("id_nivel")),
                                    "",
                                    montarExerciciosDoTreino(treinoJson)
                            );
                            treino.setIdNivel(treinoJson.optInt("id_nivel"));
                            treino.setAtribuido(true);
                            treino.setStatus(obj.optString("status", "realizado"));
                            treino.setGrauDificuldade(obj.optInt("graudificuldade", 0));
                            treino.setObservacao(obj.optString("observacao", ""));
                            treinos.add(treino);
                        }
                        callback.onSucesso(treinos);
                    } catch (Exception e) {
                        Log.e("HISTORICO_TREINOS", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar histórico de treinos."));
                    }
                },
                error -> {
                    Log.e("VERIFICAR_HISTORICO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar treino."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public void buscarHistoricoTreinosAluno(
            int idAluno,
            String dataTreino,
            TreinosCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/historico_treinos")
                .buildUpon()
                .appendQueryParameter(
                        "select",
                        "*,personal(nome),treino(*,treino_exercicio(exercicio(*)))"
                )
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .appendQueryParameter("order", "data_treino.desc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        Log.d("HISTORICO_ALUNO_RAW", response.toString());
                        List<Treino> treinos = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);
                            // A filtragem local mantém compatibilidade com registros antigos em formatos de data diferentes.
                            if (!mesmaDataHistorico(obj.optString("data_treino", ""), dataTreino)) {
                                continue;
                            }

                            JSONObject treinoJson = obj.optJSONObject("treino");
                            JSONObject personalJson = obj.optJSONObject("personal");
                            String nomePersonal = personalJson != null
                                    ? personalJson.optString("nome", "Personal")
                                    : "Personal";
                            Treino treino = new Treino(
                                    String.valueOf(obj.optLong("id_treino")),
                                    obj.optString("nome_treino", "Treino"),
                                    obj.optString("descricao", treinoJson != null ? treinoJson.optString("descricao", "") : ""),
                                    obj.optString("data_treino", dataTreino),
                                    nomePersonal,
                                    treinoJson != null ? obterNomeNivel(treinoJson.optInt("id_nivel")) : "",
                                    "",
                                    treinoJson != null ? montarExerciciosDoTreino(treinoJson) : new ArrayList<>()
                            );
                            if (treinoJson != null) {
                                treino.setIdNivel(treinoJson.optInt("id_nivel"));
                            }
                            treino.setAtribuido(true);
                            treino.setStatus(obj.optString("status", "realizado"));
                            treino.setGrauDificuldade(obj.optInt("graudificuldade", 0));
                            treino.setObservacao(obj.optString("observacao", ""));
                            treinos.add(treino);
                        }
                        callback.onSucesso(treinos);
                    } catch (Exception e) {
                        Log.e("HISTORICO_ALUNO", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar histórico de treinos."));
                    }
                },
                error -> {
                    Log.e("HISTORICO_ALUNO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar histórico de treinos."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }

        };

        requestQueue.add(request);
    }

    public interface AlunosPersonalCallback {
        void onSucesso(List<AlunoPersonal> alunos);
        void onErro(String mensagem);
    }

    public interface TreinosCallback {
        void onSucesso(List<Treino> treinos);
        void onErro(String mensagem);
    }

    public interface IdsAlunosCallback {
        void onSucesso(List<Integer> idsAlunos);
        void onErro(String mensagem);
    }

    public interface ExerciciosCallback {
        void onSucesso(List<Exercicio> exercicios);
        void onErro(String mensagem);
    }

    public interface NiveisCallback {
        void onSucesso(List<Nivel> niveis);
        void onErro(String mensagem);
    }

    public void buscarExercicios(ExerciciosCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/exercicio")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("order", "nome.asc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<Exercicio> exercicios = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);
                            exercicios.add(new Exercicio(
                                    obj.optInt("id_exercicio"),
                                    obj.optString("nome"),
                                    obj.optString("descricao"),
                                    "1",
                                    String.valueOf(obj.optInt("repeticao")),
                                    obj.optString("peso") + " kg"
                            ));
                        }
                        callback.onSucesso(exercicios);
                    } catch (Exception e) {
                        callback.onErro(traduzirErro("Erro ao montar exercícios."));
                    }
                },
                error -> callback.onErro("Erro ao buscar exercícios.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }

        };

        requestQueue.add(request);
    }

    private String obterProximoDia(String dataTreino) {
        try {
            java.text.SimpleDateFormat format = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US);
            java.util.Date data = format.parse(dataTreino);
            java.util.Calendar calendar = java.util.Calendar.getInstance();
            calendar.setTime(data);
            calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
            return format.format(calendar.getTime());
        } catch (Exception e) {
            return dataTreino;
        }
    }

    private int optIntComAlternativas(JSONObject obj, String... chaves) {
        for (String chave : chaves) {
            if (obj.has(chave) && !obj.isNull(chave)) {
                return obj.optInt(chave, 0);
            }
        }
        return 0;
    }

    private boolean mesmaDataHistorico(String dataBanco, String dataSelecionada) {
        String dataBancoNormalizada = normalizarDataParaComparacao(dataBanco);
        String dataSelecionadaNormalizada = normalizarDataParaComparacao(dataSelecionada);
        return !dataBancoNormalizada.isEmpty()
                && dataBancoNormalizada.equals(dataSelecionadaNormalizada);
    }

    private String normalizarDataParaComparacao(String data) {
        if (data == null || data.trim().isEmpty()) {
            return "";
        }

        String valor = data.trim();
        if (valor.length() >= 10 && valor.charAt(4) == '-' && valor.charAt(7) == '-') {
            return valor.substring(0, 10);
        }

        if (valor.matches("\\d{2}/\\d{2}/\\d{4}")) {
            try {
                java.util.Date dataParseada =
                        new java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault())
                                .parse(valor);

                if (dataParseada != null) {
                    return new java.text.SimpleDateFormat(
                            "yyyy-MM-dd",
                            java.util.Locale.US
                    ).format(dataParseada);
                }
            } catch (Exception ignored) {
                return valor;
            }
        }

        return valor;
    }

    public void salvarExercicio(Exercicio exercicio, CadastroCallback callback) {
        try {
            JSONObject json = new JSONObject();
            json.put("nome", exercicio.getNome());
            json.put("descricao", exercicio.getDescricao());
            json.put("repeticao", parseIntSeguro(exercicio.getRepeticoes(), 1));
            json.put("peso", parseDoubleSeguro(exercicio.getPeso(), 0));

            if (exercicio.getIdExercicio() > 0) {
                String url = Uri.parse(SUPABASE_URL + "/rest/v1/exercicio")
                        .buildUpon()
                        .appendQueryParameter("id_exercicio", "eq." + exercicio.getIdExercicio())
                        .build()
                        .toString();
                enviarPatch(url, json, callback);
            } else {
                enviarPost(SUPABASE_URL + "/rest/v1/exercicio", json, callback);
            }
        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao montar exercício."));
        }
    }

    public void buscarNiveis(NiveisCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/nivel_treino")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("order", "id_nivel.asc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<Nivel> niveis = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);
                            niveis.add(new Nivel(
                                    obj.optInt("id_nivel"),
                                    obj.optString("nome"),
                                    obj.optString("descricao")
                            ));
                        }
                        callback.onSucesso(niveis);
                    } catch (Exception e) {
                        callback.onErro(traduzirErro("Erro ao montar níveis."));
                    }
                },
                error -> callback.onErro("Erro ao buscar níveis.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    public void salvarTreinoAtribuido(
            int idAluno,
            int idPersonal,
            Treino treino,
            CadastroCallback callback
    ) {
        try {
            JSONObject json = new JSONObject();
            json.put("id_aluno", idAluno);
            json.put("id_personal", idPersonal);
            json.put("nome", treino != null ? treino.getNome() : "Treino");
            json.put("descricao", treino != null ? treino.getDescricao() : "");
            json.put("data", normalizarDataTreino(treino != null ? treino.getData() : ""));
            json.put("realizado", false);
            json.put("status", "pendente");
            json.put("graudificuldade", 1);
            int idNivel = treino != null && treino.getIdNivel() > 0
                    ? treino.getIdNivel()
                    : obterIdNivel(treino != null ? treino.getNivel() : "");
            json.put("id_nivel", idNivel);

            inserirTreinoRetornandoId(json, treino, callback, true);

        } catch (JSONException e) {
            Log.e("TREINO_ATRIBUIDO_JSON", e.toString());
            callback.onErro(traduzirErro("Erro ao montar treino atribuído."));
        }
    }

    private void inserirTreinoRetornandoId(JSONObject treinoJson, Treino treino, CadastroCallback callback, boolean podeRetentarSemStatus) {
        JSONArray array = new JSONArray();
        array.put(treinoJson);

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.POST,
                SUPABASE_URL + "/rest/v1/treino?select=id_treino",
                array,
                response -> {
                    int idTreino = response.optJSONObject(0) != null
                            ? response.optJSONObject(0).optInt("id_treino", -1)
                            : -1;

                    if (idTreino == -1 || treino == null || treino.getListaExercicios() == null
                            || treino.getListaExercicios().isEmpty()) {
                        callback.onSucesso();
                        return;
                    }

                    inserirTreinoExercicios(idTreino, treino.getListaExercicios(), callback);
                },
                error -> {
                    String mensagem = obterErroVolley(error);
                    if (podeRetentarSemStatus && erroColunaInexistente(mensagem, "status")) {
                        treinoJson.remove("status");
                        inserirTreinoRetornandoId(treinoJson, treino, callback, false);
                        return;
                    }
                    callback.onErro(mensagem);
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(true);
            }
        };

        requestQueue.add(request);
    }

    private void inserirTreinoExercicios(
            int idTreino,
            List<Exercicio> exercicios,
            CadastroCallback callback
    ) {
        try {
            JSONArray array = new JSONArray();
            for (Exercicio exercicio : exercicios) {
                if (exercicio.getIdExercicio() <= 0) {
                    continue;
                }
                JSONObject item = new JSONObject();
                item.put("id_treino", idTreino);
                item.put("id_exercicio", exercicio.getIdExercicio());
                array.put(item);
            }

            if (array.length() == 0) {
                callback.onSucesso();
                return;
            }

            StringRequest request = new StringRequest(
                    Request.Method.POST,
                    SUPABASE_URL + "/rest/v1/treino_exercicio",
                    response -> callback.onSucesso(),
                    error -> callback.onErro(obterErroVolley(error))
            ) {
                @Override
                public byte[] getBody() {
                    return array.toString().getBytes(StandardCharsets.UTF_8);
                }

                @Override
                public String getBodyContentType() {
                    return "application/json; charset=utf-8";
                }

                @Override
                public Map<String, String> getHeaders() {
                    Map<String, String> headers = criarHeaders(false);
                    headers.put("Prefer", "return=minimal");
                    return headers;
                }
            };

            requestQueue.add(request);

        } catch (JSONException e) {
            callback.onErro(traduzirErro("Erro ao montar exercícios do treino."));
        }
    }

    public void buscarTreinosAtribuidosAluno(int idAluno, TreinosCallback callback) {
        buscarTreinosAtribuidosAluno(idAluno, callback, true);
    }

    public void buscarTreinosDoPersonal(int idPersonal, TreinosCallback callback) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/treino")
                .buildUpon()
                .appendQueryParameter("select", "*,treino_exercicio(exercicio(*))")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("order", "data.desc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<Treino> treinos = new ArrayList<>();
                        Set<String> treinosJaListados = new HashSet<>();

                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);
                            String chaveTreino = obj.optString("nome")
                                    + "|" + obj.optString("descricao")
                                    + "|" + obj.optString("data")
                                    + "|" + obj.optInt("id_nivel");

                            if (!treinosJaListados.add(chaveTreino)) {
                                continue;
                            }

                            Treino treino = new Treino(
                                    String.valueOf(obj.optLong("id_treino")),
                                    obj.optString("nome"),
                                    obj.optString("descricao"),
                                    formatarDataParaTela(obj.optString("data")),
                                    "Personal",
                                    obterNomeNivel(obj.optInt("id_nivel")),
                                    "",
                                    montarExerciciosDoTreino(obj)
                            );
                            treino.setIdNivel(obj.optInt("id_nivel"));
                            treino.setAtribuido(true);
                            treino.setStatus(obj.optString("status", "pendente"));
                            treino.setGrauDificuldade(obj.optInt("graudificuldade", 0));
                            treino.setObservacao(obj.optString("observacao", ""));
                            treinos.add(treino);
                        }

                        callback.onSucesso(treinos);
                    } catch (Exception e) {
                        Log.e("TREINOS_PERSONAL", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar treinos do personal."));
                    }
                },
                error -> {
                    Log.e("TREINOS_PERSONAL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar treinos do personal."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void buscarTreinosAtribuidosAluno(int idAluno, TreinosCallback callback, boolean usarStatus) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/treino")
                .buildUpon()
                .appendQueryParameter("select", "*,treino_exercicio(exercicio(*))")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .appendQueryParameter(usarStatus ? "status" : "realizado", usarStatus ? "eq.pendente" : "eq.false")
                .appendQueryParameter("order", "data.desc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<Treino> treinos = new ArrayList<>();

                        for (int i = 0; i < response.length(); i++) {
                            JSONObject obj = response.getJSONObject(i);
                            Treino treino = new Treino(
                                    String.valueOf(obj.optLong("id_treino")),
                                    obj.optString("nome"),
                                    obj.optString("descricao"),
                                    obj.optString("data"),
                                    "Personal",
                                    obterNomeNivel(obj.optInt("id_nivel")),
                                    "",
                                    montarExerciciosDoTreino(obj)
                            );
                            treino.setIdNivel(obj.optInt("id_nivel"));
                            treino.setStatus(obj.optString("status", "pendente"));
                            treino.setGrauDificuldade(obj.optInt("graudificuldade", 0));
                            treino.setObservacao(obj.optString("observacao", ""));
                            treinos.add(treino);
                        }

                        filtrarTreinosJaRegistradosNoHistorico(idAluno, treinos, callback);

                    } catch (Exception e) {
                        Log.e("TREINOS_ATRIBUIDOS", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar treinos atribuídos."));
                    }
                },
                error -> {
                    String mensagem = obterErroVolley(error);
                    if (usarStatus && erroColunaInexistente(mensagem, "status")) {
                        buscarTreinosAtribuidosAluno(idAluno, callback, false);
                        return;
                    }
                    Log.e("TREINOS_ATRIBUIDOS", mensagem);
                    callback.onErro(traduzirErro("Erro ao buscar treinos atribuídos."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    private void filtrarTreinosJaRegistradosNoHistorico(
            int idAluno,
            List<Treino> treinos,
            TreinosCallback callback
    ) {
        if (treinos.isEmpty()) {
            callback.onSucesso(treinos);
            return;
        }

        StringBuilder ids = new StringBuilder();
        for (Treino treino : treinos) {
            if (treino.getId() == null || treino.getId().trim().isEmpty()) {
                continue;
            }
            if (ids.length() > 0) {
                ids.append(",");
            }
            ids.append(treino.getId());
        }

        if (ids.length() == 0) {
            callback.onSucesso(treinos);
            return;
        }

        String url = Uri.parse(SUPABASE_URL + "/rest/v1/historico_treinos")
                .buildUpon()
                .appendQueryParameter("select", "id_treino,status")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .appendQueryParameter("id_treino", "in.(" + ids + ")")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        Set<String> idsEncerrados = new HashSet<>();
                        for (int i = 0; i < response.length(); i++) {
                            JSONObject historico = response.getJSONObject(i);
                            idsEncerrados.add(String.valueOf(historico.optLong("id_treino")));
                        }

                        List<Treino> treinosPendentes = new ArrayList<>();
                        for (Treino treino : treinos) {
                            if (!idsEncerrados.contains(treino.getId())) {
                                treinosPendentes.add(treino);
                            }
                        }

                        callback.onSucesso(treinosPendentes);
                    } catch (Exception e) {
                        Log.e("TREINOS_HISTORICO_FILTRO", e.toString());
                        callback.onErro(traduzirErro("Erro ao filtrar treinos concluídos."));
                    }
                },
                error -> {
                    Log.e("TREINOS_HISTORICO_FILTRO", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao verificar histórico de treinos."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    public void finalizarTreinoAtribuido(
            String idTreino,
            int idAluno,
            int idPersonal,
            String dataTreino,
            String nomeTreino,
            String descricaoTreino,
            int grauDificuldade,
            String observacao,
            CadastroCallback callback
    ) {
        try {
            long id = Long.parseLong(idTreino);
            JSONObject treinoAtualizado = new JSONObject();
            treinoAtualizado.put("realizado", true);
            treinoAtualizado.put("status", "realizado");
            treinoAtualizado.put("graudificuldade", grauDificuldade);
            treinoAtualizado.put("observacao", observacao);

            String url = Uri.parse(SUPABASE_URL + "/rest/v1/treino")
                    .buildUpon()
                    .appendQueryParameter("id_treino", "eq." + id)
                    .build()
                    .toString();

            atualizarTreinoFinalizado(url, treinoAtualizado, id, idAluno, idPersonal, dataTreino, nomeTreino, descricaoTreino, grauDificuldade, observacao, callback, true);

        } catch (Exception e) {
            Log.e("FINALIZAR_TREINO", e.toString());
            callback.onErro(traduzirErro("Erro ao finalizar treino."));
        }
    }

    private void atualizarTreinoFinalizado(
            String url,
            JSONObject treinoAtualizado,
            long idTreino,
            int idAluno,
            int idPersonal,
            String dataTreino,
            String nomeTreino,
            String descricaoTreino,
            int grauDificuldade,
            String observacao,
            CadastroCallback callback,
            boolean podeRetentarSemNovasColunas
    ) {
        enviarPatch(url, treinoAtualizado, new CadastroCallback() {
            @Override
            public void onSucesso() {
                salvarHistoricoTreino(idTreino, idAluno, idPersonal, dataTreino, nomeTreino, descricaoTreino, grauDificuldade, observacao, "realizado", callback);
            }

            @Override
            public void onErro(String mensagem) {
                if (podeRetentarSemNovasColunas
                        && (erroColunaInexistente(mensagem, "status")
                        || erroColunaInexistente(mensagem, "observacao"))) {
                    treinoAtualizado.remove("status");
                    treinoAtualizado.remove("observacao");
                    atualizarTreinoFinalizado(
                            url,
                            treinoAtualizado,
                            idTreino,
                            idAluno,
                            idPersonal,
                            dataTreino,
                            nomeTreino,
                            descricaoTreino,
                            grauDificuldade,
                            observacao,
                            callback,
                            false
                    );
                    return;
                }
                callback.onErro(mensagem);
            }
        });
    }

    private void salvarHistoricoTreino(
            long idTreino,
            int idAluno,
            int idPersonal,
            String dataTreino,
            String nomeTreino,
            String descricaoTreino,
            int grauDificuldade,
            String observacao,
            String status,
            CadastroCallback callback
    ) {
        try {
            JSONObject historico = new JSONObject();
            historico.put("id_treino", idTreino);
            historico.put("id_aluno", idAluno);
            historico.put("id_personal", idPersonal);
            historico.put("data_treino", obterDataHoraAtualBanco());
            historico.put("nome_treino", nomeTreino);
            historico.put("descricao", descricaoTreino);
            if (grauDificuldade > 0) {
                historico.put("graudificuldade", grauDificuldade);
            } else {
                historico.put("graudificuldade", JSONObject.NULL);
            }
            historico.put("observacao", observacao != null ? observacao : "");
            historico.put("status", status);

            enviarPost(SUPABASE_URL + "/rest/v1/historico_treinos", historico, callback);
        } catch (Exception e) {
            callback.onErro(traduzirErro("Erro ao salvar histórico do treino."));
        }
    }

    private String obterDataHoraAtualBanco() {
        return new java.text.SimpleDateFormat(
                "yyyy-MM-dd'T'HH:mm:ss",
                java.util.Locale.US
        ).format(new java.util.Date());
    }

    private List<Exercicio> montarExerciciosDoTreino(JSONObject treinoJson) {
        List<Exercicio> exercicios = new ArrayList<>();
        JSONArray vinculos = treinoJson.optJSONArray("treino_exercicio");

        if (vinculos == null) {
            return exercicios;
        }

        for (int i = 0; i < vinculos.length(); i++) {
            JSONObject vinculo = vinculos.optJSONObject(i);
            if (vinculo == null) {
                continue;
            }

            JSONObject exercicioJson = vinculo.optJSONObject("exercicio");
            if (exercicioJson == null) {
                continue;
            }

            exercicios.add(new Exercicio(
                    exercicioJson.optInt("id_exercicio"),
                    exercicioJson.optString("nome"),
                    exercicioJson.optString("descricao"),
                    "1",
                    String.valueOf(exercicioJson.optInt("repeticao", 1)),
                    exercicioJson.optString("peso", "0") + " kg"
            ));
        }

        return exercicios;
    }

    public void dispensarTreinoAtribuido(
            String idTreino,
            int idAluno,
            int idPersonal,
            String dataTreino,
            String nomeTreino,
            String descricaoTreino,
            CadastroCallback callback
    ) {
        try {
            long id = Long.parseLong(idTreino);
            JSONObject treinoAtualizado = new JSONObject();
            treinoAtualizado.put("status", "dispensado");
            treinoAtualizado.put("realizado", false);

            String url = Uri.parse(SUPABASE_URL + "/rest/v1/treino")
                    .buildUpon()
                    .appendQueryParameter("id_treino", "eq." + id)
                    .build()
                    .toString();

            enviarPatch(url, treinoAtualizado, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    salvarHistoricoTreino(id, idAluno, idPersonal, dataTreino, nomeTreino, descricaoTreino, 0, "", "dispensado", callback);
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(mensagem);
                }
            });
        } catch (Exception e) {
            callback.onErro(traduzirErro("Erro ao dispensar treino."));
        }
    }

    private boolean erroColunaInexistente(String mensagem, String coluna) {
        if (mensagem == null) {
            return false;
        }

        String valor = mensagem.toLowerCase(java.util.Locale.ROOT);
        String colunaNormalizada = coluna.toLowerCase(java.util.Locale.ROOT);
        return valor.contains(colunaNormalizada)
                && (valor.contains("pgrst204")
                || valor.contains("could not find")
                || valor.contains("schema cache")
                || valor.contains("column"));
    }

    private String normalizarDataTreino(String data) {
        if (data != null && !data.trim().isEmpty()) {
            try {
                java.util.Date dataParseada =
                        new java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault())
                                .parse(data.trim());

                if (dataParseada != null) {
                    return new java.text.SimpleDateFormat(
                            "yyyy-MM-dd'T'HH:mm:ss",
                            java.util.Locale.US
                    ).format(dataParseada);
                }
            } catch (Exception ignored) {
                return data;
            }
        }

        return new java.text.SimpleDateFormat(
                "yyyy-MM-dd'T'HH:mm:ss",
                java.util.Locale.US
        ).format(new java.util.Date());
    }

    private String formatarDataParaTela(String data) {
        if (data == null || data.trim().isEmpty()) {
            return "";
        }

        String valor = data.trim();
        try {
            if (valor.length() >= 10 && valor.charAt(4) == '-' && valor.charAt(7) == '-') {
                java.util.Date dataParseada =
                        new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
                                .parse(valor.substring(0, 10));

                if (dataParseada != null) {
                    return new java.text.SimpleDateFormat(
                            "dd/MM/yyyy",
                            java.util.Locale.getDefault()
                    ).format(dataParseada);
                }
            }
        } catch (Exception ignored) {
            return valor;
        }

        return valor;
    }

    private int obterIdNivel(String nivel) {
        String valor = nivel == null ? "" : nivel.toLowerCase();

        if (valor.contains("inter")) {
            return 2;
        }

        if (valor.contains("avan")) {
            return 3;
        }

        return 1;
    }

    private String obterNomeNivel(int idNivel) {
        if (idNivel == 2) {
            return "Intermediário";
        }

        if (idNivel == 3) {
            return "Avançado";
        }

        return "Iniciante";
    }

    private int parseIntSeguro(String valor, int padrao) {
        try {
            return Integer.parseInt(valor.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return padrao;
        }
    }

    private double parseDoubleSeguro(String valor, double padrao) {
        try {
            return Double.parseDouble(
                    valor.replace("kg", "")
                            .replace("KG", "")
                            .replace(",", ".")
                            .trim()
            );
        } catch (Exception e) {
            return padrao;
        }
    }

    public void buscarSolicitacoesPendentesPersonal(
            int idPersonal,
            AlunosPersonalCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                .buildUpon()
                .appendQueryParameter("select", "id_solicitacao,id_aluno,alunos(*)")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("status", "eq.pendente")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<AlunoPersonal> lista = new ArrayList<>();

                        for (int i = 0; i < response.length(); i++) {
                            JSONObject item = response.getJSONObject(i);
                            JSONObject aluno = item.getJSONObject("alunos");

                            lista.add(montarAlunoPersonal(
                                    aluno,
                                    item.optInt("id_solicitacao")
                            ));
                        }

                        callback.onSucesso(lista);

                    } catch (Exception e) {
                        Log.e("SOLICITACOES", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar solicitações."));
                    }
                },
                error -> {
                    Log.e("SOLICITACOES", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar solicitações."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public void buscarAlunosVinculadosPersonal(
            int idPersonal,
            AlunosPersonalCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("order", "nome.asc")
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<AlunoPersonal> lista = new ArrayList<>();

                        for (int i = 0; i < response.length(); i++) {
                            JSONObject aluno = response.getJSONObject(i);
                            lista.add(montarAlunoPersonal(aluno, -1));
                        }

                        callback.onSucesso(lista);

                    } catch (Exception e) {
                        Log.e("ALUNOS_VINCULADOS", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar alunos vinculados."));
                    }
                },
                error -> {
                    Log.e("ALUNOS_VINCULADOS", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar alunos vinculados."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public void buscarIdsAlunosComTreinoAtribuido(
            int idPersonal,
            Treino treino,
            IdsAlunosCallback callback
    ) {
        String dataInicio = normalizarDataTreino(treino != null ? treino.getData() : "");
        String dataFim = obterProximoDia(dataInicio.substring(0, Math.min(10, dataInicio.length()))) + "T00:00:00";

        String url = Uri.parse(SUPABASE_URL + "/rest/v1/treino")
                .buildUpon()
                .appendQueryParameter("select", "id_aluno")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .appendQueryParameter("nome", "eq." + (treino != null ? treino.getNome() : ""))
                .appendQueryParameter("descricao", "eq." + (treino != null ? treino.getDescricao() : ""))
                .appendQueryParameter("data", "gte." + dataInicio)
                .appendQueryParameter("data", "lt." + dataFim)
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        List<Integer> ids = new ArrayList<>();
                        for (int i = 0; i < response.length(); i++) {
                            ids.add(response.getJSONObject(i).optInt("id_aluno"));
                        }
                        callback.onSucesso(ids);
                    } catch (Exception e) {
                        callback.onErro(traduzirErro("Erro ao montar alunos já atribuídos."));
                    }
                },
                error -> callback.onErro("Erro ao buscar alunos já atribuídos.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(request);
    }

    public void aceitarSolicitacaoVinculo(
            int idSolicitacao,
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject alunoAtualizado = new JSONObject();
            alunoAtualizado.put("id_personal", idPersonal);

            String urlAluno = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                    .buildUpon()
                    .appendQueryParameter("id_aluno", "eq." + idAluno)
                    .build()
                    .toString();

            enviarPatch(urlAluno, alunoAtualizado, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    try {
                        JSONObject solicitacaoAtualizada = new JSONObject();
                        solicitacaoAtualizada.put("status", "aceita");

                        String urlSolicitacao = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                                .buildUpon()
                                .appendQueryParameter("id_solicitacao", "eq." + idSolicitacao)
                                .build()
                                .toString();

                        enviarPatch(urlSolicitacao, solicitacaoAtualizada, new CadastroCallback() {
                            @Override
                            public void onSucesso() {
                                enviarNotificacaoRespostaVinculo(
                                        idAluno,
                                        idPersonal,
                                        "aceita",
                                        callback
                                );
                            }

                            @Override
                            public void onErro(String mensagem) {
                                callback.onErro(mensagem);
                            }
                        });

                    } catch (Exception e) {
                        callback.onErro(traduzirErro("Aluno vinculado, mas erro ao atualizar solicitação."));
                    }
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(traduzirErro("Erro ao vincular aluno."));
                }
            });

        } catch (Exception e) {
            callback.onErro(traduzirErro("Erro ao aceitar solicitação."));
        }
    }

    public void recusarSolicitacaoVinculo(
            int idSolicitacao,
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject solicitacaoAtualizada = new JSONObject();
            solicitacaoAtualizada.put("status", "recusada");

            String url = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                    .buildUpon()
                    .appendQueryParameter("id_solicitacao", "eq." + idSolicitacao)
                    .build()
                    .toString();

            enviarPatch(url, solicitacaoAtualizada, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    enviarNotificacaoRespostaVinculo(
                            idAluno,
                            idPersonal,
                            "recusada",
                            callback
                    );
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(mensagem);
                }
            });

        } catch (Exception e) {
            Log.e("RECUSAR_VINCULO", e.toString());
            callback.onErro(traduzirErro("Erro ao recusar solicitação."));
        }
    }

    private void enviarNotificacaoRespostaVinculo(
            int idAluno,
            int idPersonal,
            String status,
            CadastroCallback callback
    ) {
        try {
            JSONObject body = new JSONObject();
            body.put("id_aluno", idAluno);
            body.put("id_personal", idPersonal);
            body.put("status", status);

            chamarEdgeFunction(
                    EDGE_SEND_LINK_RESPONSE_NOTIFICATION,
                    body,
                    new CadastroCallback() {
                        @Override
                        public void onSucesso() {
                            callback.onSucesso();
                        }

                        @Override
                        public void onErro(String mensagem) {
                            Log.e("FCM_PUSH_RESPOSTA", "Resposta salva, mas push falhou: " + mensagem);
                            callback.onSucesso();
                        }
                    }
            );

        } catch (JSONException e) {
            Log.e("FCM_PUSH_RESPOSTA_JSON", e.toString());
            callback.onSucesso();
        }
    }

    public void enviarNotificacaoTreinoAtribuido(
            int idAluno,
            int idPersonal,
            String nomeTreino,
            CadastroCallback callback
    ) {
        try {
            JSONObject body = new JSONObject();
            body.put("id_aluno", idAluno);
            body.put("id_personal", idPersonal);
            body.put("nome_treino", nomeTreino);

            chamarEdgeFunction(EDGE_SEND_WORKOUT_ASSIGNED_NOTIFICATION, body, callback);

        } catch (JSONException e) {
            Log.e("FCM_TREINO_ATRIBUIDO_JSON", e.toString());
            callback.onErro(traduzirErro("Erro ao montar notificação de treino atribuído."));
        }
    }

    public void enviarNotificacaoTreinoFinalizado(
            int idAluno,
            int idPersonal,
            String nomeTreino,
            float dificuldade,
            String observacao,
            CadastroCallback callback
    ) {
        try {
            JSONObject body = new JSONObject();
            body.put("id_aluno", idAluno);
            body.put("id_personal", idPersonal);
            body.put("nome_treino", nomeTreino);
            body.put("dificuldade", dificuldade);
            body.put("observacao", observacao);

            chamarEdgeFunction(EDGE_SEND_WORKOUT_FINISHED_NOTIFICATION, body, callback);

        } catch (JSONException e) {
            Log.e("FCM_TREINO_FINALIZADO_JSON", e.toString());
            callback.onErro(traduzirErro("Erro ao montar notificação de treino finalizado."));
        }
    }

    private AlunoPersonal montarAlunoPersonal(
            JSONObject aluno,
            int idSolicitacao
    ) {
        return new AlunoPersonal(
                aluno.optInt("id_aluno"),
                idSolicitacao,
                aluno.optString("nome"),
                aluno.optString("cpf"),
                aluno.optString("telefone"),
                aluno.optInt("idade"),
                aluno.optDouble("peso"),
                aluno.optDouble("altura"),
                aluno.optDouble("imc"),
                aluno.optInt("score"),
                aluno.optString("doenca"),
                aluno.optString("lesao"),
                aluno.optBoolean("sexo"),
                aluno.optString("foto_url")
        );
    }

    public interface DetalheAlunoCallback {
        void onSucesso(JSONObject aluno);
        void onErro(String mensagem);
    }

    public void buscarDetalheAlunoPersonal(
            int idAluno,
            DetalheAlunoCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_aluno", "eq." + idAluno)
                .build()
                .toString();

        JsonArrayRequest request = new JsonArrayRequest(
                Request.Method.GET,
                url,
                null,
                response -> {
                    try {
                        if (response.length() == 0) {
                            callback.onErro(traduzirErro("Aluno não encontrado."));
                            return;
                        }

                        callback.onSucesso(response.getJSONObject(0));

                    } catch (Exception e) {
                        callback.onErro(traduzirErro("Erro ao carregar aluno."));
                    }
                },
                error -> callback.onErro("Erro ao buscar aluno.")
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        request.setShouldCache(false);
        requestQueue.add(request);
    }

    public void desvincularAlunoDoPersonal(
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject alunoAtualizado = new JSONObject();
            alunoAtualizado.put("id_personal", 1);

            String urlAluno = Uri.parse(SUPABASE_URL + "/rest/v1/alunos")
                    .buildUpon()
                    .appendQueryParameter("id_aluno", "eq." + idAluno)
                    .build()
                    .toString();

            enviarPatch(urlAluno, alunoAtualizado, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    cancelarSolicitacaoAlunoPersonal(idAluno, idPersonal, callback);
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro(traduzirErro("Erro ao desvincular aluno."));
                }
            });

        } catch (Exception e) {
            callback.onErro(traduzirErro("Erro ao montar desvinculação."));
        }
    }

    private void cancelarSolicitacaoAlunoPersonal(
            int idAluno,
            int idPersonal,
            CadastroCallback callback
    ) {
        try {
            JSONObject solicitacaoAtualizada = new JSONObject();
            solicitacaoAtualizada.put("status", "cancelada");

            String url = Uri.parse(SUPABASE_URL + "/rest/v1/solicitacao_vinculo")
                    .buildUpon()
                    .appendQueryParameter("id_aluno", "eq." + idAluno)
                    .appendQueryParameter("id_personal", "eq." + idPersonal)
                    .build()
                    .toString();

            enviarPatch(url, solicitacaoAtualizada, callback);

        } catch (Exception e) {
            callback.onErro(traduzirErro("Aluno desvinculado, mas erro ao cancelar solicitação."));
        }
    }

    public interface PerfilPersonalCallback {
        void onSucesso(JSONObject perfil);
        void onErro(String mensagem);
    }

    public void buscarPerfilPersonal(
            int idPersonal,
            PerfilPersonalCallback callback
    ) {
        String urlPersonal = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .build()
                .toString();

        JsonArrayRequest requestPersonal = new JsonArrayRequest(
                Request.Method.GET,
                urlPersonal,
                null,
                responsePersonal -> {
                    try {
                        if (responsePersonal.length() == 0) {
                            callback.onErro(traduzirErro("Personal não encontrado."));
                            return;
                        }

                        JSONObject personal = responsePersonal.getJSONObject(0);
                        int idLogin = personal.getInt("id_login");

                        buscarLoginDoPerfilPersonal(personal, idLogin, callback);

                    } catch (Exception e) {
                        Log.e("PERFIL_PERSONAL", e.toString());
                        callback.onErro(traduzirErro("Erro ao carregar dados do personal."));
                    }
                },
                error -> {
                    Log.e("PERFIL_PERSONAL", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar perfil do personal."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestPersonal);
    }

    private void buscarLoginDoPerfilPersonal(
            JSONObject personal,
            int idLogin,
            PerfilPersonalCallback callback
    ) {
        String urlLogin = Uri.parse(SUPABASE_URL + "/rest/v1/login")
                .buildUpon()
                .appendQueryParameter("select", "*")
                .appendQueryParameter("id_login", "eq." + idLogin)
                .build()
                .toString();

        JsonArrayRequest requestLogin = new JsonArrayRequest(
                Request.Method.GET,
                urlLogin,
                null,
                responseLogin -> {
                    try {
                        if (responseLogin.length() == 0) {
                            callback.onErro(traduzirErro("Login não encontrado."));
                            return;
                        }

                        JSONObject login = responseLogin.getJSONObject(0);

                        JSONObject perfil = new JSONObject();

                        perfil.put("id_personal", personal.optInt("id_personal"));
                        perfil.put("id_login", personal.optInt("id_login"));
                        perfil.put("nome", personal.optString("nome"));
                        perfil.put("cpf", personal.optString("cpf"));
                        perfil.put("cref", personal.optString("cref"));
                        perfil.put("telefone", personal.optString("telefone"));
                        perfil.put("sexo", personal.optBoolean("sexo"));
                        perfil.put("foto_url", personal.optString("foto_url"));

                        perfil.put("email", login.optString("email"));
                        perfil.put("senha", "");

                        callback.onSucesso(perfil);

                    } catch (Exception e) {
                        Log.e("PERFIL_PERSONAL_LOGIN", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar perfil do personal."));
                    }
                },
                error -> {
                    Log.e("PERFIL_PERSONAL_LOGIN", obterErroVolley(error));
                    callback.onErro(traduzirErro("Erro ao buscar login do personal."));
                }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                return criarHeaders(false);
            }
        };

        requestQueue.add(requestLogin);
    }

    public void atualizarPerfilPersonal(
            int idPersonal,
            int idLogin,
            String nome,
            String email,
            String senha,
            String cpf,
            String cref,
            String telefone,
            boolean sexo,
            CadastroCallback callback
    ) {
        try {
            JSONObject loginAtualizado = new JSONObject();
            loginAtualizado.put("email", email);
            loginAtualizado.put("senha", senha);

            atualizarLoginPersonal(idLogin, loginAtualizado, new CadastroCallback() {
                @Override
                public void onSucesso() {
                    try {
                        JSONObject personalAtualizado = new JSONObject();

                        personalAtualizado.put("nome", nome);
                        personalAtualizado.put("cpf", cpf);
                        personalAtualizado.put("cref", cref);
                        personalAtualizado.put("telefone", telefone);
                        personalAtualizado.put("sexo", sexo);

                        atualizarTabelaPersonal(idPersonal, personalAtualizado, callback);

                    } catch (Exception e) {
                        Log.e("UPDATE_PERSONAL_JSON", e.toString());
                        callback.onErro(traduzirErro("Erro ao montar dados do personal."));
                    }
                }

                @Override
                public void onErro(String mensagem) {
                    callback.onErro("Erro ao atualizar login: " + mensagem);
                }
            });

        } catch (Exception e) {
            Log.e("UPDATE_LOGIN_PERSONAL", e.toString());
            callback.onErro(traduzirErro("Erro ao montar dados de login."));
        }
    }

    private void atualizarLoginPersonal(
            int idLogin,
            JSONObject loginAtualizado,
            CadastroCallback callback
    ) {
        atualizarLoginSeguro(
                idLogin,
                loginAtualizado.optString("email"),
                loginAtualizado.optString("senha"),
                callback
        );
    }

    private void atualizarTabelaPersonal(
            int idPersonal,
            JSONObject personalAtualizado,
            CadastroCallback callback
    ) {
        String url = Uri.parse(SUPABASE_URL + "/rest/v1/personal")
                .buildUpon()
                .appendQueryParameter("id_personal", "eq." + idPersonal)
                .build()
                .toString();

        enviarPatch(url, personalAtualizado, callback);
    }
}
