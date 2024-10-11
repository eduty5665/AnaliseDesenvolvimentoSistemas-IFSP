#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, j, cont, soma=0, x[5][3], vet[5];
	printf ("Informe os elementos inteiros da matriz:\n");
	for (i=0 ; i<5 ; i++)
	{
		for (j=0 ; j<3 ; j++)
		{
			printf("Elemento %d %d: ", i+1, j+1);
			scanf ("%d", &x[i][j]);
			soma+= x[i][j];
		}
		vet[i] = soma;
		soma=0;
	}
	for (i=0 ; i<5 ; i++)
	{
        printf ("A somatoria da %d linha eh: %d \n", i+1, vet[i]);
	}
	system ("pause");
	return 0;
}		
