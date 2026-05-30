package com.example.appgerencia;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.Locale;

public class ShoppingAdapter extends RecyclerView.Adapter<ShoppingAdapter.ShoppingViewHolder> {

    private List<ShoppingItem> itemList;
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(int position);
        void onDeleteClick(int position);
    }

    public ShoppingAdapter(List<ShoppingItem> itemList, OnItemClickListener listener) {
        this.itemList = itemList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ShoppingViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_shopping, parent, false);
        return new ShoppingViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ShoppingViewHolder holder, int position) {
        ShoppingItem item = itemList.get(position);
        holder.textViewName.setText(item.getName());
        
        String qtyText = String.format(Locale.getDefault(), "%.2f %s", item.getQuantity(), item.getUnit());
        holder.textViewQuantity.setText(qtyText);
        
        holder.textViewPrice.setText(String.format(Locale.getDefault(), "R$ %.2f", item.getPrice()));
        holder.textViewLocation.setText("Local: " + item.getLocation());

        holder.buttonEdit.setOnClickListener(v -> listener.onItemClick(position));
        holder.buttonDelete.setOnClickListener(v -> listener.onDeleteClick(position));
        holder.itemView.setOnClickListener(v -> listener.onItemClick(position));
    }

    @Override
    public int getItemCount() {
        return itemList.size();
    }

    public static class ShoppingViewHolder extends RecyclerView.ViewHolder {
        TextView textViewName, textViewQuantity, textViewPrice, textViewLocation;
        ImageButton buttonEdit, buttonDelete;

        public ShoppingViewHolder(@NonNull View itemView) {
            super(itemView);
            textViewName = itemView.findViewById(R.id.textViewName);
            textViewQuantity = itemView.findViewById(R.id.textViewQuantity);
            textViewPrice = itemView.findViewById(R.id.textViewPrice);
            textViewLocation = itemView.findViewById(R.id.textViewLocation);
            buttonEdit = itemView.findViewById(R.id.buttonEdit);
            buttonDelete = itemView.findViewById(R.id.buttonDelete);
        }
    }
}
