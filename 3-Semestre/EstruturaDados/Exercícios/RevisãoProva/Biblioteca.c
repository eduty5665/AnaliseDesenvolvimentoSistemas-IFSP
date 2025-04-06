/*
2.Desenvolva um sistema de gerenciamento de livros que permita cadastrar, listar e buscar livros de uma biblioteca.
Requisitos:

Estrutura Livro:
Crie uma estrutura chamada Livro com os seguintes campos:
	id (inteiro)
	titulo (string com no máximo 50 caracteres)
	autor (string com no máximo 50 caracteres)
	ano (inteiro)
	
Vetor de Livros:
Crie um vetor de estruturas Livro utilize alocação dinâmica

Funções:
Implemente as seguintes funções:
	cadastrarLivro: recebe vetor de livros e o número de livros cadastrados. A função deve solicitar os dados de um novo livro ao usuário e adicioná-lo ao vetor.
	listarLivros: recebe o vetor de livros e o número de livros cadastrados. A função deve exibir na tela os dados de todos os livros cadastrados.
	buscarLivro: recebe o vetor de livros, o número de livros cadastrados e o título do livro a ser buscado. A função deve buscar o livro no vetor e exibir seus dados na tela. Se o livro não for encontrado, exibir uma mensagem informando. 

Menu Principal:
Crie um menu principal que permita ao usuário escolher entre as seguintes opções:
	Cadastrar livro
	Listar livros
	Buscar livro
	Sair
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Livro {
    int id;
    char titulo[50];
    char autor[50];
    int ano;
};

void cadastrarLivro(struct Livro *l, int *qtd, int max_livros) {
    if (*qtd < max_livros) {
        printf("\nDigite o ID do Livro: ");
        scanf("%d", &l[*qtd].id);
        printf("Digite o Título do Livro: ");
        scanf(" %[^\n]s", l[*qtd].titulo);
        printf("Digite o Autor do Livro: ");
        scanf(" %[^\n]s", l[*qtd].autor);
        printf("Digite o Ano do Livro: ");
        scanf("%d", &l[*qtd].ano);
        (*qtd)++; // Atualiza a quantidade de livros cadastrados
        printf("\nLivro cadastrado com sucesso!\n");
    } else {
        printf("\nCapacidade máxima atingida!\n");
    }
}

void listarLivros(struct Livro *l, int qtd) {
    if (qtd == 0) {
        printf("\nNenhum livro cadastrado ainda!\n");
        return;
    }
    
    printf("\nLista de Livros:\n");
    for (int i = 0; i < qtd; i++) {
        printf("\nID: %d\nTítulo: %s\nAutor: %s\nAno: %d\n", 
               l[i].id, l[i].titulo, l[i].autor, l[i].ano);
    }
}

void buscarLivro(struct Livro *l, int qtd, char *titulobusca) {
    int encontrado = 0;
    for (int i = 0; i < qtd; i++) {
        if (strcmp(l[i].titulo, titulobusca) == 0) { // Comparação de strings
            printf("\nLivro encontrado!");
            printf("\nID: %d\nTítulo: %s\nAutor: %s\nAno: %d\n", 
                   l[i].id, l[i].titulo, l[i].autor, l[i].ano);
            encontrado = 1;
            break; // Para otimizar encerra-se a busca no primeiro resultado encontrado
        }
    }
    
    if (!encontrado) {
        printf("\nLivro não encontrado!\n");
    }
}

int main() {
    int qtdLivros = 0, opc, max_livros;
    char titulobusca[50];

    printf("-- BIBLIOTECA MUNICIPAL --\n");
    printf("Quantos livros deseja armazenar? ");
    scanf("%d", &max_livros);

    struct Livro *l = (struct Livro *)calloc(max_livros, sizeof(struct Livro));
    if (l == NULL) {
        printf("\nErro ao alocar memória!\n");
        return 1;
    }

    do {
        printf("\nMenu:\n");
        printf("1. Cadastrar Livro\n");
        printf("2. Listar Livros\n");
        printf("3. Buscar Livro\n");
        printf("4. Sair\n");
        printf("Escolha uma opção: ");
        scanf("%d", &opc);

        switch (opc) {
            case 1:
                cadastrarLivro(l, &qtdLivros, max_livros);
                break;
            case 2:
                listarLivros(l, qtdLivros);
                break;
            case 3:
                printf("Digite o título do livro que deseja buscar: ");
                scanf(" %[^\n]s", titulobusca);
                buscarLivro(l, qtdLivros, titulobusca);
                break;
            case 4:
                printf("\nSaindo...\n");
                break;
            default:
                printf("\nOpção inválida!\n");
                break;
        }
    } while (opc != 4);

    free(l); // Libera a memória alocada dinamicamente
    return 0;
}
