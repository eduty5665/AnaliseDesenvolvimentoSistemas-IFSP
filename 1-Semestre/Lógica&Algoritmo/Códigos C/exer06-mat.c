#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, j, cont=0, somaEstArmazem=0, somaProdCusto=0, mat[3][3], custoProd[3][3], custo[3], vetArmazem[3], vetCusto[3];
	printf ("Informe o estoque dos armazens:\n");
	for (i=0 ; i<3 ; i++){
		for (j=0 ; j<3 ; j++)
		{
			printf("Armazem %d Produto %d: ", i+1, j+1);
			scanf ("%d", &mat[i][j]);
		}
	}
	printf ("Informe o custo dos produtos:\n");
	for (i=0 ; i<3 ; i++){
		printf("Produto %d: ", i+1);
		scanf ("%d", &custo[i]);
	}
	printf ("\n");
	printf ("\t\t Prod1\t Prod2\t Prod3\n");
	for (i=0 ; i<3 ; i++){
		printf("Armazem %d\t", i+1);
		for (j=0 ; j<3 ; j++)
		{
			printf("%d\t", mat[i][j]);
		}
		printf ("\n");
	}
	printf("Custo\t\t");
	for (i=0 ; i<3 ; i++){
		printf("%d\t", custo[i]);
	}
	printf ("\n");
	printf ("\n");
	for (i=0 ; i<3 ; i++){
		for (j=0 ; j<3 ; j++)
		{
			somaEstArmazem+=mat[i][j];
		}
		vetArmazem[i]=somaEstArmazem;
		somaEstArmazem=0;
		printf ("Existem %d produtos no armazem %d \n", vetArmazem[i], i+1);
	}
	printf ("\n");
	for (i=0 ; i<3 ; i++){
		for (j=0 ; j<3 ; j++)
		{
			custoProd[i][j] = mat[i][j] * custo[j];
			somaProdCusto+=custoProd[i][j];
		}
		vetCusto[i]=somaProdCusto;
		somaProdCusto=0;
		printf ("O custo do armazem %d eh: %d \n", i+1, vetCusto[i]);
	}
	printf ("\n");
	printf ("O custo de cada produto\n");
	printf ("\t\t Prod1\t Prod2\t Prod3\n");
	for (i=0 ; i<3 ; i++){
		printf("Armazem %d\t", i+1);
		for (j=0 ; j<3 ; j++)
		{
			printf("%d\t", custoProd[i][j]);
		}
		printf ("\n");
	}
	system ("pause");
	return 0;
}		
