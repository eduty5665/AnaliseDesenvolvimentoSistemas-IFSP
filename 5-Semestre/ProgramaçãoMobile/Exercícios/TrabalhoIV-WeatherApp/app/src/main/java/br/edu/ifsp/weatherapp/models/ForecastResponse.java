package br.edu.ifsp.weatherapp.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ForecastResponse {
    @SerializedName("list")
    public List<ForecastItem> list;

    public static class ForecastItem {
        @SerializedName("dt")
        public long dt;
        @SerializedName("main")
        public Main main;
        @SerializedName("weather")
        public List<Weather> weather;
        @SerializedName("dt_txt")
        public String dtTxt;
    }

    public static class Main {
        @SerializedName("temp")
        public float temp;
        @SerializedName("temp_min")
        public float tempMin;
        @SerializedName("temp_max")
        public float tempMax;
    }

    public static class Weather {
        @SerializedName("description")
        public String description;
        @SerializedName("icon")
        public String icon;
    }
}
