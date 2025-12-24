
#include <stdio.h>
#include <stdlib.h>

#define VERMELHO 1
#define PRETO 0

typedef struct No {
    int valor;
    int cor;
    struct No *esq, *dir;
} No;

No* novoNo(int valor) {
    No* n = malloc(sizeof(No));
    n->valor = valor;
    n->cor = VERMELHO;
    n->esq = n->dir = NULL;
    return n;
}

int ehVermelho(No* h) {
    return (h != NULL && h->cor == VERMELHO);
}

void trocaCor(No* h) {
    h->cor = !h->cor;
    if (h->esq) h->esq->cor = !h->esq->cor;
    if (h->dir) h->dir->cor = !h->dir->cor;
}

No* rotacaoEsquerda(No* h) {
    No* x = h->dir;
    h->dir = x->esq;
    x->esq = h;
    x->cor = h->cor;
    h->cor = VERMELHO;
    return x;
}

No* rotacaoDireita(No* h) {
    No* x = h->esq;
    h->esq = x->dir;
    x->dir = h;
    x->cor = h->cor;
    h->cor = VERMELHO;
    return x;
}

No* inserir(No* h, int valor) {
    if (h == NULL) return novoNo(valor);

    if (valor < h->valor) h->esq = inserir(h->esq, valor);
    else if (valor > h->valor) h->dir = inserir(h->dir, valor);

    if (ehVermelho(h->dir) && !ehVermelho(h->esq))
        h = rotacaoEsquerda(h);
    if (ehVermelho(h->esq) && ehVermelho(h->esq->esq))
        h = rotacaoDireita(h);
    if (ehVermelho(h->esq) && ehVermelho(h->dir))
        trocaCor(h);

    return h;
}

No* inserirValor(No* raiz, int valor) {
    raiz = inserir(raiz, valor);
    raiz->cor = PRETO;
    return raiz;
}

void imprimir(No* h, int nivel) {
    if (h == NULL) return;
    imprimir(h->dir, nivel + 1);
    for (int i = 0; i < nivel; i++) printf("   ");
    printf("%d(%s)\n", h->valor, h->cor == VERMELHO ? "R" : "P");
    imprimir(h->esq, nivel + 1);
}

int main() {
    No* raiz = NULL;
    int valores[] = {10, 20, 30, 15, 25, 5, 1};
    int n = sizeof(valores)/sizeof(valores[0]);

    for (int i = 0; i < n; i++) {
        printf("\nInserindo %d...\n", valores[i]);
        raiz = inserirValor(raiz, valores[i]);
        imprimir(raiz, 0);
    }

    return 0;
}
