/* Type your code here, or load an example. */
#include<stdio.h>
#include<locale.h>

int main(){
	int num, n1 = 0, n2 = 1, fibo;
	printf("Digite um número inteiro positivo:\n");
	scanf("%d", &num);
	if(num < 0) {
		printf("O número deve ser inteiro positivo.\n");
		exit(1);
	}
	while(fibo < num) {
		fibo = n1 + n2;
        n1 = n2;
        n2 = fibo;
        printf("%d ", fibo);
	}
}
