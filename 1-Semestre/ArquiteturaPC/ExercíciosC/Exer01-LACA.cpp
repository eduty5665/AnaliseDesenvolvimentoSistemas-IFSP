#include<stdio.h>
#include<locale.h>

int main(){
    char nome[12];
    setlocale(LC_ALL, "Portuguese");
    printf("Digite seu nome: ");
    scanf("%s", &nome);
    printf("Olá, %s ! Seja bem-vinda!", nome);
}