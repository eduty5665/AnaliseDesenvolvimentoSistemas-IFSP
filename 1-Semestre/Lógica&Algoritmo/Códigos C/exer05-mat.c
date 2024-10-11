#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, j, soma=0, x[4][4], s[4][4], vet[4];
	printf ("Informe os elementos inteiros da matriz:\n");
	for (i=0 ; i<4 ; i++)
	{
		for (j=0 ; j<4 ; j++)
		{
			printf("Elemento %d %d: ", i+1, j+1);
			scanf ("%d", &x[i][j]);
		}
	}
	for (j=0 ; j<4 ; j++)
	{
		for (i=0 ; i<4 ; i++)
		{
			soma+=x[i][j];
		}
		vet[j]=soma;
		soma=0;
	}
	printf ("Matriz Resultante \n");
	for (i=0 ; i<4 ; i++)
	{
		for (j=0 ; j<4 ; j++)
		{
			s[i][j]=x[i][j]*vet[i];
			printf("%d \t", s[i][j]);
		}
		printf("\n");
	}
	system ("pause");
	return 0;
}		
