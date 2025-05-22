#include <stdio.h>
#include <stdlib.h>

typedef struct Noh {
    int dado;
    int prioridade;
    struct Noh* prox;
} Noh;

void inserir(Noh** inicio, int dado, int prioridade) {
    Noh* novo = malloc(sizeof(Noh));
    novo->dado = dado;
    novo->prioridade = prioridade;
    novo->prox = NULL;
    
    if (*inicio == NULL || prioridade < (*inicio)->prioridade) {
        novo->prox = *inicio;
        *inicio = novo;
        return;
    }
    
    Noh* atual = *inicio;
    
    while (atual->prox && atual->prox->prioridade <= prioridade) {
        atual = atual->prox;
    }
    
    novo->prox = atual->prox;
    atual->prox = novo;
}

// Função para remover o nó com maior prioridade (menor valor de prioridade)
int remover(Noh** inicio) {
    if (*inicio == NULL) return -1;
    
    Noh *atual = *inicio, *anterior = NULL;
    Noh *maior = atual, *antMaior = NULL;
    
    // Encontrar o nó com maior prioridade
    while (atual != NULL) {
        if (atual->prioridade < maior->prioridade) {
            maior = atual;
            antMaior = anterior;
        }
    
        anterior = atual;
        atual = atual->prox;
    }
    
    // Remover o nó encontrado
    if (antMaior == NULL) {
        *inicio = maior->prox;
    } else {
        antMaior->prox = maior->prox;
    }
    
    int valor = maior->dado;
    free(maior);
    return valor;
}

// Função para imprimir a lista de prioridade
void imprimirLista(Noh* inicio) {
    printf("Fila de Prioridade:\n");
    while (inicio != NULL) {
        printf("Dado: %d | Prioridade: %d\n", inicio->dado, inicio->prioridade);
        inicio = inicio->prox;
    }
    printf("---------------------------\n");
}

int main() {
    Noh* inicio = NULL;
    
    inserir(&inicio, 10, 2);
    printf("Após inserção (10, 2):\n");
    imprimirLista(inicio);
    
    inserir(&inicio, 20, 1);
    printf("Após inserção (20, 1):\n");
    imprimirLista(inicio);
    
    inserir(&inicio, 30, 3);
    printf("Após inserção (30, 3):\n");
    imprimirLista(inicio);
    
    int removido = remover(&inicio);
    printf("Após remoção (removido: %d):\n", removido);
    imprimirLista(inicio);
    
    inserir(&inicio, 15, 1);
    printf("Após inserção (15, 1):\n");
    imprimirLista(inicio);
    
    return 0;
}
