#include<stdio.h>
#include<locale.h>

int main(){
    float base, altura, area;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite a base do triângulo: ");
    scanf("%f", &base);
    printf("Digite a altura do triângulo: ");
    scanf("%f", &altura);
    area = (base*altura)/2;
    printf("A area do triângulo é: %0.2f", area);
}