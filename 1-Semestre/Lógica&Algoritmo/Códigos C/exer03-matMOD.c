#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, j, cont, soma=0, x[5][3], vet[4];
	printf ("Informe os elementos inteiros da matriz:\n");
	for (i=0 ; i<4 ; i++)
	{
		for (j=0 ; j<3 ; j++)
		{
			printf("Elemento %d %d: ", i+1, j+1);
			scanf ("%d", &x[i][j]);
			if(10 <= x[i][j] && x[i][j] <= 20){
				cont+=1;
			}
		}
		vet[i] = cont;
		cont=0;
	}
	for (i=0 ; i<4 ; i++)
	{
        printf ("Existem %d numeros entre 10 e 20 na linha %d \n", vet[i], i+1);
	}
	system ("pause");
	return 0;
}		
