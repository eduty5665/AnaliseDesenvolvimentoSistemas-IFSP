#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Noh {
    char dado;
    struct Noh *prox;
} Noh;

void push(Noh **topo, char ch){
    Noh *novo = (Noh*) calloc(1, sizeof(Noh));
    if (novo == NULL) {
        printf("Erro ao inserir na pilha.\n");
        return;
    }
    novo->dado = ch;
    novo->prox = *topo;
    *topo = novo;
}

void pop(Noh **topo){
	if (*topo == NULL) {
    	printf("Existe um par�ntese sendo fechado sem um par�ntese anterior abrindo!\n");
        return;
    }

    Noh *atual = *topo;
    *topo = atual->prox;
    free(atual);
}

int main(){
	Noh *pilha=NULL;
	char exp[15];
	
	printf("Insira a express�o matematica:\n");
	scanf("%s", exp);
	
	for (int i=0;i<strlen(exp);i++){
	
		if (exp[i]=='('){
			push(&pilha,exp[i]);
		}
		else if (exp[i]==')'){
			pop(&pilha);
		}
	}
	
	if (pilha == NULL)
		printf("A quantidade de parent�nses na express�o est� equilibrada.\n");
	else
		printf("Existem par�nteses n�o fechados na express�o.\n");
		
	while (pilha != NULL){
		pop(&pilha);
	}	
	
	return 0;
}
