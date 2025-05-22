#include <stdio.h>
#include <stdlib.h>
#include "pilha.h"


// Definição da estrutura (privada ao .c)
struct Pilha {
    int valor;
    Pilha * prox; 
};

// Cria uma nova pilha
Pilha* pilha_criar() {
    Pilha* p = malloc(sizeof(Pilha));
    if (p != NULL) {
        p->prox = NULL;
    }
    return p;
}

// Libera a memória da pilha
void destruir(Pilha* p) {
    Pilha* atual = p;
    while (atual != NULL) {
        Pilha* temp = atual;
        atual = atual->prox;
        free(temp);
    }
}

// Insere um elemento no topo da pilha
void push(Pilha * p, int valor) {
    Pilha* novo = malloc(sizeof(Pilha));
    if (novo == NULL) return;
    novo->valor = valor;
    novo->prox = p->prox;
    p->prox = novo;
}

// Remove e retorna o topo da pilha
int pop(Pilha* p) {
    if (p->prox == NULL) return -1;
    Pilha* temp = p->prox;
    int val = temp->valor;
    p->prox = temp->prox;
    free(temp);
    return val;
}

// Retorna o elemento no topo sem remover
int peek(Pilha* p) {
    if (p == NULL || p->prox == NULL) {
        printf("Pilha vazia.\n");
        return -1;
    }
    return p->prox->valor;
}

// Verifica se a pilha está vazia
int pilha_vazia(Pilha* p) {
    return (p == NULL || p->prox == NULL);
}