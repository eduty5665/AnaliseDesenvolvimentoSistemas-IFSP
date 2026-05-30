package br.edu.ifsp.weatherapp.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class WeatherResponse {
    @SerializedName("main")
    public Main main;
    @SerializedName("weather")
    public List<Weather> weather;
    @SerializedName("wind")
    public Wind wind;
    @SerializedName("name")
    public String name;

    public class Main {
        @SerializedName("temp")
        public float temp;
        @SerializedName("humidity")
        public int humidity;
        @SerializedName("temp_min")
        public float tempMin;
        @SerializedName("temp_max")
        public float tempMax;
    }

    public class Weather {
        @SerializedName("description")
        public String description;
        @SerializedName("icon")
        public String icon;
    }

    public class Wind {
        @SerializedName("speed")
        public float speed;
    }
}
