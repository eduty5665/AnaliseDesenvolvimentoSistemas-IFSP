package br.edu.ifsp.weatherapp;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.formatter.ValueFormatter;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.gms.tasks.CancellationTokenSource;
import com.google.android.material.search.SearchBar;
import com.google.android.material.search.SearchView;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import br.edu.ifsp.weatherapp.models.City;
import br.edu.ifsp.weatherapp.models.ForecastResponse;
import br.edu.ifsp.weatherapp.models.IbgeCity;
import br.edu.ifsp.weatherapp.models.WeatherResponse;
import br.edu.ifsp.weatherapp.network.IbgeService;
import br.edu.ifsp.weatherapp.network.WeatherService;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * MainActivity: App de Clima com Geolocation ativa, API REST (Retrofit), IBGE e Gráficos.
 * - Força a busca da posição atual (não usa apenas cache antigo).
 * - Mantém o formato Cidade - UF em todos os componentes.
 */
public class MainActivity extends AppCompatActivity {

    private static final String WEATHER_API_KEY = "ff5c143e5c8f308a9c3b3e3e8a5aee4d"; 
    private static final String WEATHER_BASE_URL = "https://api.openweathermap.org/";
    private static final String IBGE_BASE_URL = "https://servicodados.ibge.gov.br/";
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;

    private WeatherService weatherService;
    private IbgeService ibgeService;
    private FusedLocationProviderClient fusedLocationClient;
    
    private List<City> allCities = new ArrayList<>();
    private CityAdapter cityAdapter;

    private SearchBar searchBar;
    private SearchView searchView;
    private LinearLayout weatherContainer, forecastContainer;
    private ProgressBar progressBar;
    
    private TextView tvCityName, tvDate, tvTemperature, tvTempRange, tvDescription, tvHumidity, tvWind;
    private ImageView ivWeatherIcon;
    private LineChart tempChart;

