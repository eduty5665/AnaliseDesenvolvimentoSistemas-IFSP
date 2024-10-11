#include<stdio.h>
#include<locale.h>

int main(){
    int n1;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite um numero: ");
    scanf("%d", &n1);
    if(n1 > 0 && n1 % 3 != 0){
    	printf("O numero %d é positivo e não multiplo de 3.", n1);
	}else{
		if(n1 > 0 && n1 % 3 == 0){
    	printf("O numero %d é positivo e multiplo de 3.", n1);
		} else{
			printf("O numero %d é positivo.", n1);
		}
	}
}

