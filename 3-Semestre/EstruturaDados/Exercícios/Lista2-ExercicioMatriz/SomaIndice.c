
#include<stdio.h>
#include<stdlib.h>
	
#define x 3
#define y 3
#define z 3

int main() {
	int*** matriz;
    int i;
	matriz = (int** *) malloc (x* sizeof (int**));

	For (i = 0;i < x; i++){
		matriz [ i ] = (int* *) malloc (y* sizeof (int*));
    }

    For (int i=0; i<x; i++){
	    For (int j =0; j<y; j++){
		    matriz [ i ] [ j ] = (int*) malloc (z* sizeof(int));
        }
    }

//Preenche a matriz com a soma dos índices
    For (int i=0; i<x; i++){
	    For (int j =0; j<y; j++){
		    For (int k=0; k<z; k++){
			    matriz [ i ] [ j ] [ k ] = i + j + k;
		    }
        }
    }
//Exibir Valores
    For (int i=0; i<x; i++){
	    For (int j =0; j<y; j++){
		    For (int k=0; k<z; k++){
			    printf(“Matriz [%d] [%d] [%d] = %d\n”, i, j, k, Matriz[ i ] [ j ] [ k ]);
		    }
        }
    }
}
