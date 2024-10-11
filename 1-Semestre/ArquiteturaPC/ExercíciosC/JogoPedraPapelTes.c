/* Type your code here, or load an example. */
#include<stdio.h>
#include<locale.h>
#include<stdlib.h>
#include<time.h>

int main(){
	int  escJog=1, escPC, vitJog = 0, vitPC = 0, emp = 0;
    srand((unsigned int)time(NULL));
	while(escJog != 0) {
	    printf("Pedra = 1. Papel = 2. Tesoura = 3. Sair = 0.  \n");
	    scanf("%d", &escJog);
        escPC = rand() % 3 + 1;
        printf("Jogada PC %d \n", escPC);
		if(escJog == escPC){
            printf("Empate!\n");
            emp++;
        }else{
            if(escJog == 1 && escPC == 3){
               printf("Ganhou!\n");
                vitJog++; 
            }else{
                if(escJog == 2 && escPC == 1){
                    printf("Ganhou!\n");
                    vitJog++; 
                }else{
                    if(escJog == 3 && escPC == 2){
                    printf("Ganhou!\n");
                    vitJog++; 
                    }else{
                        printf("Perdeu!\n");
                        vitPC++;
                    }
                }
            }
        }
    }
    printf("Você ganhou %d partidas. \n", vitJog);
    printf("O computador ganhou %d partidas.  \n", vitPC);
    printf("Tiveram %d empates.  \n", emp);
}