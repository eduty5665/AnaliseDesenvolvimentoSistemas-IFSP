package br.edu.ifsp.weatherapp.network;

import br.edu.ifsp.weatherapp.models.ForecastResponse;
import br.edu.ifsp.weatherapp.models.WeatherResponse;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;

public interface WeatherService {
    @GET("data/2.5/weather")
    Call<WeatherResponse> getCurrentWeather(
            @Query("q") String cityName,
            @Query("appid") String apiKey,
            @Query("units") String units,
            @Query("lang") String lang
    );

    @GET("data/2.5/forecast")
    Call<ForecastResponse> getForecast(
            @Query("q") String cityName,
            @Query("appid") String apiKey,
            @Query("units") String units,
            @Query("lang") String lang
    );
}
