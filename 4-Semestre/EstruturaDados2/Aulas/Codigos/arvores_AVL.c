#include <stdio.h>
#include <stdlib.h>

// --------------------------------------
// ESTRUTURA DO NÓ DA ÁRVORE AVL
// --------------------------------------
typedef struct No {
    int chave;
    struct No *esquerda;
    struct No *direita;
    int altura;
} No;

// --------------------------------------
// FUNÇÕES AUXILIARES
// --------------------------------------
int maximo(int a, int b) {
    return (a > b) ? a : b;
}

int obterAltura(No *n) {
    if (n == NULL) return 0;
    return n->altura;
}

int fatorBalanceamento(No *n) {
    if (n == NULL) return 0;
    return obterAltura(n->esquerda) - obterAltura(n->direita);
}

// --------------------------------------
// FUNÇÕES DE ROTAÇÃO
// --------------------------------------
No* rotacaoDireita(No *y) {
    No *x = y->esquerda;
    No *T2 = x->direita;

    x->direita = y;
    y->esquerda = T2;

    y->altura = maximo(obterAltura(y->esquerda), obterAltura(y->direita)) + 1;
    x->altura = maximo(obterAltura(x->esquerda), obterAltura(x->direita)) + 1;

    printf("→ Rotação simples à direita (LL) em %d\n", y->chave);
    return x;
}

No* rotacaoEsquerda(No *x) {
    No *y = x->direita;
    No *T2 = y->esquerda;

    y->esquerda = x;
    x->direita = T2;

    x->altura = maximo(obterAltura(x->esquerda), obterAltura(x->direita)) + 1;
    y->altura = maximo(obterAltura(y->esquerda), obterAltura(y->direita)) + 1;

    printf("→ Rotação simples à esquerda (RR) em %d\n", x->chave);
    return y;
}

// --------------------------------------
// CRIAÇÃO DE NOVO NÓ
// --------------------------------------
No* novoNo(int chave) {
    No* no = (No*) malloc(sizeof(No));
    no->chave = chave;
    no->esquerda = no->direita = NULL;
    no->altura = 1;
    return no;
}

// --------------------------------------
// INSERÇÃO NA ÁRVORE AVL
// --------------------------------------
No* inserir(No* no, int chave) {
    if (no == NULL)
        return novoNo(chave);

    if (chave < no->chave)
        no->esquerda = inserir(no->esquerda, chave);
    else if (chave > no->chave)
        no->direita = inserir(no->direita, chave);
    else
        return no;

    no->altura = 1 + maximo(obterAltura(no->esquerda), obterAltura(no->direita));

    int fb = fatorBalanceamento(no);

    // Casos de rotação
    if (fb > 1 && chave < no->esquerda->chave)
        return rotacaoDireita(no);

    if (fb < -1 && chave > no->direita->chave)
        return rotacaoEsquerda(no);

    if (fb > 1 && chave > no->esquerda->chave) {
        printf("→ Rotação dupla (LR) em %d\n", no->chave);
        no->esquerda = rotacaoEsquerda(no->esquerda);
        return rotacaoDireita(no);
    }

    if (fb < -1 && chave < no->direita->chave) {
        printf("→ Rotação dupla (RL) em %d\n", no->chave);
        no->direita = rotacaoDireita(no->direita);
        return rotacaoEsquerda(no);
    }

    return no;
}

// --------------------------------------
// ENCONTRA O MENOR VALOR (para remoção)
// --------------------------------------
No* menorNo(No* no) {
    No* atual = no;
    while (atual->esquerda != NULL)
        atual = atual->esquerda;
    return atual;
}