    // Mapa para conversão de estados retornados pelo GPS
    private static final Map<String, String> STATE_MAP = new HashMap<String, String>() {{
        put("Acre", "AC"); put("Alagoas", "AL"); put("Amapá", "AP"); put("Amazonas", "AM");
        put("Bahia", "BA"); put("Ceará", "CE"); put("Distrito Federal", "DF"); put("Espírito Santo", "ES");
        put("Goiás", "GO"); put("Maranhão", "MA"); put("Mato Grosso", "MT"); put("Mato Grosso do Sul", "MS");
        put("Minas Gerais", "MG"); put("Pará", "PA"); put("Paraíba", "PB"); put("Paraná", "PR");
        put("Pernambuco", "PE"); put("Piauí", "PI"); put("Rio de Janeiro", "RJ"); put("Rio Grande do Norte", "RN");
        put("Rio Grande do Sul", "RS"); put("Rondônia", "RO"); put("Roraima", "RR"); put("Santa Catarina", "SC");
        put("São Paulo", "SP"); put("Sergipe", "SE"); put("Tocantins", "TO");
    }};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            v.setPadding(insets.getInsets(WindowInsetsCompat.Type.systemBars()).left, 0, 
                        insets.getInsets(WindowInsetsCompat.Type.systemBars()).right, 0);
            return insets;
        });

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        initViews();
        setupRetrofit();
        setupRecyclerView();
        fetchAllMunicipalities(); 
        setupSearchLogic();
        checkLocationPermission();
    }

    private void initViews() {
        searchBar = findViewById(R.id.search_bar);
        searchView = findViewById(R.id.search_view);
        weatherContainer = findViewById(R.id.weather_container);
        forecastContainer = findViewById(R.id.forecast_container);
        progressBar = findViewById(R.id.progress_bar);

        tvCityName = findViewById(R.id.tv_city_name);
        tvDate = findViewById(R.id.tv_date);
        tvTemperature = findViewById(R.id.tv_temperature);
        tvTempRange = findViewById(R.id.tv_temp_range);
        tvDescription = findViewById(R.id.tv_description);
        tvHumidity = findViewById(R.id.tv_humidity);
        tvWind = findViewById(R.id.tv_wind);
        ivWeatherIcon = findViewById(R.id.iv_weather_icon);
        tempChart = findViewById(R.id.temp_chart);
        
        setupChartStyle();
    }

    private void setupChartStyle() {
        tempChart.getDescription().setEnabled(false);
        tempChart.getLegend().setEnabled(false);
        tempChart.getAxisRight().setEnabled(false);
        tempChart.setNoDataText("Carregando histórico...");
        
        XAxis xAxis = tempChart.getXAxis();
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setDrawGridLines(false);
        xAxis.setTextColor(Color.GRAY);
        tempChart.getAxisLeft().setTextColor(Color.GRAY);
    }

    private void setupRetrofit() {
        Retrofit weatherRetrofit = new Retrofit.Builder()
                .baseUrl(WEATHER_BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        weatherService = weatherRetrofit.create(WeatherService.class);

        Retrofit ibgeRetrofit = new Retrofit.Builder()
                .baseUrl(IBGE_BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        ibgeService = ibgeRetrofit.create(IbgeService.class);
    }

    private void setupRecyclerView() {
        RecyclerView rvCities = findViewById(R.id.rv_cities);
        rvCities.setLayoutManager(new LinearLayoutManager(this));
        cityAdapter = new CityAdapter(new ArrayList<>(), city -> {
            searchView.hide();
            fetchWeather(city.getName(), city.getState());
        });
        rvCities.setAdapter(cityAdapter);
    }

    private void fetchAllMunicipalities() {
        ibgeService.getAllCities().enqueue(new Callback<List<IbgeCity>>() {
            @Override
            public void onResponse(Call<List<IbgeCity>> call, Response<List<IbgeCity>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allCities = response.body().stream()
                            .map(ibge -> new City(ibge.getName(), ibge.getUfSigla()))
                            .collect(Collectors.toList());
                    searchBar.setHint("Buscar cidade...");
                }
            }
            @Override public void onFailure(Call<List<IbgeCity>> call, Throwable t) {}
        });
    }

    private void setupSearchLogic() {
        searchView.getEditText().addTextChangedListener(new TextWatcher() {
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) { filterCities(s.toString()); }
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void afterTextChanged(Editable s) {}
        });
    }

    private void filterCities(String query) {
        List<City> filteredList = allCities.stream()
                .filter(city -> city.getName().toLowerCase().contains(query.toLowerCase()))
                .limit(50)
                .collect(Collectors.toList());
        cityAdapter.updateList(filteredList);
    }

    private void checkLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST_CODE);
        } else { getCurrentLocation(); }
    }

    private void getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            CancellationTokenSource cts = new CancellationTokenSource();
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, cts.getToken())
                .addOnSuccessListener(this, location -> {
                    if (location != null) {
                        getCityFromLocation(location);
                    } else {
                        // Fallback: Tenta a última localização conhecida se a ativa falhar
                        fusedLocationClient.getLastLocation().addOnSuccessListener(lastLoc -> {
                            if (lastLoc != null) getCityFromLocation(lastLoc);
                            else fetchWeather("São Paulo", "SP");
                        });
                    }
                })
                .addOnFailureListener(e -> fetchWeather("São Paulo", "SP"));
        }
    }

    private void getCityFromLocation(Location location) {
        Geocoder geocoder = new Geocoder(this, Locale.getDefault());
        try {
            List<Address> addresses = geocoder.getFromLocation(location.getLatitude(), location.getLongitude(), 1);
            if (addresses != null && !addresses.isEmpty()) {
                Address addr = addresses.get(0);
                String city = addr.getLocality();
                if (city == null) city = addr.getSubAdminArea();
                if (city == null) city = addr.getAdminArea();
                
                String stateFull = addr.getAdminArea();
                String stateSigla = STATE_MAP.getOrDefault(stateFull, "");
                fetchWeather(city, stateSigla); 
            } else {
                fetchWeather("São Paulo", "SP");
            }
        } catch (IOException e) {
            fetchWeather("São Paulo", "SP");
        }
    }

    private void fetchWeather(String cityName, String state) {
        progressBar.setVisibility(View.VISIBLE);
        weatherContainer.setVisibility(View.GONE);

        weatherService.getCurrentWeather(cityName + ",BR", WEATHER_API_KEY, "metric", "pt_br")
                .enqueue(new Callback<WeatherResponse>() {
                    @Override
                    public void onResponse(Call<WeatherResponse> call, Response<WeatherResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            displayWeather(response.body(), state);
                            fetchForecast(cityName);
                        } else { 
                            progressBar.setVisibility(View.GONE);
                            Toast.makeText(MainActivity.this, "Erro ao carregar clima de " + cityName, Toast.LENGTH_SHORT).show();
                        }
                    }
                    @Override public void onFailure(Call<WeatherResponse> call, Throwable t) { 
                        progressBar.setVisibility(View.GONE);
                        Toast.makeText(MainActivity.this, "Falha na conexão", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void fetchForecast(String cityName) {
        weatherService.getForecast(cityName + ",BR", WEATHER_API_KEY, "metric", "pt_br")
                .enqueue(new Callback<ForecastResponse>() {
                    @Override
                    public void onResponse(Call<ForecastResponse> call, Response<ForecastResponse> response) {
                        progressBar.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null) {
                            displayForecast(response.body());
                            updateChart(response.body());
                        }
                    }
                    @Override public void onFailure(Call<ForecastResponse> call, Throwable t) { progressBar.setVisibility(View.GONE); }
                });
    }

    private void displayWeather(WeatherResponse weather, String state) {
        weatherContainer.setVisibility(View.VISIBLE);
        String fullLocation = weather.name + (state != null && !state.isEmpty() ? " - " + state : "");
        
        tvCityName.setText(fullLocation);
        searchBar.setText(fullLocation);
        
        tvDate.setText(new SimpleDateFormat("EEEE, d 'de' MMMM", new Locale("pt", "BR")).format(new Date()));
        tvTemperature.setText(Math.round(weather.main.temp) + "°");
        tvTempRange.setText("Máx: " + Math.round(weather.main.tempMax) + "° Mín: " + Math.round(weather.main.tempMin) + "°");
        tvDescription.setText(weather.weather.get(0).description);
        tvHumidity.setText(weather.main.humidity + "%");
        
        if (weather.wind != null) {
            tvWind.setText(Math.round(weather.wind.speed * 3.6) + " km/h");
        } else {
            tvWind.setText("N/A");
        }

        Glide.with(this).load("https://openweathermap.org/img/wn/" + weather.weather.get(0).icon + "@4x.png").into(ivWeatherIcon);
    }

    private void displayForecast(ForecastResponse forecast) {
        forecastContainer.removeAllViews();
        LayoutInflater inflater = LayoutInflater.from(this);
        int count = 0;
        for (ForecastResponse.ForecastItem item : forecast.list) {
            if (item.dtTxt.contains("12:00:00") && count < 3) {
                View view = inflater.inflate(R.layout.item_forecast, forecastContainer, false);
                TextView tvDay = view.findViewById(R.id.tv_forecast_day);
                TextView tvTemp = view.findViewById(R.id.tv_forecast_temp);
                ImageView ivIcon = view.findViewById(R.id.iv_forecast_icon);
                
                try {
                    Date date = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).parse(item.dtTxt);
                    tvDay.setText(new SimpleDateFormat("EEEE", new Locale("pt", "BR")).format(date).toUpperCase());
                } catch (Exception e) { tvDay.setText(item.dtTxt); }
                
                tvTemp.setText(Math.round(item.main.temp) + "°C");
                Glide.with(this).load("https://openweathermap.org/img/wn/" + item.weather.get(0).icon + ".png").into(ivIcon);
                forecastContainer.addView(view);
                count++;
            }
        }
    }

    private void updateChart(ForecastResponse forecast) {
        List<Entry> entries = new ArrayList<>();
        final List<String> labels = new ArrayList<>();
        for (int i = 0; i < forecast.list.size(); i += 4) {
            ForecastResponse.ForecastItem item = forecast.list.get(i);
            entries.add(new Entry(i, item.main.temp));
            labels.add(new SimpleDateFormat("dd/MM", Locale.getDefault()).format(new Date(item.dt * 1000)));
        }

        LineDataSet dataSet = new LineDataSet(entries, "Temp");
        dataSet.setColor(Color.parseColor("#1976D2"));
        dataSet.setCircleColor(Color.parseColor("#1976D2"));
        dataSet.setLineWidth(2.5f);
        dataSet.setDrawValues(false);
        dataSet.setMode(LineDataSet.Mode.CUBIC_BEZIER);

        tempChart.setData(new LineData(dataSet));
        tempChart.getXAxis().setValueFormatter(new ValueFormatter() {
            @Override public String getFormattedValue(float value) {
                int index = (int) value / 4;
                return (index >= 0 && index < labels.size()) ? labels.get(index) : "";
            }
        });
        tempChart.invalidate();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getCurrentLocation();
            } else {
                fetchWeather("São Paulo", "SP");
                Toast.makeText(this, "Usando localização padrão (SP) por falta de permissão.", Toast.LENGTH_SHORT).show();
            }
        }
    }
}
