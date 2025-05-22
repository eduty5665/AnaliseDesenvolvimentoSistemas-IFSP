int removePoEspecifica (Noh **primeiro, Noh **ultimo, int pos){
	if(pos<0){
	printf(“Posição Inválida”);
return;
}
if(pos == 0){
	if(*primeiro = NULL){
	printf(“Lista Vazia”);
return;
}

Noh *temp = *primeiro;
*primeiro = *primeiro → proximo;

if(*primeiro != NULL){
	(*primeiro) →  anterior = NULL;
} else{
	*ultimo = NULL;
}

free(temp);
}

Noh *atual = *primeiro;

for(int i = 0; atual != NULL && i<pos; i++){
	atual = atual → proximo;
}

if(atual==NULL){
	printf(“Posição além do tamanho da lista”);
return;
}

atual → anterior  → proximo = atual → proximo;

if(atual → proximo == NULL){
	*ultimo = atual → anterior;
} else{
	atual → proximo → anterior = atual → anterior;
}

free(atual);
}
