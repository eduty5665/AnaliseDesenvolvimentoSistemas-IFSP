#include<stdio.h>
#include<locale.h>

int main(){
    int num;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite um número: \n");
    scanf("%d", &num);
    if(num == 0){
        printf("%d é zero.", num);
    }else{
        if(num > 0){
            printf("%d é positivo.", num);
        }else{
            printf("%d é negativo.", num);
        }
    }
}