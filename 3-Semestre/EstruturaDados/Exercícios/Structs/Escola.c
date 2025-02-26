/*2. Crie uma estrutura representando os alunos de um determinado curso. A estrutura deve conter o RA do aluno, nome, nota da primeira prova, nota da segunda prova e nota da terceira prova.
	Permita ao usu�rio entrar com os dados de 5 alunos.
	Exibir o nome e RA do aluno com maior nota da primeira prova.
	Exibir o nome e RA do aluno com maior media geral . 
	Exibir o nome e RA do aluno com menor media geral
	Para cada aluno informe se ele foi aprovado ou reprovado, considerando o valor 6,00 a nota m�nima para aprova��o.
*/

#include <stdio.h>
#include <string.h>

struct Alunos{
    int RA;
    char nome[50];
    float nota1;
    float nota2;
    float nota3;
    float media;
    char status[10];
};

void preencheDados(){
    struct Alunos a[5]; //vetor para as structs
    int indN; //indice das notas
    int indM; //indice das media maior
    int indm; //indice das media menor
    int i;// cont do for
    int maiorNota1;
    int maiorMedia;
    int menorMedia;
   
    for(i=0; i<5; i++){
        printf("\nDigite o RA: ");
        scanf("%d", &a[i].RA);
        printf("Digite o nome: ");
        scanf("%s", a[i].nome);
        printf("Digite a primera nota: ");
        scanf("%f", &a[i].nota1);
        printf("Digite a segunda nota: ");
        scanf("%f", &a[i].nota2);
        printf("Digite a terceira nota: ");
        scanf("%f", &a[i].nota3);
        // Cálculo da média
        a[i].media = (a[i].nota1 + a[i].nota2 + a[i].nota3) / 3;
        // Definir status do aluno
        if(a[i].media >= 6){
            strcpy(a[i].status, "Aprovado!");
        }else{
            strcpy(a[i].status, "Reprovado!");
        }
        // Determinar aluno com maior nota na primeira prova
        if(a[i].nota1 > a[i-1].nota1){
            maiorNota1=a[i].nota1;
            indN=i;
        }else{
            maiorNota1=a[i-1].nota1;
            indN=i-1;
        }
        // Determinar maior e menor média
        if (i == 0 || a[i].media > maiorMedia) {
            maiorMedia = a[i].media;
            indM = i;
        }
        if (i == 0 || a[i].media < menorMedia) {
            menorMedia = a[i].media;
            indm = i;
        }
    }
     // Exibir resultados
    printf("\nA maior nota do primeiro semestre é %.2f do aluno(a) %s do RA %d", a[indN].nota1, a[indN].nome, a[indN].RA);
    printf("\n A maior media é %.2f do aluno(a) %s do RA %d", a[indM].media, a[indM].nome, a[indM].RA);
    printf("\n A menor media é %.2f do aluno(a) %s do RA %d", a[indm].media, a[indm].nome, a[indm].RA);
    // Exibir status dos alunos
    printf("\n --STATUS DOS ALUNOS--");
    for(i=0; i<5; i++){
        printf("\n O aluno(a) %s foi %s", a[i].nome, a[i].status);
    }
}

int main()
{
    preencheDados();

    return 0;
}