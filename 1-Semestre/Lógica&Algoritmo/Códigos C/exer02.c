#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i = 0, soma=0, vet[10], media, contalun=0;
    printf ("Informe 10 notas:\n");
	for (i=0 ; i<10 ; i++)
	{
		printf("Nota %d: \n", i+1);
		scanf ("%d", &vet[i]);
		soma = soma + vet[i];
	}
	media = soma / 10;
	for (i=0 ; i<10 ; i++)
	{
		if(vet[i] > media){
                  contalun+=1;                  
                  }
	}
    printf("%d alunos estão acima da media.\n", contalun);    
	system ("pause");
	return 0;
}
