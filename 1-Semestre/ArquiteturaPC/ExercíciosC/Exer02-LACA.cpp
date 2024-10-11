#include<stdio.h>
#include<locale.h>

int main(){
    float celsius, fah;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite a temperatura em Celsius: ");
    scanf("%f", &celsius);
    fah = celsius * 1.8 + 32;
    printf("%0.2f graus Celsius equivalem a %0.2f graus Fahrenheit", celsius, fah);
}