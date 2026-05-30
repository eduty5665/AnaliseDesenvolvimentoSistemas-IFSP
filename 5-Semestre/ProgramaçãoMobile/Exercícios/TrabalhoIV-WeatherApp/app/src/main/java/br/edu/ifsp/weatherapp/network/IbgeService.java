package br.edu.ifsp.weatherapp.network;

import java.util.List;
import br.edu.ifsp.weatherapp.models.IbgeCity;
import retrofit2.Call;
import retrofit2.http.GET;

public interface IbgeService {
    @GET("api/v1/localidades/municipios?orderBy=nome")
    Call<List<IbgeCity>> getAllCities();
}
