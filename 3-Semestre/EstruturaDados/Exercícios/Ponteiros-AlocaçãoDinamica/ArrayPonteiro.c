#include <stdio.h>
#include <stdlib.h>


int soma_vetor(int N, int *valores){
    int soma=0, i;
    for (i=0; i<N;i++){
        soma = soma + valores[i];
    }
    return soma;
}

int main(){
    int soma, N;
    int *valores;
    scanf("%d", &N);
    valores = (int *) calloc (N, sizeof(int));
    if (valores == NULL) {
        printf("Erro na alocação de memória.\n");
        return 1;
    }
    for (int i = 0; i < N; i++) {
        scanf("%d", &valores[i]);
    }
    soma = soma_vetor(N, valores);
    printf("%d", soma);
    free(valores);
}