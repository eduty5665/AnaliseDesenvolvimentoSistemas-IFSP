#include <stdio.h>
#include <stdlib.h>

typedef struct Noh {
    int dado;
    struct Noh *prox;
} Noh;

// Inserção no início — usa ponteiro duplo para alterar o ponteiro da lista
void inserirInicio(Noh **primeiro, int valor) {
    Noh *novo = (Noh*) calloc(1, sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao criar um novo nó.\n");
        return;
    }
    novo->dado = valor;
    novo->prox = *primeiro;
    *primeiro = novo;
}

// Inserção no fim — recebe ponteiro duplo também (por segurança)
void inserirFim(Noh **primeiro, int valor) {
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

// Inserção em posição específica
void inserir_pos(Noh **primeiro, int valor, int pos) {
    if (pos == 0) {
        inserirInicio(primeiro, valor);
        return;
    }

    Noh *novo = (Noh*) calloc(1, sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao criar novo nó.\n");
        return;
    }

    int cont = 0;
    Noh *atual = *primeiro;

    while (atual != NULL && cont < pos - 1) {
        atual = atual->prox;
        cont++;
    }

    if (atual == NULL) {
        printf("Posição inválida.\n");
        free(novo);
        return;
    }

    novo->dado = valor;
    novo->prox = atual->prox;
    atual->prox = novo;
}

// Remoção no início
void removerInicio(Noh **primeiro) {
    if (*primeiro == NULL) {
        printf("Lista vazia!\n");
        return;
    }

    Noh *atual = *primeiro;
    *primeiro = atual->prox;
    free(atual);
}

// Remoção no fim
void removerFim(Noh **primeiro) {
    if (*primeiro == NULL) {
        printf("Lista vazia!\n");
        return;
    }

    Noh *atual = *primeiro;
    Noh *anterior = NULL;

    while (atual->prox != NULL) {
        anterior = atual;
        atual = atual->prox;
    }

    if (anterior == NULL) {
        // só tem um elemento
        free(*primeiro);
        *primeiro = NULL;
    } else {
        anterior->prox = NULL;
        free(atual);
    }
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

// Função principal
int main() {
    Noh *lista = NULL;

    inserirInicio(&lista, 10);
    inserirInicio(&lista, 5);
    inserirFim(&lista, 20);
    inserir_pos(&lista, 15, 2); // Insere na posição 2

    printf("Lista atual:\n");
    exibirTodos(lista);

    printf("\nRemovendo início:\n");
    removerInicio(&lista);
    exibirTodos(lista);

    printf("\nRemovendo fim:\n");
    removerFim(&lista);
    exibirTodos(lista);

    return 0;
}