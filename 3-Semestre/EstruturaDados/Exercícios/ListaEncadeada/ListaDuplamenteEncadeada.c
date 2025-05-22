#include <stdio.h>
#include <stdlib.h>
#include <locale.h>

typedef struct Noh{
	int dado;
	struct Noh * anterior;
	struct Noh * proximo;

}Noh;


void incluir_inicio(Noh **primeiro, Noh **ultimo, int valor) {
    Noh *novo = (Noh *)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de alocação\n");
        return;
    }
    novo->dado = valor;
    novo->anterior = NULL;
    novo->proximo = *primeiro;

    if (*primeiro == NULL) {
        *ultimo = novo;
    } else {
        (*primeiro)->anterior = novo;
    }
    *primeiro = novo;
}

void incluir_fim(Noh **primeiro, Noh **ultimo, int valor) {
    Noh *novo = (Noh *)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de alocação\n");
        return;
    }
    novo->dado = valor;
    novo->proximo = NULL;
    novo->anterior = *ultimo;

    if (*ultimo == NULL) { // Lista vazia
        *primeiro = novo;
    } else {
        (*ultimo)->proximo = novo;
    }
    *ultimo = novo;
}

void remover_inicio(Noh **primeiro, Noh **ultimo) {
    if (*primeiro == NULL) {
        printf("Lista vazia\n");
        return;
    }
    Noh *temp = *primeiro;
    *primeiro = (*primeiro)->proximo;
    if (*primeiro != NULL) {
        (*primeiro)->anterior = NULL;
    } else { // A lista ficou vazia
        *ultimo = NULL;
    }
    free(temp);
}

void remover_fim(Noh **primeiro, Noh **ultimo) {
    if (*ultimo == NULL) {
        printf("Lista vazia\n");
        return;
    }
    Noh *temp = *ultimo;
    *ultimo = (*ultimo)->anterior;
    if (*ultimo != NULL) {
        (*ultimo)->proximo = NULL;
    } else { // A lista ficou vazia
        *primeiro = NULL;
    }
    free(temp);
}

void incluir_meio(Noh **primeiro, Noh **ultimo, int valor, int posicao) {

    if (posicao < 0) {
        printf("Posição inválida\n");
        return;
    }

    if (posicao == 0) {
        incluir_inicio(primeiro, ultimo, valor);
        return;
    }

    Noh *atual = *primeiro;
    int i = 0;

    while (atual != NULL && i < posicao - 1) {
        atual = atual->proximo;
        i++;
    }

    if (atual == NULL) {
        printf("Posição além do tamanho da lista\n");
        return;
    }

    Noh *novo = (Noh *)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de alocação\n");
        return;
    }
    novo->dado = valor;

    novo->proximo = atual->proximo;
    novo->anterior = atual;

    if (atual->proximo != NULL) {
        atual->proximo->anterior = novo;
    } else {
        *ultimo = novo;
    }
    atual->proximo = novo;
}

void percorrer(Noh *primeiro) {
    Noh *atual = primeiro;
    printf("Lista: ");
    while (atual != NULL) {
        printf("%d ", atual->dado);
        atual = atual->proximo;
    }
    printf("\n");
}

/*
Desenvolver uma aplica��o em linguagem C que implemente uma lista duplamente encadeada, permitindo a realiza��o de opera��es b�sicas como inser��o, remo��o, exibi��o e navega��o reversa na lista. O exerc�cio visa fortalecer o entendimento de ponteiros, aloca��o din�mica e estrutura de dados.

Implemente uma lista duplamente encadeada com as seguintes funcionalidades:

Criar uma nova lista.

Inserir um elemento:

No in�cio.

No final.

Em uma posi��o espec�fica.

Remover um elemento:

Do in�cio.

Do final.

De uma posi��o espec�fica.

Exibir os elementos:

Do in�cio para o fim.

Do fim para o in�cio.

Esvaziar a lista (remover todos os elementos).

Encerrar o programa.

Dicas:

Cada opera��o (inser��o, remo��o, exibi��o, etc.) deve ser implementada em uma fun��o separada.

A manipula��o da lista deve ser feita com aloca��o din�mica usando malloc ou calloc e free.

O programa deve conter um menu interativo para o usu�rio escolher as op��es.

Utilize como base o arquivo com o c�digo apresentado em aula 

===== MENU LISTA DUPLAMENTE ENCADEADA =====

1. Criar nova lista

2. Inserir no in�cio

3. Inserir no fim

4. Inserir em posi��o espec�fica

5. Remover do in�cio

6. Remover do fim

7. Remover de posi��o espec�fica

8. Exibir lista do in�cio ao fim

9. Exibir lista do fim ao in�cio

10. Esvaziar lista

0. Sair

Escolha uma op��o:
*/


