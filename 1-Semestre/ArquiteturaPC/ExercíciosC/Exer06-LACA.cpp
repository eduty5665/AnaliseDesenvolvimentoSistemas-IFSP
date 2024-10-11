#include<stdio.h>
#include<locale.h>

int main(){
    int num;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite um número: \n");
    scanf("%d", &num);
    if(num % 2 == 0){
        printf("%d é par.", num);
    }else{
        printf("%d é impar.", num);
    }
}