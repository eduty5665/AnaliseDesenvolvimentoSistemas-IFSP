#include <stdio.h>
#include <stdlib.h>

typedef struct Noh {
    int dado;
    struct Noh *prox;
} Noh;

// 1. Soma dos valores - Versão Iterativa
int somaIterativa(Noh *primeiro) {
    int soma = 0;
    while (primeiro != NULL) {
        soma += primeiro->dado;
        primeiro = primeiro->prox;
    }
    return soma;
}

// 1. Soma dos valores - Versão Recursiva
int somaRecursiva(Noh *primeiro) {
    if (primeiro == NULL) return 0;
    return primeiro->dado + somaRecursiva(primeiro->prox);
}

// 2. Contagem de nós
int contarNos(Noh *primeiro) {
    int cont = 0;
    while (primeiro != NULL) {
        cont++;
        primeiro = primeiro->prox;
    }
    return cont;
}

// 3. Inserção em posição específica
void inserir_pos(Noh **primeiro, int valor, int pos) {
    if (pos < 0) {
        printf("Posição inválida.\n");
        return;
    }

    Noh *novo = (Noh*) calloc(1, sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao alocar memória.\n");
        return;
    }
    novo->dado = valor;

    if (pos == 0) {
        novo->prox = *primeiro;
        *primeiro = novo;
        return;
    }

    Noh *atual = *primeiro;
    for (int i = 0; atual != NULL && i < pos - 1; i++) {
        atual = atual->prox;
    }

    if (atual == NULL) {
        printf("Posição fora da lista.\n");
        free(novo);
        return;
    }

    novo->prox = atual->prox;
    atual->prox = novo;
}

// 4. Busca na lista
int buscar(Noh *primeiro, int valor) {
    int pos = 0;
    while (primeiro != NULL) {
        if (primeiro->dado == valor) return pos;
        primeiro = primeiro->prox;
        pos++;
    }
    return -1;
}

// 5. Atendimento (remoção do último elemento)
Noh* atendimento(Noh **primeiro) {
    if (*primeiro == NULL) return NULL;

    Noh *atual = *primeiro;
    Noh *anterior = NULL;

    while (atual->prox != NULL) {
        anterior = atual;
        atual = atual->prox;
    }

    if (anterior == NULL) {
        *primeiro = NULL;
    } else {
        anterior->prox = NULL;
    }

    return atual; // Retorna o nó removido
}

// Função de exibição
void exibir(Noh *primeiro) {
    if (primeiro == NULL) {
        printf("Lista vazia.\n");
        return;
    }

    while (primeiro != NULL) {
        printf("%d ", primeiro->dado);
        primeiro = primeiro->prox;
    }
    printf("\n");
}

int main() {
    Noh *lista = NULL;

    // Inserção inicial
    inserir_pos(&lista, 5, 0);
    inserir_pos(&lista, 10, 0);
    inserir_pos(&lista, 15, 0);

    printf("Lista atual:\n");
    exibir(lista);

    printf("\nSoma Iterativa: %d", somaIterativa(lista));
    printf("\nSoma Recursiva: %d", somaRecursiva(lista));
    printf("\nTotal de nós: %d", contarNos(lista));

    inserir_pos(&lista, 20, 1); // Inserir 20 na posição 1
    printf("\nLista após inserir 20 na posição 1:\n");
    exibir(lista);

    int valorBusca = 10;
    int posicao = buscar(lista, valorBusca);
    printf("\nValor %d encontrado na posição: %d", valorBusca, posicao);

    Noh *removido = atendimento(&lista);
    if (removido != NULL) {
        printf("\nElemento removido do fim: %d\n", removido->dado);
        free(removido);
    }

    printf("\nLista final:\n");
    exibir(lista);

    return 0;
}
