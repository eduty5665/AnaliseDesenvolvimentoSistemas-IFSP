#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, j, contpar=0, x[4][3];
	printf ("Informe os elementos inteiros da matriz:\n");
	for (i=0 ; i<4 ; i++)
	{
		for (j=0 ; j<3 ; j++)
		{
			printf("Elemento %d %d: ", i, j);
			scanf ("%d", &x[i][j]);
			if(x[i][j] % 2 == 0){
				contpar+=1;
			}
		}
	}
	printf ("%d sao pares.", contpar);
	system ("pause");
	return 0;
}		
