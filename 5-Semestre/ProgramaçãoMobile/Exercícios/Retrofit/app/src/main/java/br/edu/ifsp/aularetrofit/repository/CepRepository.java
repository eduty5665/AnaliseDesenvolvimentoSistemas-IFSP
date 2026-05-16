package br.edu.ifsp.aularetrofit.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import br.edu.ifsp.aularetrofit.model.api.ViaCepApi;
import br.edu.ifsp.aularetrofit.model.api.ViaCepService;
import br.edu.ifsp.aularetrofit.model.entity.CepResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CepRepository {

    private static volatile CepRepository instance;
    private final ViaCepApi viaCepApi;


    private CepRepository() {
        this.viaCepApi = ViaCepService.getInstance();
    }

    public static CepRepository getInstance() {
        if(instance == null) {

            synchronized (CepRepository.class) {
                if(instance == null) {
                    instance = new CepRepository();
                }
            }

        }

        return instance;
    }

    public LiveData<Result<CepResponse>> consultarCep(String cep) {

        MutableLiveData<Result<CepResponse>> resultMutableLiveData =
                new MutableLiveData<>();

        viaCepApi.getCep(cep).enqueue(new Callback<CepResponse>() {
            @Override
            public void onResponse(Call<CepResponse> call, Response<CepResponse> response) {

                if(response.isSuccessful() && response.body() != null) {
                    CepResponse data = response.body();

                    if(!data.isValid()) {
                        resultMutableLiveData.setValue(Result.error("CEP não encotrado."));
                    }
                    else {
                        resultMutableLiveData.setValue(Result.success(data));
                    }

                }
                else {
                    resultMutableLiveData.setValue(Result.error("Erro: " + response.code()));
                }

            }

            @Override
            public void onFailure(Call<CepResponse> call, Throwable t) {

                String msg = t.getMessage() != null ? t.getMessage() : "Erro desconhecido.";

                if(msg.contains("Unable to resolve host")) {
                    resultMutableLiveData.setValue(Result.error("Sem Internet"));
                }
                else if(msg.contains("timeout")) {
                    resultMutableLiveData.setValue(Result.error("Timeout"));
                }
                else {
                    resultMutableLiveData.setValue(Result.error(msg));
                }
            }
        });


        return resultMutableLiveData;
    }

    public static class Result<T> {
        public enum Status {LOADING, SUCCESS, ERROR};

        private final Status status;
        private final T data;
        private final String errorMessage;

        public Result(Status status, T data, String errorMessage) {
            this.status = status;
            this.data = data;
            this.errorMessage = errorMessage;
        }

        public static <T> Result<T> loading() {
            return new Result<>(Status.LOADING, null, null);
        }

        public static <T> Result<T> success(T data) {
            return new Result<>(Status.SUCCESS, data, null);
        }

        public static <T> Result<T> error(String msg) {
            return new Result<>(Status.SUCCESS, null, msg);
        }

        public Status getStatus() {
            return status;
        }

        public T getData() {
            return data;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public boolean isLoading() {
            return status == Status.LOADING;
        }

        public boolean isSuccess() {
            return status == Status.SUCCESS;
        }

        public boolean isError() {
            return status == Status.ERROR;
        }

    }

}