// --------------------------------------
// REMOÇÃO NA ÁRVORE AVL
// --------------------------------------
No* remover(No* raiz, int chave) {
    if (raiz == NULL)
        return raiz;

    if (chave < raiz->chave)
        raiz->esquerda = remover(raiz->esquerda, chave);
    else if (chave > raiz->chave)
        raiz->direita = remover(raiz->direita, chave);
    else {
        if ((raiz->esquerda == NULL) || (raiz->direita == NULL)) {
            No *temp = raiz->esquerda ? raiz->esquerda : raiz->direita;
            if (temp == NULL) {
                temp = raiz;
                raiz = NULL;
            } else
                *raiz = *temp;
            free(temp);
        } else {
            No* temp = menorNo(raiz->direita);
            raiz->chave = temp->chave;
            raiz->direita = remover(raiz->direita, temp->chave);
        }
    }

    if (raiz == NULL)
        return raiz;

    raiz->altura = 1 + maximo(obterAltura(raiz->esquerda), obterAltura(raiz->direita));
    int fb = fatorBalanceamento(raiz);

    if (fb > 1 && fatorBalanceamento(raiz->esquerda) >= 0) {
        printf("→ Rotação simples à direita (LL) em %d (remoção)\n", raiz->chave);
        return rotacaoDireita(raiz);
    }

    if (fb > 1 && fatorBalanceamento(raiz->esquerda) < 0) {
        printf("→ Rotação dupla (LR) em %d (remoção)\n", raiz->chave);
        raiz->esquerda = rotacaoEsquerda(raiz->esquerda);
        return rotacaoDireita(raiz);
    }

    if (fb < -1 && fatorBalanceamento(raiz->direita) <= 0) {
        printf("→ Rotação simples à esquerda (RR) em %d (remoção)\n", raiz->chave);
        return rotacaoEsquerda(raiz);
    }

    if (fb < -1 && fatorBalanceamento(raiz->direita) > 0) {
        printf("→ Rotação dupla (RL) em %d (remoção)\n", raiz->chave);
        raiz->direita = rotacaoDireita(raiz->direita);
        return rotacaoEsquerda(raiz);
    }

    // Nenhuma rotação necessária
    if (fb >= -1 && fb <= 1) {
        printf("✓ Nenhuma rotação necessária após remoção em %d\n", raiz->chave);
    }

    return raiz;
}

// --------------------------------------
// PERCURSOS
// --------------------------------------
void preOrdem(No *raiz) {
    if (raiz != NULL) {
        printf("%d ", raiz->chave);
        preOrdem(raiz->esquerda);
        preOrdem(raiz->direita);
    }
}

void emOrdem(No *raiz) {
    if (raiz != NULL) {
        emOrdem(raiz->esquerda);
        printf("%d ", raiz->chave);
        emOrdem(raiz->direita);
    }
}

// --------------------------------------
// VISUALIZAÇÃO DA ÁRVORE (por parênteses)
// --------------------------------------
void exibirArvore(No *raiz) {
    if (raiz == NULL) {
        printf("()");
        return;
    }
    printf("(");
    printf("%d", raiz->chave);
    if (raiz->esquerda != NULL || raiz->direita != NULL) {
        printf(" ");
        exibirArvore(raiz->esquerda);
        printf(" ");
        exibirArvore(raiz->direita);
    }
    printf(")");
}

// --------------------------------------
// MENU 
// --------------------------------------
int main() {
    No *raiz = NULL;
    int opcao, valor;

    do {
        printf("\n==== MENU ÁRVORE AVL ====\n");
        printf("1. Inserir elemento\n");
        printf("2. Remover elemento\n");
        printf("3. Percorrer em ordem\n");
        printf("4. Visualizar árvore\n");
        printf("0. Sair\n");
        printf("Escolha uma opção: ");
        scanf("%d", &opcao);

        switch (opcao) {
            case 1:
                printf("Digite o valor a inserir: ");
                scanf("%d", &valor);
                raiz = inserir(raiz, valor);
                break;
            case 2:
                printf("Digite o valor a remover: ");
                scanf("%d", &valor);
                raiz = remover(raiz, valor);
                break;
            case 3:
                printf("\nPercurso em ordem: ");
                emOrdem(raiz);
                printf("\n");
                break;
            case 4:
                printf("\nVisualização da árvore: ");
                exibirArvore(raiz);
                printf("\n");
                break;
            case 0:
                printf("Encerrando o programa...\n");
                break;
            default:
                printf("Opção inválida!\n");
        }
    } while (opcao != 0);

    return 0;
}