void criarLista(Noh **primeiro, Noh **ultimo) {
    *primeiro = NULL;
    *ultimo = NULL;
    printf("Lista criada com sucesso.\n");
}

void inserirInicio(Noh **primeiro, Noh **ultimo, int valor) {
    Noh *novo = (Noh *)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de aloca��o\n");
        return;
    }
    novo->dado = valor;
    novo->anterior = NULL;
    novo->proximo = *primeiro;

    if (*primeiro == NULL) {
        *ultimo = novo;
    } else {
        (*primeiro)->anterior = novo;
    }
    *primeiro = novo;
}

void inserirFim(Noh **primeiro, Noh **ultimo, int valor) {
    Noh *novo = (Noh *)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de aloca��o\n");
        return;
    }
    novo->dado = valor;
    novo->proximo = NULL;
    novo->anterior = *ultimo;

    if (*ultimo == NULL) { // Lista vazia
        *primeiro = novo;
    } else {
        (*ultimo)->proximo = novo;
    }
    *ultimo = novo;
}

void incluirMeio(Noh **primeiro, Noh **ultimo, int valor, int posicao) {

    if (posicao < 0) {
        printf("Posi��o inv�lida\n");
        return;
    }

    if (posicao == 0) {
        inserirInicio(primeiro, ultimo, valor);
        return;
    }

    Noh *atual = *primeiro;
    int i = 0;

    while (atual != NULL && i < posicao - 1) {
        atual = atual->proximo;
        i++;
    }

	if (atual != NULL && atual->proximo == NULL) {
    	inserirFim(primeiro, ultimo, valor);
    }

    if (atual == NULL) {
        printf("Posi��o al�m do tamanho da lista\n");
        return;
    }

    Noh *novo = (Noh *)malloc(sizeof(Noh));
    if (novo == NULL) {
        printf("Erro de aloca��o\n");
        return;
    }
    novo->dado = valor;

    novo->proximo = atual->proximo;
    novo->anterior = atual;

    if (atual->proximo != NULL) {
        atual->proximo->anterior = novo;
    } else {
        *ultimo = novo;
    }
    atual->proximo = novo;
}

void removerInicio(Noh **primeiro, Noh **ultimo) {
    if (*primeiro == NULL) {
        printf("Lista vazia\n");
        return;
    }
    Noh *temp = *primeiro;
    *primeiro = (*primeiro)->proximo;
    if (*primeiro != NULL) {
        (*primeiro)->anterior = NULL;
    } else {
        *ultimo = NULL;
    }
    free(temp);
}

void removerFim(Noh **primeiro, Noh **ultimo) {
    if (*ultimo == NULL) {
        printf("Lista vazia\n");
        return;
    }
    Noh *temp = *ultimo;
    *ultimo = (*ultimo)->anterior;
    if (*ultimo != NULL) {
        (*ultimo)->proximo = NULL;
    } else {
        *primeiro = NULL;
    }
    free(temp);
}

void removerMeio(Noh **primeiro, Noh **ultimo, int posicao) {
	
	if (posicao < 0) {
        printf("Posi��o inv�lida\n");
        return;
    }
    
    if (posicao == 0) {
    	removerInicio(primeiro, ultimo);
    	return;
    }
    
    Noh *atual = *primeiro;
    int i = 0;

    while (atual != NULL && i < posicao - 1) {
        atual = atual->proximo;
        i++;
    }
    
    if (atual != NULL && atual->proximo == NULL) {
    	removerFim(primeiro, ultimo);
    }

    if (atual == NULL) {
        printf("Posi��o al�m do tamanho da lista\n");
        return;
    }
    
    if (atual->anterior != NULL) {
        atual->anterior->proximo = atual->proximo;
    }
    if (atual->proximo != NULL) {
        atual->proximo->anterior = atual->anterior;
    }
    free(atual); 
}

