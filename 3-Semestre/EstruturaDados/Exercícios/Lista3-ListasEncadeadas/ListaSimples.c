int removerElemento(Noh **inicio, int posicao){
	if(*inicio == NULL || posicao < 0){
		printf(“Posição inválida ou lista vazia”);
}

Noh *atual = *inicio;

if(posicao == 0){
	*inicio = atual → prox;
	free(atual);
	return;
}

Noh *anterior = NULL;
for(i=0; atual != NULL && i < posicao; i++){
	anterior = atual;
	atual = atual → prox;
}

anterior → prox = atual → prox;
free(atual);
}
