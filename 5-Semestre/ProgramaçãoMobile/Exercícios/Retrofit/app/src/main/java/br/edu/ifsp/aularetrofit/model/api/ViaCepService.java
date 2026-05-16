package br.edu.ifsp.aularetrofit.model.api;

import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ViaCepService {

    private static final String BASE_URL = "https://viacep.com.br/";
    private static volatile ViaCepApi instance;

    private ViaCepService() {}

    public static ViaCepApi getInstance() {

        if(instance == null) {
            synchronized (ViaCepService.class) {
                if(instance == null) {
                    instance = createApi();
                }
            }
        }

        return instance;
    }

    private static ViaCepApi createApi() {

        OkHttpClient client = new OkHttpClient.Builder().build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        return retrofit.create(ViaCepApi.class);

    }

}
