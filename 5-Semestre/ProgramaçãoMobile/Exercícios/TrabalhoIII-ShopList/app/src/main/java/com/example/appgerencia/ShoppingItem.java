package com.example.appgerencia;

import java.io.Serializable;

public class ShoppingItem implements Serializable {
    private String name;
    private double quantity;
    private String unit;
    private double price;
    private String location;

    public ShoppingItem(String name, double quantity, String unit, double price, String location) {
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.price = price;
        this.location = location;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
