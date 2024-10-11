#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i, j, contL1=0, contL2=0, contL3=0, soma=0, qtdsoma=0, x[4][3];
	float media;
	printf ("Informe os elementos inteiros da matriz:\n");
	for (i=0 ; i<4 ; i++)
	{
		for (j=0 ; j<3 ; j++)
		{
			printf("Elemento %d %d: ", i, j);
			scanf ("%d", &x[i][j]);
			if(x[i][j] % 2 == 0){
				soma+=x[i][j];
				qtdsoma+=1;
			}
			if(10 <= x[i][j] && x[i][j] <= 20 && j==0){
				contL1+=1;
			} else{
				if(10 <= x[i][j] && x[i][j] <= 20 && j==1){
					contL2+=1;
				} else{
					if(10 <= x[i][j] && x[i][j] <= 20 && j==2){
					contL3+=1;
					}
				}
			}
		}
	}
	media = soma / qtdsoma;
	printf ("%d numeros estao entre 10 e 20 na primeira linha.\n", contL1);
	printf ("%d numeros estao entre 10 e 20 na segunda linha.\n", contL2);
	printf ("%d numeros estao entre 10 e 20 na terceira linha.\n", contL3);
	printf ("A media dos elementos pares da matriz eh: %0.2f \n", media);
	system ("pause");
	return 0;
}		
