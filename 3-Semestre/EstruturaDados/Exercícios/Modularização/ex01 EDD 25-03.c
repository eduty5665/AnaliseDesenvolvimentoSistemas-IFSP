/*
1.     Implemente uma fun��o que receba um vetor de inteiros e seu tamanho e retorne o maior elemento presente no vetor. Utilize passagem de par�metro por refer�ncia.
�       A fun��o deve percorrer o vetor uma �nica vez.
�       O vetor deve ser preenchido pelo usu�rio.
�       Exiba o maior valor encontrado.
Exemplo:
Entrada: [4, 9, 2, 6, 3]
Sa�da: Maior elemento: 9
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
	printf("O maior elemento do vetor �: %d", verificaMaior(vetor, tamanho));
	
	return 0;
}
