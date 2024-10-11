#include<stdio.h>
#include<locale.h>

int main(){
    int n1, n2, n3;
    setlocale(LC_ALL, "Portuguese");
    printf("Digite um numero: ");
    scanf("%d", &n1);
    printf("Digite um numero: ");
    scanf("%d", &n2);
    printf("Digite um numero: ");
    scanf("%d", &n3);
    if(n1 < n3 < n2){
    	printf("O numero %d esta entre %d e %d\n", n3, n1, n2);
	}else{
		printf("O numero %d não esta entre %d e %d\n", n3, n1, n2);
	}
}

