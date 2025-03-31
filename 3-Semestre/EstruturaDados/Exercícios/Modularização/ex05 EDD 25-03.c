#include <stdio.h>

int somaPosicoes(int vetor[], int tamanho, int indice, int somaPar, int somaImpar) {
    // Caso base: quando o índice atinge o tamanho do vetor
    if (indice >= tamanho)
        return somaPar == somaImpar; // Retorna 1 (verdadeiro) se as somas forem iguais, 0 caso contrário
    
    // Atualiza as somas conforme a posição (par ou ímpar)
    if (indice % 2 == 0)
        somaPar += vetor[indice];
    else
        somaImpar += vetor[indice];
    
    // Chamada recursiva para o próximo índice
    return somaPosicoes(vetor, tamanho, indice + 1, somaPar, somaImpar);
}

int verificaEquilibrio(int vetor[], int tamanho) {
    return somaPosicoes(vetor, tamanho, 0, 0, 0);
}

int main() {
    int tamanho;
    
    printf("Digite o tamanho do vetor: ");
    scanf("%d", &tamanho);
    
    int vetor[tamanho];
    
    printf("Digite os %d elementos do vetor:\n", tamanho);
    for (int i = 0; i < tamanho; i++) {
        scanf("%d", &vetor[i]);
    }
    
    if (verificaEquilibrio(vetor, tamanho))
        printf("O vetor está equilibrado!\n");
    else
        printf("O vetor não está equilibrado!\n");
    
    return 0;
}
