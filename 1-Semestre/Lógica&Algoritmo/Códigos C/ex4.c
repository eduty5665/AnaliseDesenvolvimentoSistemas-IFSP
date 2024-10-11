#include <stdio.h>

int main() {
    int number, cont1, cont2, cont3, cont4;
    number = 0
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
    return 0;
}

