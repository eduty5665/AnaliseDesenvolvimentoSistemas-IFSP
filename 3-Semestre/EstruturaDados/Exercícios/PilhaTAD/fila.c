#include <stdio.h>
#include <stdlib.h>
#include "fila.h"

// Defini��o do n� da lista ligada
typedef struct Noh {
    int valor;
    struct Noh* prox;
} Noh;

// Defini��o da estrutura da fila
struct Fila {
    Noh* inicio;
    Noh* fim;
};

// Fun��o para criar uma fila
Fila* fila_criar() {
    Fila* f = (Fila*)malloc(sizeof(Fila));
    if (f == NULL) {
        printf("Erro ao alocar mem�ria para a fila!\n");
        exit(1);
    }
    f->inicio = NULL;
    f->fim = NULL;
    return f;
}

// Fun��o para destruir a fila e liberar a mem�ria
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

// Fun��o para inserir um valor na fila
void enqueue(Fila* f, int valor) {
    Noh* novo = (Noh*)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao alocar mem�ria para o novo n�!\n");
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

// Fun��o para remover o primeiro valor da fila
int dequeue(Fila* f) {
    if (fila_vazia(f)) {
        printf("A fila est� vazia!\n");
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

// Fun��o para visualizar o primeiro valor da fila
int peek(Fila* f) {
    if (fila_vazia(f)) {
        printf("A fila est� vazia!\n");
        return -1; // Indicando erro
    }
    return f->inicio->valor;
}

// Fun��o para verificar se a fila est� vazia
int fila_vazia(Fila* f) {
    return f->inicio == NULL;
}

