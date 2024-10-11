/* Type your code here, or load an example. */
#include<stdio.h>
#include<locale.h>

int main(){
	int  maior, menor, num;
    printf("Digite um numero\n");
    scanf("%d", &num);
    maior = num;
    menor = num;
	while(num >= 0) {
        printf("Digite um numero\n");
        scanf("%d", &num);
		if(num > maior && num >= 0){
            maior = num;
        }else{
            if(num < menor && num >= 0){
                    menor = num;
            }
        }
    }
    printf("O maior é %d e o menor é %d", maior, menor);
}
