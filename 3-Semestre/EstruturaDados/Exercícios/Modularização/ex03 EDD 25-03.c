#include <stdio.h>

int somaVetor(int vetor[], int tamanho, int indice) {
    if (indice == tamanho) {
        return 0;  
    }

    return vetor[indice] + somaVetor(vetor, tamanho, indice + 1);
}

int main() {
    int tamanho;

    printf("Digite o tamanho do vetor: ");
    scanf("%d", &tamanho);

    int vetor[tamanho];
    
    printf("Digite os elementos do vetor:\n");
    for (int i = 0; i < tamanho; i++) {
        scanf("%d", &vetor[i]);
    }

    int soma = somaVetor(vetor, tamanho, 0);

    printf("Soma dos elementos: %d\n", soma);

    return 0;
}

