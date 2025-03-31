#include <stdio.h>


int contarPares(int matriz[4][4], int linhas, int colunas, int i, int j) {

    if (i == linhas) {
        return 0;
    }

    if (j == colunas) {
        return contarPares(matriz, linhas, colunas, i + 1, 0);
    }

    int par = (matriz[i][j] % 2 == 0) ? 1 : 0;

    return par + contarPares(matriz, linhas, colunas, i, j + 1);
}

int main() {

    int matriz[4][4] = {
        {2, 3, 4, 5},
        {6, 7, 8, 9},
        {10, 11, 12, 13},
        {14, 15, 16, 17}
    };

    printf("Matriz:\n");
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            printf("%d ", matriz[i][j]);
        }
        printf("\n");
    }

    int quantidadePares = contarPares(matriz, 4, 4, 0, 0);

    printf("\nQuantidade de elementos pares: %d\n", quantidadePares);

    return 0;
}

