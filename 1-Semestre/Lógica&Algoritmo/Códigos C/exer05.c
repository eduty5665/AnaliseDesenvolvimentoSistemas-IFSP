#include <stdio.h>

int main() {
    int num, first_quarter_count, second_quarter_count, third_quarter_count, fourth_quarter_count;
    num = 0;
    first_quarter_count = 0;
    second_quarter_count = 0;
    third_quarter_count = 0;
    fourth_quarter_count = 0;
    do {
        scanf("%d", &num);
        if (num >= 0 && num <= 25) {
           first_quarter_count+=1;
           } else {
               if(num > 25 && num <= 50){
                  second_quarter_count+=1;
                  } else {
                      if(num > 50 && num <=75){
                                third_quarter_count+=1;
                         }else{
                                if(num > 75 && num <= 100){
                                 fourth_quarter_count+=1;
                                 }
                              }
                 }
          }
    } while (num >= 0);
    printf("[00-25]:\t%d\n", first_quarter_count);
    printf("[26-50]:\t%d\n", second_quarter_count);
    printf("[51-75]:\t%d\n", third_quarter_count);
    printf("[76-100]:\t%d\n", fourth_quarter_count);
}

