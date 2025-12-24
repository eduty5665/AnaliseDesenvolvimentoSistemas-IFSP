#include <stdio.h>
#include <stdlib.h>

typedef struct No {
    char valor;
    struct No* esq;
    struct No* dir;
} No;

No* novoNo(char valor) {
    No* no = (No*) malloc(sizeof(No));
    no->valor = valor;
    no->esq = NULL;
    no->dir = NULL;
    return no;
}

void exibirParenteses(No* raiz) {
    if (raiz != NULL) {
        printf("%c", raiz->valor);
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

void exibirParagrafado(No* raiz, int nivel) {
    if (raiz != NULL) {
        for (int i = 0; i < nivel; i++) printf("  ");
        printf("%c\n", raiz->valor);
        exibirParagrafado(raiz->esq, nivel + 1);
        exibirParagrafado(raiz->dir, nivel + 1);
    }
}

int main() {
    
    No* raiz = novoNo('A');
    raiz->esq = novoNo('B');
    raiz->dir = novoNo('C');
    raiz->esq->esq = novoNo('D');
    raiz->esq->dir = novoNo('E');
    raiz->dir->dir = novoNo('F');

    printf("Parênteses aninhados:\n");
    exibirParenteses(raiz);
    printf("\n\n");

    printf("Paragrafado:\n");
    exibirParagrafado(raiz, 0);

    return 0;
}
