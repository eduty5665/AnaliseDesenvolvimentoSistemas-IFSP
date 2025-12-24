#include <stdio.h>
#define MAX 15

char arvore[MAX] = {
    'A', 'B', 'C',
    'D', 'E', '-', 'F',
    '-', '-', '-', '-', '-', '-', '-', '-'
};

void exibirParentesesVetor(int i) {
    if (i < MAX && arvore[i] != '-') {
        printf("%c", arvore[i]);
        if ((2*i+1 < MAX && arvore[2*i+1] != '-') ||
            (2*i+2 < MAX && arvore[2*i+2] != '-')) {
            printf("(");
            if (2*i+1 < MAX && arvore[2*i+1] != '-')
                exibirParentesesVetor(2*i+1);
            else
                printf(" ");
            printf(",");
            if (2*i+2 < MAX && arvore[2*i+2] != '-')
                exibirParentesesVetor(2*i+2);
            else
                printf(" ");
            printf(")");
        }
    }
}

void exibirParagrafadoVetor(int i, int nivel) {
    if (i < MAX && arvore[i] != '-') {
        for (int j = 0; j < nivel; j++) printf("  ");
        printf("%c\n", arvore[i]);
        exibirParagrafadoVetor(2*i+1, nivel+1);
        exibirParagrafadoVetor(2*i+2, nivel+1);
    }
}

int main() {
    printf("Parênteses aninhados:\n");
    exibirParentesesVetor(0);
    printf("\n\n");

    printf("Paragrafado:\n");
    exibirParagrafadoVetor(0, 0);

    return 0;
}
