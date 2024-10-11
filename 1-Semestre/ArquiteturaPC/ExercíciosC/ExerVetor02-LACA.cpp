#include<stdio.h>
#include<locale.h>

int main(){
    int num, numVetor[10], soma;
    setlocale(LC_ALL, "Portuguese");
    for(int cont = 0; cont < 10; cont++){
    	printf("Digite um numero: \n");
  		scanf("%d", &num);
  		numVetor[cont] = num;
	}
	for(int cont = 0; cont < 10; cont++){
  		soma += numVetor[cont];
	}
	printf("%d", soma);
	return 0;
}
