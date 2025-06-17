#include <stdio.h>
#include "fila.h"

int main() {
    Fila* f = fila_criar();  // Cria��o da fila

    // Inser��o de elementos
    printf("Enfileirando elementos...\n");
    enqueue(f, 10);
    enqueue(f, 20);
    enqueue(f, 30);
    
    // Impress�o completa da fila
    printf("Primeiro elemento da fila: %d\n", peek(f));
    
    // Remo��o e visualiza��o do primeiro elemento
    printf("Desenfileirando elemento: %d\n", dequeue(f));
    printf("Novo primeiro elemento da fila: %d\n", peek(f));

    // Verifica��o de fila vazia
    if (fila_vazia(f)) {
        printf("A fila est� vazia.\n");
    } else {
        printf("A fila ainda tem elementos.\n");
    }
    
    // Destruindo a fila
    fila_destruir(f);
    return 0;
}

