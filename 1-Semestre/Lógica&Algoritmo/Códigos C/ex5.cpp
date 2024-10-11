#include <stdio.h>

int main() {
    int number, cont1, cont2, cont3, cont4;
    number = 0
    cont1 = 0;
    cont2 = 0;
    cont3 = 0;
    cont4 = 0;
    do {
        scanf("%d", &number)
        if (number > 0 || number <= 25) {
           cont1++;
           } else {
               if(number > 25 || numer <= 50){
                  cont2++;
                  } else {
                      if(number > 50 || number <=75){
                                cont3++;
                         }else{
                                if(number > 75 || number <= 100){
                                 cont4++;
                                 }
                              }
                 }
          }
    } while (numer > 0);
    printf("[00-25]:\t%d\n", cont1);
    printf("[26-50]:\t%d\n", cont2);
    printf("[51-75]:\t%d\n", cont3);
    printf("[76-100]:\t%d\n", cont4);
}

