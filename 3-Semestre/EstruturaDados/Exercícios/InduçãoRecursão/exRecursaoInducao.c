#include <stdio.h>

int soma_impares(int n) {
    if (n == 1) {
        return 1; 
    } else {
        return soma_impares(n - 1) + (2 * n - 1);
    }
}

int main() {
    int n;

    printf("Digite um valor para n: ");
    scanf("%d", &n);

    if (n < 1) {
        printf("Por favor, digite um valor inteiro positivo.\n");
        return 1;
    }

    int resultado = soma_impares(n);
    printf("A soma dos %d primeiros números ímpares é: %d\n", n, resultado);

    return 0;
}