void percorrerInicio(Noh *primeiro) {
    Noh *atual = primeiro;
    printf("Lista: ");
    while (atual != NULL) {
        printf("%d ", atual->dado);
        atual = atual->proximo;
    }
    printf("\n");
}

void percorrerFim(Noh *ultimo) {
    Noh *atual = ultimo;
    printf("Lista em ordem contr�ria: ");
    while (atual != NULL) {
        printf("%d ", atual->dado);
        atual = atual->anterior;
    }
    printf("\n");
}

void esvaziarLista(Noh **primeiro, Noh **ultimo) {
    Noh *atual = *primeiro;
    while (atual != NULL) {
        Noh *temp = atual;
        atual = atual->proximo;
        free(temp);
    }
    *primeiro = NULL;
    *ultimo = NULL;
    printf("Lista esvaziada.\n");
}

/*
int main() {
    Noh *primeiro = NULL;
    Noh *ultimo = NULL;

    incluir_inicio(&primeiro, &ultimo, 10);
    incluir_fim(&primeiro, &ultimo, 20);
    incluir_fim(&primeiro, &ultimo, 5);
    percorrer(primeiro);

    incluir_meio(&primeiro,&ultimo, 15, 2); // inserir 15 depois do 10
    percorrer(primeiro);

    remover_inicio(&primeiro, &ultimo);
    percorrer(primeiro);

    remover_fim(&primeiro, &ultimo);
    percorrer(primeiro);

    return 0;
}
*/

int main() {

	setlocale(LC_ALL, "Portuguese");
	
	Noh *primeiro;
	Noh *ultimo;
	int valor, pos, opcao;
    do {
        printf("\n===== MENU LISTA DUPLAMENTE ENCADEADA =====\n");
        printf("1. Criar nova lista\n");
        printf("2. Inserir no in�cio\n");
        printf("3. Inserir no fim\n");
        printf("4. Inserir em posi��o espec�fica\n");
        printf("5. Remover do in�cio\n");
        printf("6. Remover do fim\n");
        printf("7. Remover de posi��o espec�fica\n");
        printf("8. Exibir lista do in�cio ao fim\n");
        printf("9. Exibir lista do fim ao in�cio\n");
        printf("10. Esvaziar lista\n");
        printf("0. Sair\n");
        printf("Escolha uma op��o: ");
        scanf("%d", &opcao);

        switch (opcao) {
            case 1:
                criarLista(&primeiro, &ultimo);
                break;
            case 2:
                printf("Digite o valor a inserir: ");
                scanf("%d", &valor);
                inserirInicio(&primeiro, &ultimo, valor);
                break;
            case 3:
                printf("Digite o valor a inserir: ");
                scanf("%d", &valor);
                inserirFim(&primeiro, &ultimo, valor);
                break;
            case 4:
                printf("Digite o valor e a posi��o: ");
                scanf("%d %d", &valor, &pos);
                incluirMeio(&primeiro, &ultimo, valor, pos);
                break;
            case 5:
                removerInicio(&primeiro, &ultimo);
                break;
            case 6:
                removerFim(&primeiro, &ultimo);
                break;
            case 7:
                printf("Digite a posi��o a remover: ");
                scanf("%d", &pos);
                removerMeio(&primeiro, &ultimo, pos);
                break;
            case 8:
                percorrerInicio(primeiro);
                break;
            case 9:
                percorrerFim(ultimo);
                break;
            case 10:
                esvaziarLista(&primeiro, &ultimo);
                break;
            case 0:
                esvaziarLista(&primeiro, &ultimo);
                printf("Programa encerrado.\n");
                break;
            default:
                printf("Op��o inv�lida!\n");
        }

    } while (opcao != 0);

    return 0;
}

