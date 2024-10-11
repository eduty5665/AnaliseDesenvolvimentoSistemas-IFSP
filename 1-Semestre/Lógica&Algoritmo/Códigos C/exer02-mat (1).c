#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, 	cont=0, j, x[3][4];
	printf ("Informe os elementos inteiros da matriz:\n");
	for (i=0 ; i<3 ; i++)
	{
		for (j=0 ; j<4 ; j++)
		{
			printf("Elemento %d %d: ", i, j);
			scanf ("%d", &x[i][j]);
			if(15 <= x[i][j] && x[i][j] <= 20 ){
				cont+=1;
			}
		}
	}
	printf ("%d numeros estao entre 15 e 20.", cont);
	system ("pause");
	return 0;
}		
