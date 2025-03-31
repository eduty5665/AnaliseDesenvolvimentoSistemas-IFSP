/*
1.     Implemente uma função que receba um vetor de inteiros e seu tamanho e retorne o maior elemento presente no vetor. Utilize passagem de parâmetro por referência.
·       A função deve percorrer o vetor uma única vez.
·       O vetor deve ser preenchido pelo usuário.
·       Exiba o maior valor encontrado.
Exemplo:
Entrada: [4, 9, 2, 6, 3]
Saída: Maior elemento: 9
*/

int verificaMaior(int vetor[],int tamanho){
	int i, maior=0;
	for (i=0; i<tamanho; i++){
		if(vetor[i]>maior){
			maior=vetor[i];
		}
		else{
		}
	}		
	return maior;
}

int main(){
	int i, tamanho;
	
	printf("Insira o tamanho do vetor:");
	scanf("%d", &tamanho);
	int *vetor=(int*)calloc(tamanho, sizeof(int));
	for (i=0;i<tamanho;i++){
		printf("Insira o %d elemento do vetor:", (i+1));
		scanf("%d", &vetor[i]);
	}
	printf("O maior elemento do vetor é: %d", verificaMaior(vetor, tamanho));
	
	return 0;
}
