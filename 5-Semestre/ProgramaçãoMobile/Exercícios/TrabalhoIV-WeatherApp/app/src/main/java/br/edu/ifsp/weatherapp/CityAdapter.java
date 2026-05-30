package br.edu.ifsp.weatherapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import br.edu.ifsp.weatherapp.models.City;
import java.util.ArrayList;
import java.util.List;

public class CityAdapter extends RecyclerView.Adapter<CityAdapter.CityViewHolder> {

    private List<City> cities;
    private OnCityClickListener listener;

    public interface OnCityClickListener {
        void onCityClick(City city);
    }

    public CityAdapter(List<City> cities, OnCityClickListener listener) {
        this.cities = cities;
        this.listener = listener;
    }

    public void updateList(List<City> newList) {
        this.cities = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CityViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(android.R.layout.simple_list_item_1, parent, false);
        return new CityViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CityViewHolder holder, int position) {
        City city = cities.get(position);
        holder.textView.setText(city.toString());
        holder.itemView.setOnClickListener(v -> listener.onCityClick(city));
    }

    @Override
    public int getItemCount() {
        return cities.size();
    }

    static class CityViewHolder extends RecyclerView.ViewHolder {
        TextView textView;

        public CityViewHolder(@NonNull View itemView) {
            super(itemView);
            textView = itemView.findViewById(android.R.id.text1);
        }
    }
}
