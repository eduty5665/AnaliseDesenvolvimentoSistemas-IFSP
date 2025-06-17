#include <stdio.h>

int somaVetor(int A[], int n) {
    if (n == 1) {
        return A[0];
    } else {
        return somaVetor(A, n - 1) + A[n - 1];
    }
}

int main() {
    int n1 = 5;
    int A1[] = {1, 2, 3, 4, 5};

    int n2 = 4;
    int A2[] = {10, 20, 30, 40};

    printf("Soma do vetor 1: %d\n", somaVetor(A1, n1)); // Deve imprimir 15
    printf("Soma do vetor 2: %d\n", somaVetor(A2, n2)); // Deve imprimir 100

    return 0;
}
