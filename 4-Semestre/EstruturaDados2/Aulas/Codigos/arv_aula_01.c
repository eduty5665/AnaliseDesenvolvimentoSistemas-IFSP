#include <stdio.h>
#include <stdlib.h>

typedef struct  {
    int valor;
    struct No* esquerda;
    struct No* direita;
} No;


No * novoNo(int valor) {
    No * no = (No *) malloc(sizeof(No));
    no->valor = valor;
    no->esquerda = NULL;
    no->direita = NULL;
    return no;
}   

No * inserir(No * raiz, int valor) {
    if (raiz == NULL) {
        return novoNo(valor);
    }
    if (valor < raiz->valor) {
        raiz->esquerda = inserir(raiz->esquerda, valor);
    } else if (valor > raiz->valor) {
        raiz->direita = inserir(raiz->direita, valor);
    }
    return raiz;
}

void percorrer(No * raiz) {
    if (raiz != NULL) {
        percorrer(raiz->esquerda);
        printf("%d ", raiz->valor);
        percorrer(raiz->direita);
        
    }
}

No* inserirDebug(No* raiz, int valor, int nivel) {
    // Identação para visualizar nível
    for (int i = 0; i < nivel; i++) printf("  ");
    printf("Inserir(%d) chamado\n", valor);

    if (raiz == NULL) {
        for (int i = 0; i < nivel; i++) printf("  ");
        printf("-> Criando nó %d\n", valor);
        return novoNo(valor);
    }

    if (valor < raiz->valor) {
        for (int i = 0; i < nivel; i++) printf("  ");
        printf("%d < %d → esquerda\n", valor, raiz->valor);
        raiz->esquerda = inserirDebug(raiz->esquerda, valor, nivel+1);
    } else if (valor > raiz->valor) {
        for (int i = 0; i < nivel; i++) printf("  ");
        printf("%d > %d → direita\n", valor, raiz->valor);
        raiz->direita = inserirDebug(raiz->direita, valor, nivel+1);
    }

    for (int i = 0; i < nivel; i++) printf("  ");
    printf("Retornando nó %d\n", raiz->valor);
    return raiz;
}

void percorrerDebug(No* raiz, int nivel) {
    if (raiz != NULL) {
        for (int i = 0; i < nivel; i++) printf("  ");
        printf("Entrando em nó %d\n", raiz->valor);

        percorrerDebug(raiz->esquerda, nivel+1);

        for (int i = 0; i < nivel; i++) printf("  ");
        printf("Visitando nó %d\n", raiz->valor);

        percorrerDebug(raiz->direita, nivel+1);

        for (int i = 0; i < nivel; i++) printf("  ");
        printf("Saindo de nó %d\n", raiz->valor);
    }
}

int main() {
    No * raiz = NULL;

    int valores[] = {5, -1, 7, 2};
    
    int n = sizeof(valores)/sizeof(valores[0]);

    /*for (int i = 0; i < n; i++) {
        raiz = inserir(raiz, valores[i]);
    }


    printf("Percorrer: ");
    percorrer(raiz);
    printf("\n");*/

    printf("=== Inserção com debug ===\n");
    for (int i = 0; i < n; i++) {
        raiz = inserirDebug(raiz, valores[i], 0);
    }

    printf("\n=== Percurso com debug ===\n");
    percorrerDebug(raiz, 0);

    return 0;
}