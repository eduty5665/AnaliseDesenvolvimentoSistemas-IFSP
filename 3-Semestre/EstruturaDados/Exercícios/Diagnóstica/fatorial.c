/******************************************************************************

                            Online C Compiler.
                Code, Compile, Run and Debug C program online.
Write your code in this editor and press "Run" button to compile and execute it.

*******************************************************************************/

#include <stdio.h>

int calculaFatorial(int N)
{
    int i, fatorial=1;
    for(i=1;i<=N;i++){
        fatorial *= i;
    }
    return(fatorial);
}

int main()
{
    int N, fatorial;
    printf("Digite um numero: ");
    scanf("%d", &N);
    fatorial = calculaFatorial(N);
    printf("O Fatorial de %d é %d", N, fatorial);
}