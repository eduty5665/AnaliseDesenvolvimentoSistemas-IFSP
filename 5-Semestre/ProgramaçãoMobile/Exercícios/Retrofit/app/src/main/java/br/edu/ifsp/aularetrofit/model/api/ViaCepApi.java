package br.edu.ifsp.aularetrofit.model.api;

import br.edu.ifsp.aularetrofit.model.entity.CepResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface ViaCepApi {

    @GET("ws/{cep}/json/")
    Call<CepResponse> getCep(@Path("cep") String cep);
}
