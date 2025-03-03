
#include <stdio.h>

struct horaSegundos {
    int hora, minutos, segundos;
};

int main()
{
    struct horaSegundos seg;
    int quantSegundos;
    
    printf("Digite a quantidade de segundos: ");
    scanf("%d", &quantSegundos);
    
    seg.hora = quantSegundos / 3600;
    seg.minutos = (quantSegundos % 3600) / 60;
    seg.segundos = quantSegundos % 60;
    
    printf("%d hora(s), %d minuto(s) e %dsegundo(s)", seg.hora, seg.minutos, seg.segundos);
    

    return 0;
}