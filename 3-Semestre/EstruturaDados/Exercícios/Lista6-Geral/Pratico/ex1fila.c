#include <stdio.h>
#include <stdlib.h>

typedef struct Noh {
    int dado;
    struct Noh *prox;
} Noh;

// Inserção no início (push)
void push(Noh **topo, int valor) {
    Noh *novo = (Noh*) calloc(1, sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao alocar memória.\n");
        return;
    }
    novo->dado = valor; 
    *topo = novo;
}

// Remoção do início (pop)
void pop(Noh **topo) {
    if (*topo == NULL) {
        printf("Pilha vazia!\n");
        return;
    }

    Noh *retirado = *topo;
    *topo = retirado->prox;
    free(retirado);
}

// Exibir a pilha
void exibirPilha(Noh *topo) {
    if (topo == NULL) {
        printf("Pilha vazia!\n");
        return;
    }

    Noh *aux = topo;
    while (aux != NULL) {
        printf("%d -> ", aux->dado);
        aux = aux->prox;
    }
    printf("NULL\n");
}

int main() {
    Noh *pilha = NULL;

    push(&pilha, 10);
    push(&pilha, 5);
    
    printf("Empilhando:\n");
    exibirPilha(pilha);

    push(&pilha, 20);
    printf("\nPilha atual:\n");
    exibirPilha(pilha);

    printf("\nDesempilhando:\n");
    pop(&pilha);
    exibirPilha(pilha);

    return 0;
}
