/*
1. Dado um número inteiro positivo, o objetivo é somar todos os seus dígitos. Por exemplo, a soma dos dígitos do número 1234 é 1 + 2 + 3 + 4 = 10.
Faça:

Escreva um programa em C que:

Solicite ao usuário um número inteiro positivo.
Implemente uma função recursiva chamada somaDigitos que receba como parâmetro o número inteiro e retorne a soma de seus dígitos.
A função somaDigitos deve lidar com o caso base (quando o número tem apenas um dígito) e o caso recursivo (somar o último dígito com a soma dos dígitos do restante do número).
O programa principal (main) deve chamar a função somaDigitos e exibir o resultado.
Exemplo de Saída:

Digite um número inteiro positivo: 1234

A soma dos dígitos de 1234 é 10

Dicas:

O caso base da recursão ocorre quando o número é menor que 10 (ou seja, tem apenas um dígito).
Para obter o último dígito de um número, use o operador módulo (%).
Para remover o último dígito de um número, divida-o por 10 (divisão inteira).
*/
#include <stdio.h>
#include <string.h>

int somaDigitos(int num){
	if (num < 10){
	    return num;
	}else if(num>=10){
	    return num%10 + somaDigitos(num/10);
	}
}

int main (){
	
	int num;
	printf("Digite um numero: ");
	scanf("%d", &num);
	printf("A soma dos digitos é: %d", somaDigitos(num));
	return 0;
}
