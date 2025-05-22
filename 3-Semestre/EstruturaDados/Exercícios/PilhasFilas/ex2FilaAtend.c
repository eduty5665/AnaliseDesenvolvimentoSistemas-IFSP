#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Cliente {
    char nome[50];
    int pass;
    struct Cliente *prox;
} Cliente;

void inserirCliente(Cliente **inicio, char nomeCliente[], int senha,int *tam) {
	if (*tam >= 50) {
        printf("Fila cheia! N�o � poss�vel adicionar mais clientes.\n");
        return;
    }
	
    Cliente *novo = (Cliente*) calloc(1, sizeof(Cliente));
    if (novo == NULL) {
        printf("Erro ao inserir cliente na fila.\n");
        return;
    }
    strcpy(novo->nome,nomeCliente);
    novo->pass = senha;
    novo->prox = NULL;

    if (*inicio == NULL) {
        *inicio = novo;
        printf("Cliente %s entrou na fila, com a senha %d.\n", nomeCliente, senha);
        (*tam)++;
        return;
    }

    Cliente *fim = *inicio;
    while (fim->prox != NULL) {
        fim = fim->prox;
    }
    fim->prox = novo;
    (*tam)++;
    printf("Cliente %s entrou na fila, com a senha %d.\n", nomeCliente, senha);
}

void atenderCliente(Cliente **inicio, int *tam) {
    if (*inicio == NULL) {
        printf("N�o existe cliente a ser atendido!\n");
        return;
    }
    Cliente *atual = *inicio;
    printf("Atendendo cliente:%s, (Senha:%d)\n", atual->nome, atual->pass);
    *inicio = atual->prox;
    free(atual);
    (*tam)--;
}

void exibirFila(Cliente *inicio) {
	printf("Fila:\n");
	
    if (inicio == NULL) {
        printf("N�o h� clientes na fila!\n");
        return;
    }

    Cliente *aux = inicio;
    while (aux != NULL) {
        printf("Cliente:%s\tSenha: %d\n", aux->nome, aux->pass);
        aux = aux->prox;
    }
}

int main(){
	int senha=1, opc, tam=0;
	char nomeCliente[50];
	Cliente *lista = NULL;

do{
	printf("\nDigite a op��o desejada:\n1. Adicionar cliente.\n2. Atender cliente.\n3. Listar fila de clientes.\n\n0. Sair.\n\n");
	scanf("%d", &opc);
	switch (opc){
	    case 1:	
		    printf("Insira o nome do cliente:");
		    scanf("%s", nomeCliente);
		    inserirCliente(&lista, nomeCliente, senha++, &tam);
	    	break;
	    case 2:
		    atenderCliente(&lista, &tam);
		    break;
	    case 3:
	    	exibirFila(lista);
	    	break;
	    case 0:
	    	printf("Saindo...");
	    	break;
	    default:
	    	printf("N�mero invalido.");
	    	break;
	};
	}while (opc!=0);
	
	while (lista != NULL) {
    	Cliente *temp = lista;
        lista = lista->prox;
        free(temp);
    }

	return 0;
}
