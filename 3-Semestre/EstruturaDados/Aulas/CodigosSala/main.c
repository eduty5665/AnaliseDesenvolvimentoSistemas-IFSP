#include <stdio.h>
#include "pilha.h"

int main() {

    Pilha* minhaPilha = pilha_criar();

    push(minhaPilha, 10);
    push(minhaPilha, 20);
    push(minhaPilha, 30);

    printf("Topo da pilha: %d\n", peek(minhaPilha));

    pop(minhaPilha);
    printf("Topo após pop: %d\n", peek(minhaPilha));

    if (pilha_vazia(minhaPilha))
        printf("Pilha está vazia.\n");
    else
        printf("Pilha contém elementos.\n");

    destruir(minhaPilha);
    return 0;
}