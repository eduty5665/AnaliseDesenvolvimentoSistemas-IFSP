#include <stdio.h>

int main() {
    int num, cont1, cont2, cont3, cont4;
    num = 0;
    cont1 = 0;
    cont2 = 0;
    cont3 = 0;
    cont4 = 0;
    do {
        scanf("%d", &num);
        if (num > 0 && num <= 25) {
           cont1++;
           } else {
               if(num > 25 && num <= 50){
                  cont2++;
                  } else {
                      if(num > 50 && num <=75){
                                cont3++;
                         }else{
                                if(num > 75 && num <= 100){
                                 cont4++;
                                 }
                              }
                 }
          }
    } while (num > 0);
    printf("[00-25]:\t%d\n", cont1);
    printf("[26-50]:\t%d\n", cont2);
    printf("[51-75]:\t%d\n", cont3);
    printf("[76-100]:\t%d\n", cont4);
}

