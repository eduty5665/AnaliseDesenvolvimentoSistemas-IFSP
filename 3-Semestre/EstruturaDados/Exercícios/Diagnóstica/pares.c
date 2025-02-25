/******************************************************************************

                            Online C Compiler.
                Code, Compile, Run and Debug C program online.
Write your code in this editor and press "Run" button to compile and execute it.

*******************************************************************************/

#include <stdio.h>

int main()
{
    int vet[10], par[10], qtd, i;
    printf("Digite 10 numeros: ");
    qtd=0;
    for(i=0;i<10;i++){
        scanf("%d", &vet[i]);
        if(vet[i]%2==0){
            par[qtd]=vet[i];
            qtd++;
        }
    }
    printf("Numeros pares: ");
    for(i=0;i<qtd;i++){
        printf("%d ", par[i]);
    }
    printf("\n Quantidade de Pares: %d", qtd);
    return 0;
}