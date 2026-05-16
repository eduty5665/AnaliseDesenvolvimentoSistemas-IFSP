package br.edu.ifsp.aulafirebase2026.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import java.util.List;

import br.edu.ifsp.aulafirebase2026.model.dao.CarroDao;
import br.edu.ifsp.aulafirebase2026.model.entity.Carro;

public class CarroViewModel extends AndroidViewModel {

    private CarroDao dao;
    private LiveData<List<Carro>> carros;

    public CarroViewModel(@NonNull Application application) {
        super(application);
        dao = new CarroDao();
        carros = dao.getAllCarros();
    }

    public LiveData<List<Carro>> getCarros() {
        return carros;
    }

    public LiveData<Carro> getCarroById(String id) {
        return dao.getCarroById(id);
    }

    public void insertCarro(Carro carro) {
        dao.insertCarro(carro);
    }

    public void updateCarro(Carro carro) {
        dao.updateCarro(carro);
    }

    public void deleteCarro(Carro carro) {
        dao.deleteCarro(carro);
    }

}
