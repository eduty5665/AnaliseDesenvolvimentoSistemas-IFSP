#include <stdio.h>
#include <stdlib.h>

typedef struct Noh {
    int dado;
    struct Noh *prox;
} Noh;

// Inserção no fim da fila circular
void inserir(Noh **inicio, Noh **fim, int valor) {
    Noh *novo = (Noh*) malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao alocar memória.\n");
        return;
    }

    novo->dado = valor;
    novo->prox = NULL;

    if (*inicio == NULL) {
        // Fila vazia
        *inicio = novo;
        *fim = novo;
        novo->prox = novo;  // aponta para si mesmo
    } else {
        novo->prox = *inicio;
        (*fim)->prox = novo;
        *fim = novo;
    }
}

// Remoção do início da fila circular
void remover(Noh **inicio, Noh **fim) {
    if (*inicio == NULL) {
        printf("Fila vazia!\n");
        return;
    }

    Noh *removido = *inicio;

    if (*inicio == *fim) {
        // Apenas um elemento
        *inicio = NULL;
        *fim = NULL;
    } else {
        *inicio = removido->prox;
        (*fim)->prox = *inicio;
    }

    free(removido);
}

// Exibição dos elementos da fila circular
void exibirTodos(Noh *inicio) {
    if (inicio == NULL) {
        printf("Fila vazia!\n");
        return;
    }

    Noh *atual = inicio;
    do {
        printf("%d -> ", atual->dado);
        atual = atual->prox;
    } while (atual != inicio);

    printf("(volta ao início)\n");
}

int main() {
    Noh *inicio = NULL;
    Noh *fim = NULL;

    inserir(&inicio, &fim, 10);
    inserir(&inicio, &fim, 5);

    printf("Adicionando:\n");
    exibirTodos(inicio);

    inserir(&inicio, &fim, 20);
    printf("\nLista atual:\n");
    exibirTodos(inicio);

    printf("\nRemovendo:\n");
    remover(&inicio, &fim);
    exibirTodos(inicio);

    return 0;
}
