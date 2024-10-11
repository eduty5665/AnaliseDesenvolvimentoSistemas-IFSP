#include<stdio.h>
#include<locale.h>

int main(){
    float a, n, r, an, sompa;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite o primeiro termo(a): \n");
    scanf("%f", &a);
    printf("Digite a razão(r): \n");
    scanf("%f", &r);
    printf("Digite o número de termos(n): \n");
    scanf("%f", &n);
    an = a + (n-1) * r;
    sompa = ((a + an) * n) / 2;
    printf("A soma dos %0.2f termos é: %0.2f", n, sompa);
}