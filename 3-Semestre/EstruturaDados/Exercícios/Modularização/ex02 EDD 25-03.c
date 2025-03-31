/*
2.     Crie uma fun��o para calcular a soma dos elementos de uma matriz 3x3. A matriz deve ser passada como par�metro para a fun��o.
�       A fun��o deve utilizar passagem de par�metro por refer�ncia.
�       A matriz deve ser preenchida pelo usu�rio.
�       Exiba a matriz e a soma dos elementos.
Exemplo:
Matriz:
1 2 3 
4 5 6 
7 8 9
Sa�da: Soma dos elementos: 45
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
	printf("A soma dos elementos da matriz �: %d", somaElementos(matriz));
	return 0;
}
