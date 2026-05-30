package com.example.appgerencia;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import coil.Coil;
import coil.request.CachePolicy;
import coil.request.ImageRequest;

public class MainActivity extends AppCompatActivity implements ShoppingAdapter.OnItemClickListener {

    private List<ShoppingItem> shoppingList;
    private ShoppingAdapter adapter;
    private RecyclerView recyclerView;
    private FloatingActionButton fabAdd;
    private TextView textViewTotalItems, textViewTotalPrice;
    private final String PREFS_NAME = "ShopListPrefs";
    private final String LIST_KEY = "shopping_list";
    private final Locale ptBr = new Locale("pt", "BR");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        loadData();
        preloadImages(); 

        recyclerView = findViewById(R.id.recyclerView);
        textViewTotalItems = findViewById(R.id.textViewTotalItems);
        textViewTotalPrice = findViewById(R.id.textViewTotalPrice);
        
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ShoppingAdapter(shoppingList, this);
        recyclerView.setAdapter(adapter);

        fabAdd = findViewById(R.id.fabAdd);
        fabAdd.setOnClickListener(v -> showItemDialog(null, -1));

        updateTotals();
    }

    private void preloadImages() {
        if (shoppingList == null) return;
        for (ShoppingItem item : shoppingList) {
            String cleanName = item.getName().toLowerCase().trim().replace(" ", ",");
            int lockId = Math.abs(item.getName().toLowerCase().trim().hashCode() % 1000);
            String imageUrl = "https://loremflickr.com/300/300/" + cleanName + ",grocery/all?lock=" + lockId;
            
            ImageRequest request = new ImageRequest.Builder(this)
                    .data(imageUrl)
                    .diskCachePolicy(CachePolicy.ENABLED)
                    .build();
            Coil.imageLoader(this).enqueue(request);
        }
    }

    private void updateTotals() {
        double totalItems = 0;
        double totalPrice = 0;
        for (ShoppingItem item : shoppingList) {
            totalItems += item.getQuantity();
            totalPrice += (item.getQuantity() * item.getPrice());
        }
        textViewTotalItems.setText(String.format(Locale.getDefault(), "Total de Itens: %.2f", totalItems));
        textViewTotalPrice.setText(NumberFormat.getCurrencyInstance(ptBr).format(totalPrice));
    }

    private void showItemDialog(ShoppingItem item, int position) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_shopping_item, null);
        builder.setView(dialogView);

        EditText editTextName = dialogView.findViewById(R.id.editTextName);
        EditText editTextQuantity = dialogView.findViewById(R.id.editTextQuantity);
        Spinner spinnerUnit = dialogView.findViewById(R.id.spinnerUnit);
        EditText editTextPrice = dialogView.findViewById(R.id.editTextPrice);
        EditText editTextLocation = dialogView.findViewById(R.id.editTextLocation);

        String[] units = {"pacotes", "kilos", "gramas", "unidades", "latas", "garrafas", "barras", "outros"};
        ArrayAdapter<String> unitAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, units);
        unitAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerUnit.setAdapter(unitAdapter);

        addCapitalizeWatcher(editTextName);
        addCapitalizeWatcher(editTextLocation);

        editTextPrice.addTextChangedListener(new TextWatcher() {
            private String current = "";
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (!s.toString().equals(current)) {
                    editTextPrice.removeTextChangedListener(this);
                    String cleanString = s.toString().replaceAll("[^\\d]", "");
                    if (cleanString.isEmpty()) cleanString = "0";
                    double parsed = Double.parseDouble(cleanString);
                    String formatted = NumberFormat.getCurrencyInstance(ptBr).format((parsed / 100));
                    current = formatted;
                    editTextPrice.setText(formatted);
                    editTextPrice.setSelection(formatted.length());
                    editTextPrice.addTextChangedListener(this);
                }
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        if (item != null) {
            builder.setTitle("Editar Produto");
            editTextName.setText(item.getName());
            editTextQuantity.setText(String.valueOf(item.getQuantity()));
            long priceInCents = Math.round(item.getPrice() * 100);
            editTextPrice.setText(String.valueOf(priceInCents));
            editTextLocation.setText(item.getLocation());
            for (int i = 0; i < units.length; i++) {
                if (units[i].equals(item.getUnit())) {
                    spinnerUnit.setSelection(i);
                    break;
                }
            }
        } else {
            builder.setTitle("Novo Produto");
            editTextPrice.setText("0");
        }

        builder.setPositiveButton("Salvar", (dialog, which) -> {
            String name = editTextName.getText().toString().trim();
            String loc = editTextLocation.getText().toString().trim();
            String qtyStr = editTextQuantity.getText().toString().replace(",", ".").trim();
            String priceStr = editTextPrice.getText().toString()
                    .replaceAll("[R$\\s]", "").replace(".", "").replace(",", ".");

            if (!name.isEmpty() && !qtyStr.isEmpty()) {
                try {
                    double qty = Double.parseDouble(qtyStr);
                    double price = Double.parseDouble(priceStr);
                    String unit = spinnerUnit.getSelectedItem().toString();

                    if (item == null) {
                        shoppingList.add(new ShoppingItem(name, qty, unit, price, loc));
                        adapter.notifyItemInserted(shoppingList.size() - 1);
                    } else {
                        item.setName(name);
                        item.setQuantity(qty);
                        item.setUnit(unit);
                        item.setPrice(price);
                        item.setLocation(loc);
                        adapter.notifyItemChanged(position);
                    }
                    saveData();
                    updateTotals();
                    preloadImages();
                } catch (NumberFormatException e) {
                    Toast.makeText(this, "Erro nos valores", Toast.LENGTH_SHORT).show();
                }
            }
        });
        builder.setNegativeButton("Cancelar", null);
        builder.create().show();
    }

    private void addCapitalizeWatcher(EditText editText) {
        editText.addTextChangedListener(new TextWatcher() {
            private boolean isUpdating = false;
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (isUpdating) return;
                String original = s.toString();
                String capitalized = capitalizeWords(original);
                if (!original.equals(capitalized)) {
                    isUpdating = true;
                    int selection = editText.getSelectionStart();
                    editText.setText(capitalized);
                    if (selection <= capitalized.length()) editText.setSelection(selection);
                    isUpdating = false;
                }
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private String capitalizeWords(String input) {
        if (input == null || input.isEmpty()) return input;
        StringBuilder capitalized = new StringBuilder();
        boolean nextTitleCase = true;
        for (char c : input.toCharArray()) {
            if (Character.isSpaceChar(c)) { nextTitleCase = true; } 
            else if (nextTitleCase) { c = Character.toUpperCase(c); nextTitleCase = false; }
            capitalized.append(c);
        }
        return capitalized.toString();
    }

    @Override
    public void onItemClick(int position) { showItemDialog(shoppingList.get(position), position); }

    @Override
    public void onDeleteClick(int position) {
        new AlertDialog.Builder(this)
                .setTitle("Remover Item")
                .setMessage("Deseja remover " + shoppingList.get(position).getName() + "?")
                .setPositiveButton("Sim", (dialog, which) -> {
                    shoppingList.remove(position);
                    adapter.notifyItemRemoved(position);
                    adapter.notifyItemRangeChanged(position, shoppingList.size());
                    saveData();
                    updateTotals();
                }).setNegativeButton("Não", null).show();
    }

    private void saveData() {
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        Gson gson = new Gson();
        editor.putString(LIST_KEY, gson.toJson(shoppingList));
        editor.apply();
    }

    private void loadData() {
        SharedPreferences sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String json = sharedPreferences.getString(LIST_KEY, null);
        Type type = new TypeToken<ArrayList<ShoppingItem>>() {}.getType();
        shoppingList = new Gson().fromJson(json, type);
        if (shoppingList == null) {
            shoppingList = new ArrayList<>();
            shoppingList.add(new ShoppingItem("Coca Cola", 1.0, "unidades", 8.50, "Bebidas"));
            shoppingList.add(new ShoppingItem("Snickers", 1.0, "unidades", 5.50, "Doces"));
        }
    }
}
