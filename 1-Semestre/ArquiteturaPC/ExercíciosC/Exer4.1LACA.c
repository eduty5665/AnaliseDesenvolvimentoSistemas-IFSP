/* Type your code here, or load an example. */
#include<stdio.h>
#include<locale.h>

int main(){
	int num, mult = 1, tot;
	printf("Digite um número inteiro positivo:\n");
	scanf("%d", &num);
	if(num < 0) {
		printf("O número deve ser inteiro positivo.\n");
		exit(1);
	} else{
        if(num == 0 || num == 1) {
		    printf("O fatorial de %d é 1.\n", num);
	    }
    }
	while(mult < num) {
		tot = num * mult;
        mult++;
	}
	printf("O fatorial do número %d é %d", num, tot);
}
