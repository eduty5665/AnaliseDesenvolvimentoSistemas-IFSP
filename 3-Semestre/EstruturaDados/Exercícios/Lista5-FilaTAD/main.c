#include <stdio.h>
#include "fila.h"

int main() {
    Fila* f = fila_criar();  // Criação da fila

    // Inserção de elementos
    printf("Enfileirando elementos...\n");
    enqueue(f, 10);
    enqueue(f, 20);
    enqueue(f, 30);
    
    // Impressão completa da fila
    printf("Primeiro elemento da fila: %d\n", peek(f));
    
    // Remoção e visualização do primeiro elemento
    printf("Desenfileirando elemento: %d\n", dequeue(f));
    printf("Novo primeiro elemento da fila: %d\n", peek(f));

    // Verificação de fila vazia
    if (fila_vazia(f)) {
        printf("A fila está vazia.\n");
    } else {
        printf("A fila ainda tem elementos.\n");
    }
    
    // Destruindo a fila
    fila_destruir(f);
    return 0;
}

