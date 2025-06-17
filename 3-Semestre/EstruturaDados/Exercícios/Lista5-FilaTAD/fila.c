#include <stdio.h>
#include <stdlib.h>
#include "fila.h"

// Definição do nó da lista ligada
typedef struct Noh {
    int valor;
    struct Noh* prox;
} Noh;

// Definição da estrutura da fila
struct Fila {
    Noh* inicio;
    Noh* fim;
};

// Função para criar uma fila
Fila* fila_criar() {
    Fila* f = (Fila*)malloc(sizeof(Fila));
    if (f == NULL) {
        printf("Erro ao alocar memória para a fila!\n");
        exit(1);
    }
    f->inicio = NULL;
    f->fim = NULL;
    return f;
}

// Função para destruir a fila e liberar a memória
void fila_destruir(Fila* f) {
    Noh* atual = f->inicio;
    Noh* temp;
    while (atual != NULL) {
        temp = atual;
        atual = atual->prox;
        free(temp);
    }
    free(f);
}

// Função para inserir um valor na fila
void enqueue(Fila* f, int valor) {
    Noh* novo = (Noh*)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao alocar memória para o novo nó!\n");
        exit(1);
    }
    novo->valor = valor;
    novo->prox = NULL;
    if (f->fim != NULL) {
        f->fim->prox = novo;
    }
    f->fim = novo;
    if (f->inicio == NULL) {
        f->inicio = novo;
    }
}

// Função para remover o primeiro valor da fila
int dequeue(Fila* f) {
    if (fila_vazia(f)) {
        printf("A fila está vazia!\n");
        return -1; // Indicando erro
    }
    Noh* temp = f->inicio;
    int valor = temp->valor;
    f->inicio = f->inicio->prox;
    if (f->inicio == NULL) {
        f->fim = NULL; // Se a fila ficou vazia
    }
    free(temp);
    return valor;
}

// Função para visualizar o primeiro valor da fila
int peek(Fila* f) {
    if (fila_vazia(f)) {
        printf("A fila está vazia!\n");
        return -1; // Indicando erro
    }
    return f->inicio->valor;
}

// Função para verificar se a fila está vazia
int fila_vazia(Fila* f) {
    return f->inicio == NULL;
}

