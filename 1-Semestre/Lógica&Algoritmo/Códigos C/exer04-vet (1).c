#include <stdio.h>
#include <stdlib.h>
int main()
{
	int i = 0, nums[10], pos=0, neg=0, qtdnum;
	printf ("Informe a quantidade de numeros e quais sao.\n");
    printf ("Quantos numeros?\n");
    scanf ("%d", &qtdnum);
	for (i=0 ; i<qtdnum ; i++)
	{
        printf ("Digite um numero: \n");
        scanf ("%d", &nums[i]);
	}
	for (i=0 ; i<qtdnum ; i++)
	{
		if(nums[i] >= 0){
                  pos+=1;                  
        }else{
        	neg+=1;
			}
	}
    printf("%d numeros sao positivos.\n", pos);  
	printf("%d numeros sao negativos.\n", neg);  
	system ("pause");
	return 0;
}
