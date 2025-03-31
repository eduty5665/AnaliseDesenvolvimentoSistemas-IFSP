/*
2.     Crie uma função para calcular a soma dos elementos de uma matriz 3x3. A matriz deve ser passada como parâmetro para a função.
·       A função deve utilizar passagem de parâmetro por referência.
·       A matriz deve ser preenchida pelo usuário.
·       Exiba a matriz e a soma dos elementos.
Exemplo:
Matriz:
1 2 3 
4 5 6 
7 8 9
Saída: Soma dos elementos: 45
*/

#define LIN 3
#define COL 3

int somaElementos(int matriz[][3]){
	int i,j, soma;
	for (i=0;i<3;i++){
		for (j=0;j<3;j++){
			soma+=matriz[i][j];
		}
	}
	return soma;
}

int main(){
	int i,j, matriz[3][3];
	for (i=0; i < LIN; i++){
	   for (j=0; j < COL; j++){
			printf("Insira o elemento [%d][%d] da matriz: ",i,j);
			scanf("%d", &matriz[i][j]);
		}
	}
	for (i=0; i < LIN; i++){
	   for (j=0; j < COL; j++){
			printf("%d",matriz[i][j]);
		}
	printf("\n");
	}
	printf("A soma dos elementos da matriz é: %d", somaElementos(matriz));
	return 0;
}
