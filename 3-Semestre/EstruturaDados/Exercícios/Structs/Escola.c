/*2. Crie uma estrutura representando os alunos de um determinado curso. A estrutura deve conter o RA do aluno, nome, nota da primeira prova, nota da segunda prova e nota da terceira prova.
	Permita ao usu�rio entrar com os dados de 5 alunos.
	Exibir o nome e RA do aluno com maior nota da primeira prova.
	Exibir o nome e RA do aluno com maior media geral . 
	Exibir o nome e RA do aluno com menor media geral
	Para cada aluno informe se ele foi aprovado ou reprovado, considerando o valor 6,00 a nota m�nima para aprova��o.
*/

#include <stdio.h>

struct Alunos{
    int RA;
    char nome[50];
    int nota1;
    int nota2;
    int nota3;
    double media;
    char status[10];
};

struct Alunos preencheDados(){
    struct Alunos a[2]; //vetor para as structs
    int indN; //indice das notas
    int indM; //indice das media maior
    int indm; //indice das media menor
    int i;// cont do for
    int maiorNota1;
    int maiorMedia;
    int menorMedia;
   
    for(i=0; i<3; i++){
        printf("Digite o RA: ");
        scanf("%d", &a[i].RA);
        printf("Digite o nome: ");
        scanf("%s", a[i].nome);
        printf("Digite a primera nota: ");
        scanf("%d", &a[i].nota1);
        printf("Digite a segunda nota: ");
        scanf("%d", &a[i].nota2);
        printf("Digite a terceira nota: ");
        scanf("%d", &a[i].nota3);
        if(a[i].nota1 > a[i-1].nota1){
          maiorNota1=a[i].nota1;
          indN=i;
        }else{
            maiorNota1=a[i-1].nota1;
            indN=i-1;
        }
        a[i].media = (a[i].nota1 + a[i].nota2 + a[i].nota3) / 3;
        if(a[i].media >= 6){
            a[i].status = "Aprovado!"
        }else{
            a[i].status = "Reprovado!"
        }
        if (a[i].media > a[i-1].media){
            maiorMedia=a[i].media;
            menorMedia=a[i-1].media;
            indM=i;
            indm=i-1;
        }else{
            maiorMedia=a[i-1].media;
            menorMedia=a[i].media;
            indm=i;
            indM=i-1;
        }
    }
    printf("A primeira maior nota é %d do aluno %s do RA %d", a[indN].nota1, a[indN].nome, a[indN].RA);
    printf("/n A maior media é %g do aluno %s do RA %d", a[indM].media, a[indM].nome, a[indM].RA);
    printf("/n A menor media é %g do aluno %s do RA %d", a[indm].media, a[indm].nome, a[indm].RA);
}

int main()
{
    preencheDados();

    return 0;
}