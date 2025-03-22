#include <stdio.h>
#include <stdlib.h>

#define LIN 3 
#define COL 4 

int main()
{
    /*int * mPtr, i, j;

    //aloca um vetor de inteiros
    mPtr = (int *) calloc(LIN * COL, sizeof(int));
    
    if(mPtr != NULL){
        //percorre o vetor como se fosse uma matriz utilizando o ponteiro
        for(i = 0; i < LIN; i++){
            for(j = 0; j < COL; j++){
              mPtr[(i*COL) + j] = i + j; 
            }
        }
        
        for(i = 0; i < LIN; i++){
            printf("\n");
            for(j = 0; j < COL; j++){
              printf("%d", mPtr[(i*COL) + j]);  
            }
        }
    }*/
    
    int **mPtr, i, j;
    
    //aloca um vetor de ponteiros para inteiros
    mPtr = (int **) calloc(LIN, sizeof(int *));
    
    if(mPtr != NULL){
        
        //aloca um vetor de inteiros (COL * LIN) e aponta para a primeira  posição do vetor de ponteiros
        mPtr[0] = (int *) calloc(COL * LIN, sizeof(int));
        
        //organiza o vetor de ponteiros
        for(i = 1; i < LIN; i++){
            mPtr[i] = mPtr[0] + i * COL;
        }
        
        //percorre a matriz
        for(i = 0; i < LIN; i++){
            for(j = 0; j < COL; j++){
                mPtr[i][j] = i + j;
            }
        }
        //percorre a matriz mostrando os valores atribuídos 
        for(i = 0; i < LIN; i++){
            printf("\n");
            for(j = 0; j < COL; j++){
                printf("%d", mPtr[i][j]);
            }
        }
        
        printf("\n --- --- -- --- \n");
        //exemplo de como é possível percorrer o "vetor de inteiros"
        for(int k = 0; k < (LIN * COL); k++){
            printf(" %d ", *(*(mPtr)+k));
        }
    }

    return 0;
}