#include<stdio.h>
#include<stdlib.h>
	
#define Num_alunos 3
#define Tam_nome 50

int main() {
	char** nomes;
	nomes = (char* *) calloc (Num_alunos, sizeof(char*));

	For (int i=0; i<Num_alunos; i++){
		Nomes[ i ] = (char*) calloc (Tam_nome, sizeof(char));
    }

    Char alunos [Num_alunos] [Tam_nome] = {“Pedro”, “Lucas”, “Eduardo”};

    For (int i=0; i<Num_alunos; i++){
	    Nomes[ i ] [ 0 ] = alunos [ i ] [ 0 ]
	    For (int j = 1; alunos [ i ] [ j ] != “\0”; j++){
		    Nomes[ i ] [ j ] = alunos[ i ] [ j ];
        }
    }
    Return 0;
}
