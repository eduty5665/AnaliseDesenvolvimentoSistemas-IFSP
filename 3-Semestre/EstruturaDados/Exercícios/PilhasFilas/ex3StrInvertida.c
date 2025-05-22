#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 100

// Nó da pilha
typedef struct Noh {
    char caractere;
    struct Noh *prox;
} Noh;

// Função push: insere caractere no topo da pilha
void push(Noh **topo, char c) {
    Noh *novo = (Noh *) malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de alocação!\n");
        return;
    }
    novo->caractere = c;
    novo->prox = *topo;
    *topo = novo;
}

// Função pop: remove e retorna o caractere do topo da pilha
char pop(Noh **topo) {
    if (*topo == NULL) {
        return '\0';  // pilha vazia
    }
    Noh *temp = *topo;
    char c = temp->caractere;
    *topo = temp->prox;
    free(temp);
    return c;
}

int main() {
    char original[MAX];
    char invertida[MAX];
    Noh *pilha = NULL;

    printf("Digite uma string (até 100 caracteres):\n");
    fgets(original, MAX, stdin);
    original[strcspn(original, "\n")] = '\0'; // remove \n

    // Empilhar cada caractere da string
    for (int i = 0; original[i] != '\0'; i++) {
        push(&pilha, original[i]);
    }

    // Desempilhar e formar a string invertida
    int i = 0;
    char c;
    while ((c = pop(&pilha)) != '\0') {
        invertida[i++] = c;
    }

    printf("String original : %s\n", original);
    printf("String invertida: %s\n", invertida);

    return 0;
}
