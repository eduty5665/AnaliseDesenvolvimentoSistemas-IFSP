#include <stdio.h>
#include <string.h>

void inverterString(char str[], int inicio, int fim) {
    
    if (inicio >= fim)
        return;

    char temp = str[inicio];
    str[inicio] = str[fim];
    str[fim] = temp;

    inverterString(str, inicio + 1, fim - 1);
}

int main() {
    char str[100];

    printf("Digite uma string: ");
    scanf("%s", str);

    int tamanho = strlen(str);
    inverterString(str, 0, tamanho - 1);

    printf("String invertida: %s\n", str);

    return 0;
}
