#include <stdio.h>
#include <stdlib.h>

#define Lin 3 
#define Col 3

void multiplicar_matrizes(int **mat1, int **mat2, int **resultado, int tamanho){
    for(int i = 0; i < tamanho; i++){
        for(int j = 0; j < tamanho; j++){
            resultado[i][j] = mat1[i][j] * mat2[i][j];
            printf("%d ", resultado[i][j]);
        }
        printf("\n");
    }
}

int main(){
    
    int **mat1;
    int **mat2;
    int **resultado;
    
    mat1 = (int **) calloc(Lin, sizeof(int *));
    mat2 = (int **) calloc(Lin, sizeof(int *));
    resultado = (int **) calloc(Lin, sizeof(int *));
    
    if(mat1 != NULL && mat2 != NULL){
        
        mat1[0] = (int *) calloc(Lin * Col, sizeof(int));
        mat2[0] = (int *) calloc(Lin * Col, sizeof(int));
        resultado[0] = (int *) calloc(Lin * Col, sizeof(int));

        
        //Organiza vetores de ponteiros
        for(int i = 1; i < Lin; i++){
            mat1[i] = mat1[0] + (i * Col);
            mat2[i] = mat2[0] + (i * Col);
            resultado[i] = resultado[0] + (i * Col);
        }
        
        //Atribui valores as matrizes 
        for(int i = 0; i < Lin; i++){
            for(int j = 0; j < Col; j++){
                mat1[i][j] = i + j;
                mat2[i][j] = i + j;
            }
        }
        
        multiplicar_matrizes(mat1, mat2, resultado, Lin);
        
    }
    
    return 0;
}


