package br.edu.ifsp.aulafirebase2026.viewmodel;

import android.app.Application;

import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.UserProfileChangeRequest;

public class AuthViewModel extends AndroidViewModel {

    private final FirebaseAuth auth;

    public AuthViewModel(@NonNull Application application) {
        super(application);
        auth = FirebaseAuth.getInstance();
    }

    public LiveData<FirebaseUser> login(String email, String senha) {

        MutableLiveData<FirebaseUser> userLiveData = new MutableLiveData<>();

        auth.signInWithEmailAndPassword(email, senha)
                .addOnSuccessListener(authResult -> {
                    userLiveData.setValue(auth.getCurrentUser());
                })
                .addOnFailureListener(e -> {

                    userLiveData.setValue(null);
                    //Logar e.getMessage()
                });

        return userLiveData;

    }


    public FirebaseUser getCurrentUser() {
        return auth.getCurrentUser();
    }

    public void logoff() {
        auth.signOut();
    }

    public LiveData<FirebaseUser> register(String email, String senha, String nome) {

        MutableLiveData<FirebaseUser> userLiveData = new MutableLiveData<>();

        auth.createUserWithEmailAndPassword(email, senha)
                .addOnSuccessListener(authResult -> {

                    FirebaseUser fuser = authResult.getUser();

                    UserProfileChangeRequest.Builder builder = new
                            UserProfileChangeRequest.Builder();
                    builder.setDisplayName(nome);

                    fuser.updateProfile(builder.build());

                    userLiveData.setValue(auth.getCurrentUser());


                })
                .addOnFailureListener(e -> {
                    userLiveData.setValue(null);
                });

        return userLiveData;
    }

}
