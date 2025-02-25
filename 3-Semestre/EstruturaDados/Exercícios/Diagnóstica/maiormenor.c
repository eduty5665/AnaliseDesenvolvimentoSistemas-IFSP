/******************************************************************************

                            Online C Compiler.
                Code, Compile, Run and Debug C program online.
Write your code in this editor and press "Run" button to compile and execute it.

*******************************************************************************/

#include <stdio.h>

int main()
{
    int a, b, c, maior, menor;
    printf("Digite três numeros: ");
    scanf("%d", &a);
    scanf("%d", &b);
    scanf("%d", &c);
    maior = a;
    menor = a;
    if((a>b) && (a>c)){
        maior = a;
        if(b>c){
            menor=c;
        }else{
            menor=b;
        }
        printf("O maior numero é: %d e o menor é: %d", maior, menor);
    }
    if((b>a) && (b>c)){
        maior=b;
        if(a>c){
            menor=c;
        }else{
            menor=a;
        }
        printf("O maior numero é: %d e o menor é: %d", maior, menor);
    }
    if((c>a) && (c>b)){
        maior=c;
        if(a>b){
            menor=b;
        }else{
            menor=a;
        }
        printf("O maior numero é: %d e o menor é: %d", maior, menor);
    }
    if((a==b) && (b==c) && (c=a)){
        printf("Todos os numeros são iguais.");
    }
    return 0;
}