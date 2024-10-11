#include<stdio.h>
#include<locale.h>

int main(){
    int num, numVetor[10], soma, i = 0, cont = 0;
    setlocale(LC_ALL, "Portuguese");
    for(cont = 0; cont < 10; cont++){
    	printf("Digite um numero: \n");
  		scanf("%d", &num);
  		numVetor[cont] = num;
	}
	for(cont = 0; cont < 10; cont++){
  		if(numVetor[cont] % 2 != 0) {
            soma += numVetor[cont];
            i++;
        }
	}
	soma = soma / i;
	printf("%d", soma);
	return 0;
}

