#include <stdio.h>
#include <stdlib.h>

void encontra_maior(int arr[], int N, int *maior, int *ocorrencias) {
    *ocorrencias = 0;
    *maior = arr[0]; // Inicializa com o primeiro valor do array

    // Encontra o maior número
    for (int i = 0; i < N; i++) {
        if (arr[i] > *maior) {
            *maior = arr[i];
        }
    }

    // Conta quantas vezes o maior número aparece
    for (int i = 0; i < N; i++) {
        if (arr[i] == *maior) {
            (*ocorrencias)++;
        }
    }
}

int main() {
    int N;
    scanf("%d", &N);
    
    int arr[N]; // Declaração direta do array
    int maior, ocorrencias; // Variáveis normais

    // Leitura dos valores do vetor
    for (int i = 0; i < N; i++) {
        scanf("%d", &arr[i]);
    }

    // Chama a função passando os endereços de `maior` e `ocorrencias`
    encontra_maior(arr, N, &maior, &ocorrencias);

    // Exibe os resultados
    printf("%d\n%d\n", maior, ocorrencias);

    return 0;
}
