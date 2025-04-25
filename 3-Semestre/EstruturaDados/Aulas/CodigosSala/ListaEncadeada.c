#include <stdio.h>
#include <stdlib.h>

typedef struct Noh{
	int dado;
	struct Noh * prox;
}Noh;

void inserirInicio(Noh ** primeiro, int valor){
	Noh * novo = (Noh *) calloc(1, sizeof(Noh));
	if(novo == NULL){
		printf("Erro ao alocar mem�ria.");
		return;
	}
	novo->dado = valor;
	novo->prox = *primeiro;
	*primeiro = novo;
}

void inserirFinal(Noh ** primeiro, int valor){
	Noh * novo = (Noh *) calloc(1, sizeof(Noh));
	if(novo == NULL){
		printf("Erro ao alocar mem�ria.");
		return;
	}
	
	novo->dado = valor;
	novo->prox = NULL;
	
	Noh * ultimo = *primeiro;
	while(ultimo->prox != NULL){
		ultimo = ultimo->prox;
	}
	ultimo->prox = novo;
}

void removerInicio(Noh ** primeiro){
	if(*primeiro == NULL){
		printf("Lista vazia.");
		return;
	}
	
	Noh * atual = *primeiro;
	*primeiro = atual->prox;
	free(atual);
	
}

void removerFim(Noh ** primeiro){
	if(*primeiro == NULL){
		printf("Lista vazia.");
		return;
	}
	
	Noh * atual = *primeiro;
	Noh * anterior = NULL;
	
	while(atual->prox != NULL){
		anterior = atual;
		atual = atual->prox;
	}
	
	if(anterior == NULL){
		free(*primeiro);
		*primeiro = NULL;
	}else{
		anterior->prox = NULL;
		free(atual);
	}
}

void exibir(Noh * primeiro){
	if(primeiro == NULL){
		printf("Lista vazia.");
		return;
	}
	
	Noh * aux = primeiro;
	while(aux != NULL){
		printf("%d ", aux->dado);
		aux = aux->prox;
	}
}

int main(){
	//lista
	Noh * lista = NULL;
	
	inserirInicio(&lista, 5);
	inserirInicio(&lista, 10);
	inserirFinal(&lista, 15);
	
	exibir(lista);
	
	removerInicio(&lista);
	printf("\n");
	exibir(lista);
	
	removerFim(&lista);
	printf("\n");
	exibir(lista);
}