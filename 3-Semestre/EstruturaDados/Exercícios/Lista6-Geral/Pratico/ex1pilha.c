#include <stdio.h>
#include <stdlib.h>

typedef struct Noh {
    int dado;
    struct Noh *prox;
} Noh;

// Inserção no fim 
void inserir(Noh **primeiro, int valor) {
    Noh *novo = (Noh*) calloc(1, sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao criar novo nó.\n");
        return;
    }
    novo->dado = valor;
    novo->prox = NULL;

    if (*primeiro == NULL) {
        *primeiro = novo;
        return;
    }

    Noh *ultimo = *primeiro;
    while (ultimo->prox != NULL) {
        ultimo = ultimo->prox;
    }
    ultimo->prox = novo;
}

// Remoção no início
void remover(Noh **primeiro) {
    if (*primeiro == NULL) {
        printf("Lista vazia!\n");
        return;
    }

    Noh *atual = *primeiro;
    *primeiro = atual->prox;
    free(atual);
}

// Exibição da lista
void exibirTodos(Noh *primeiro) {
    if (primeiro == NULL) {
        printf("Lista vazia!\n");
        return;
    }

    Noh *aux = primeiro;
    while (aux != NULL) {
        printf("%d -> ", aux->dado);
        aux = aux->prox;
    }
    printf("NULL\n");
}

int main() {
    Noh *lista = NULL;

    inserir(&lista, 10);
    inserir(&lista, 5);
    
    printf("Adicionando:\n");
    exibirTodos(lista);
    
    inserir(&lista, 20);

    printf("\nLista atual:\n");
    exibirTodos(lista);

    printf("\nRemovendo:\n");
    remover(&lista);
    exibirTodos(lista);


    return 0;
}