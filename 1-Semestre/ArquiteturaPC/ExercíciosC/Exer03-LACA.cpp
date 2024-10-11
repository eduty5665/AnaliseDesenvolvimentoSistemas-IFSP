#include<stdio.h>
#include<locale.h>

int main(){
    float n1, n2, n3, media;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite o primeiro número: ");
    scanf("%f", &n1);
    printf("Digite o segundo número: ");
    scanf("%f", &n2);
    printf("Digite o terceiro número: ");
    scanf("%f", &n3);
    media = (n1 + n2 + n3) / 3;
    printf("A média dos números é: %0.2f", media);
}