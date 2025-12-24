#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    int valor;
    struct No* esq;
    struct No* dir;
} No;

No* novoNo(int valor) {
    No* no = (No*) malloc(sizeof(No));
    no->valor = valor;
    no->esq = NULL;
    no->dir = NULL;
    return no;
}

No* inserir(No* raiz, int valor) {
    if (raiz == NULL) {
        return novoNo(valor);
    }
    if (valor < raiz->valor) {
        raiz->esq = inserir(raiz->esq, valor);
    } else {
        raiz->dir = inserir(raiz->dir, valor);
    }
    return raiz;
}

void preOrdem(No* raiz) {
    if (raiz != NULL) {
        printf("%d ", raiz->valor);
        preOrdem(raiz->esq);
        preOrdem(raiz->dir);
    }
}

void emOrdem(No* raiz) {
    if (raiz != NULL) {
        emOrdem(raiz->esq);
        printf("%d ", raiz->valor);
        emOrdem(raiz->dir);
    }
}

void posOrdem(No* raiz) {
    if (raiz != NULL) {
        posOrdem(raiz->esq);
        posOrdem(raiz->dir);
        printf("%d ", raiz->valor);
    }
}

void exibirParenteses(No* raiz) {
    if (raiz != NULL) {
        printf("%d", raiz->valor);
        if (raiz->esq != NULL || raiz->dir != NULL) {
            printf("(");
            if (raiz->esq != NULL)
                exibirParenteses(raiz->esq);
            else
                printf(" ");
            printf(",");
            if (raiz->dir != NULL)
                exibirParenteses(raiz->dir);
            else
                printf(" ");
            printf(")");
        }
    }
}

void exibirParagrafo(No* raiz, int nivel) {
    if (raiz != NULL) {
        for (int i = 0; i < nivel; i++) printf("  ");
        printf("%d\n", raiz->valor);
        exibirParagrafo(raiz->esq, nivel + 1);
        exibirParagrafo(raiz->dir, nivel + 1);
    }
}

int main() {
    No* raiz = NULL;

    raiz = inserir(raiz, 10);
    raiz = inserir(raiz, 5);
    raiz = inserir(raiz, 15);

    printf("Percurso Pre-Ordem: ");
    preOrdem(raiz);
    printf("\n");

    printf("Percurso Em-Ordem: ");
    emOrdem(raiz);
    printf("\n");

    printf("Percurso Pos-Ordem: ");
    posOrdem(raiz);
    printf("\n");

    printf("Exibicao com parenteses: ");
    exibirParenteses(raiz);
    printf("\n");

    printf("Exibicao paragrafos:\n");
    exibirParagrafo(raiz, 0);

    return 0;
}
