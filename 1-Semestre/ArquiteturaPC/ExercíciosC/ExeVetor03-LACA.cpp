#include<stdio.h>
#include<locale.h>

int main(){
    int num, numVetor[10], maior, menor, cont = 0;
    setlocale(LC_ALL, "Portuguese");
    for(cont = 0; cont < 10; cont++){
    	printf("Digite um numero: \n");
  		scanf("%d", &num);
  		numVetor[cont] = num;
  		maior = num;
  		menor = num;
	}
	for(cont = 0; cont < 10; cont++){
  		if(numVetor[cont] > maior) {
            maior = numVetor[cont];
        } else {
            if(numVetor[cont] < menor) {
                menor = numVetor[cont];
            }
        }
	}
	printf("O maior é: %d\n", maior);
	printf("O menor é: %d", menor);
	return 0;
}
