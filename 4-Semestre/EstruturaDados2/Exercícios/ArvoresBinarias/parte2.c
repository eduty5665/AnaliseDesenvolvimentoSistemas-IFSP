#include <stdio.h>
#include <stdlib.h>

// Estrutura do nó
typedef struct No {
    int valor;
    struct No* esq;
    struct No* dir;
} No;

// Cria um novo nó
No* novoNo(int valor) {
    No* no = (No*) malloc(sizeof(No));
    no->valor = valor;
    no->esq = NULL;
    no->dir = NULL;
    return no;
}

// Inserção recursiva
No* inserir(No* raiz, int valor) {
    if (raiz == NULL) return novoNo(valor);

    if (valor < raiz->valor)
        raiz->esq = inserir(raiz->esq, valor);
    else if (valor > raiz->valor)
        raiz->dir = inserir(raiz->dir, valor);

    return raiz;
}

// Menor valor da subárvore (usado na remoção com dois filhos)
No* encontrarMinimo(No* raiz) {
    while (raiz->esq != NULL)
        raiz = raiz->esq;
    return raiz;
}


No* remover(No* raiz, int valor) {
    if (raiz == NULL) return NULL;

    if (valor < raiz->valor) {
        raiz->esq = remover(raiz->esq, valor);
    } else if (valor > raiz->valor) {
        raiz->dir = remover(raiz->dir, valor);
    } else {
        
        if (raiz->esq == NULL && raiz->dir == NULL) {
            free(raiz);
            return NULL;
        }
       
        else if (raiz->esq == NULL) {
            No* temp = raiz->dir;
            free(raiz);
            return temp;
        } else if (raiz->dir == NULL) {
            No* temp = raiz->esq;
            free(raiz);
            return temp;
        }
        
        else {
            No* sucessor = encontrarMinimo(raiz->dir);
            raiz->valor = sucessor->valor;
            raiz->dir = remover(raiz->dir, sucessor->valor);
        }
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


int main() {
    No* raiz = NULL;

  
    int elementos[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) {
        raiz = inserir(raiz, elementos[i]);
    }

    printf("Percurso Pre-Ordem: ");
    preOrdem(raiz);
    printf("\n");

    printf("Percurso Em-Ordem: ");
    emOrdem(raiz);
    printf("\n");

    printf("Percurso Pos-Ordem: ");
    posOrdem(raiz);
    printf("\n");

    printf("Representacao com parenteses: ");
    exibirParenteses(raiz);
    printf("\n");

  
    int removiveis[] = {20, 30, 50};
    for (int i = 0; i < 3; i++) {
        printf("\nRemovendo %d\n", removiveis[i]);
        raiz = remover(raiz, removiveis[i]);

        printf("Em-Ordem: ");
        emOrdem(raiz);
        printf("\n");

        printf("Parenteses: ");
        exibirParenteses(raiz);
        printf("\n");
    }

    return 0;
}
