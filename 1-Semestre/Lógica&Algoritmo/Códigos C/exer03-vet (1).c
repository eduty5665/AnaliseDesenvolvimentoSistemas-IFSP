#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i = 0, soma=0, idade[10], media, contidade=0, numidade;
    printf ("Quantas idades?\n");
    scanf ("%d", &numidade);
	for (i=0 ; i<numidade ; i++)
	{
        printf ("Digite a idade: \n");
        scanf ("%d", &idade[i]);
        soma = soma + idade[i];
	}
	media = soma / numidade;
	for (i=0 ; i<numidade ; i++)
	{
		if(idade[i] < media){
                  contidade+=1;                  
                  }
	}
    printf("%d pessoas estao abaixo da media de idade.\n", contidade);    
	system ("pause");
	return 0;
}
