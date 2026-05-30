package br.edu.ifsp.weatherapp.models;

public class City {
    private String name;
    private String state;

    public City(String name, String state) {
        this.name = name;
        this.state = state;
    }

    public String getName() {
        return name;
    }

    public String getState() {
        return state;
    }

    @Override
    public String toString() {
        return name + " - " + state;
    }
}
