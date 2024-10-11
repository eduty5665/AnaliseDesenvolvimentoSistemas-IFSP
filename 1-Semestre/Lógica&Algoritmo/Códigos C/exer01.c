#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i = 0, qtdpar = 0, qtdimpar = 0, par[10], impar[10], vet[10];
    printf ("Informe 10 elementos inteiros:\n");
	for (i=0 ; i<10 ; i++)
	{
		printf("Elemento %d: \n", i+1);
		scanf ("%d", &vet[i]);
		if(vet[i] % 2 == 0){
                  par[qtdpar] = vet[i];
                  qtdpar+=1;
        }else{
              impar[qtdimpar] = vet[i];
              qtdimpar+=1;
              }    
	}
    printf ("%d ", qtdpar);
    printf("Pares: ");
    for (i=0 ; i<qtdpar ; i++)
	{
		printf("%d ", par[i]);
	}
	printf ("\n");
    printf ("%d ", qtdimpar);
    printf("Impares: ");
    for (i=0 ; i<qtdimpar ; i++)
	{
		printf("%d ", impar[i]);
	}
	system ("pause");
	return 0;
}
