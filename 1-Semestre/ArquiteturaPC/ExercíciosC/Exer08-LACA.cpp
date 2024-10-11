#include<stdio.h>
#include<locale.h>

int main(){
    int a, b, c;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite o primeiro número: \n");
    scanf("%d", &a);
    printf("Digite o segundo número: \n");
    scanf("%d", &b);
    printf("Digite o terceiro número: \n");
    scanf("%d", &c);
    if(a == b || a == c || b == c || a == b == c){
        printf("Os números digitados são iguais.");
        if(a > b && a > c){
            printf("O maior número é : %d", a);
            if(b > c) {
                printf("O menor número é : %d", c);
            }else{
                if(c > b){
                    printf("O menor número é : %d", b);
                }
            }
        }else{
            if(b > a && b > c){
                printf("O maior número é : %d", b);
                if(a > c) {
                    printf("O menor número é : %d", c);
                }else{
                    if(c > a){
                    printf("O menor número é : %d", a);
                    }
                }
            }else{
                if(c > a && c > b){
                     printf("O maior número é : %d", c);
                     if(a > b) {
                        printf("O menor número é : %d", b);
                    }else{
                        if(b > a){
                        printf("O menor número é : %d", a);
                        }
                    }
                }
            }
        }
    }
}