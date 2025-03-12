#include <stdio.h>

void calc_esfera(double R){
    printf("%g", (4 * 3.14159 * (R*R)));
    printf("\n%g", (1.33333333333 * 3.14159 * (R*R*R)));
}

int main()
{
    double R;
    scanf("%lf", &R);
    calc_esfera(R);
    return 0;
}



