#include <stdio.h>
#include <stdlib.h>
#include "pilha.h"

#define TAM 100

// Definição da estrutura (privada ao .c)
struct Pilha {
    int dados[TAM];
    int topo;
};

// Cria uma nova pilha
Pilha* pilha_criar() {
    Pilha* p = (Pilha*) malloc(sizeof(Pilha));
    if (p != NULL)
        p->topo = -1;
    return p;
}

// Libera a memória da pilha
void destruir(Pilha* p) {
    free(p);
}

// Insere um elemento no topo da pilha
void push(Pilha* p, int valor) {
    if (p->topo < TAM - 1) {
        p->dados[++(p->topo)] = valor;
    } else {
        printf("Erro: pilha cheia!\n");
    }
}

// Remove e retorna o topo da pilha
int pop(Pilha* p) {
    if (p->topo >= 0) {
        return p->dados[(p->topo)--];
    } else {
        printf("Erro: pilha vazia!\n");
        return -1;
    }
}

// Retorna o elemento no topo sem remover
int peek(Pilha* p) {
    if (p->topo >= 0)
        return p->dados[p->topo];
    else {
        printf("Pilha vazia.\n");
        return -1;
    }
}

// Verifica se a pilha está vazia
int pilha_vazia(Pilha* p) {
    return (p->topo == -1);
}