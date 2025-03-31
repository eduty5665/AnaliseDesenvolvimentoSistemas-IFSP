#include<stdio.h>
#include<stdlib.h>

int main() {
    int opcao, lin, col;
    int **matriz;

    while (opcao != 4) {
        printf(" 1 - Criar Matriz \n 2 - Preencher matriz \n 3 - Exibir matriz \n 4 - Liberar memória e sair \n");
        printf("Escolha uma opção: ");
        scanf("%d", &opcao);

        switch (opcao) {
            case 1:
                printf("Digite o número de linhas: ");
                scanf("%d", &lin);
                printf("Digite o número de colunas: ");
                scanf("%d", &col);
                
                matriz = (int **) calloc(lin, sizeof(int *));
                if (matriz != NULL) {
                    matriz[0] = (int *) calloc(lin * col, sizeof(int));
                    for (int i = 0; i < lin; i++) {
                        matriz[i] = matriz[0] + (col * i);
                    }
                }
                break;

            case 2:
                if (matriz != NULL) {
                    printf("Digite os valores da matriz: \n");
                    for (int i = 0; i < lin; i++) {
                        for (int j = 0; j < col; j++) {
                            printf("Elemento [%d][%d]: ", i, j);
                            scanf("%d", &matriz[i][j]);
                        }
                    }
                }
                break;

            case 3:
                if (matriz != NULL) {
                    printf("Matriz formada: \n");
                    for (int i = 0; i < lin; i++) {
                        for (int j = 0; j < col; j++) {
                            printf("[%d]", matriz[i][j]);
                        }
                        printf("\n");
                    }
                }
                printf("\n");
                break;

            case 4:
                if (matriz != NULL) {
                    free(matriz);
                    matriz = NULL;
                }
                break;

            default:
                printf("Opção inválida.\n");
        }
    }

    return 0;
}
