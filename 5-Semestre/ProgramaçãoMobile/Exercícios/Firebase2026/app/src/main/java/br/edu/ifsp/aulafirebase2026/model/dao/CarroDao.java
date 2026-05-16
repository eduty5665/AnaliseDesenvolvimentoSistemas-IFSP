package br.edu.ifsp.aulafirebase2026.model.dao;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.Query;

import java.util.ArrayList;
import java.util.List;

import br.edu.ifsp.aulafirebase2026.model.entity.Carro;

public class CarroDao {

    public static final String COLLECTION_CARROS = "carros";

    private final FirebaseFirestore firestore;
    private final MutableLiveData<List<Carro>> listaCarrosLiveData;

    public CarroDao() {
        firestore = FirebaseFirestore.getInstance();
        listaCarrosLiveData = new MutableLiveData<>();
    }

    public LiveData<List<Carro>> getAllCarros() {
        carregarCarros();
        return listaCarrosLiveData;
    }

    public LiveData<Carro> getCarroById(String id) {

        MutableLiveData<Carro> carroLiveData = new MutableLiveData<>();

        firestore.collection(COLLECTION_CARROS).document(id)
                .addSnapshotListener((value,
                                      error) -> {
                    if(error != null && value == null || !value.exists()) {
                        carroLiveData.setValue(null);
                        return;
                    }

                    Carro carro = value.toObject(Carro.class);
                    if(carro != null) {
                        carroLiveData.setValue(carro);
                    }

                });

        return carroLiveData;

    }

    private void carregarCarros() {
        firestore.collection(COLLECTION_CARROS)
                .orderBy("nome", Query.Direction.ASCENDING)
                .addSnapshotListener((value, error) -> {

                    if(error != null && value == null) {
                        return;
                    }

                    List<Carro> listaCarros = new ArrayList<>();

                    for(DocumentSnapshot doc : value.getDocuments()) {
                        Carro carro = doc.toObject(Carro.class);

                        if(carro != null) {
                            listaCarros.add(carro);
                        }
                    }

                    listaCarrosLiveData.setValue(listaCarros);

                } );
    }

    public void insertCarro (Carro carro) {

        String id = firestore.collection(COLLECTION_CARROS).document().getId();
        carro.setId(id);

        firestore.collection(COLLECTION_CARROS).document(id).set(carro);
    }

    public void updateCarro (Carro carro) {
        firestore.collection(COLLECTION_CARROS)
                .document(carro.getId())
                .set(carro);
    }

    public void deleteCarro(Carro carro) {
        firestore.collection(COLLECTION_CARROS)
                .document(carro.getId())
                .delete();
    }

}
