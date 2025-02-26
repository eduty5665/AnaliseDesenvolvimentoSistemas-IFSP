// Fa�a um programa C que recebe um n�mero inteiro (quantidade de segundos) e aciona uma fun��o que transforma essa quantidade em horas, minutos e segundos,
// armazenando esses valores em uma vari�vel do tipo struct. Os valores obtidos pela transforma��o devem ser exibidos.


#include <stdio.h>
#include <math.h>

struct Hora {
	int h,m,s;
};

struct Hora CalculaHora (int qtdSeg){
	struct Hora hr;
	hr.h = floor(qtdSeg/3600);
	hr.m = ((qtdSeg-(hr.h*3600))%60);
	hr.s = (qtdSeg-(hr.h*3600)-(hr.m*60));
	return hr;
}
	
int main(){
	int x=0;
	struct Hora y;
	
	printf("Insira a quantidade de segundos totais:");
	scanf("%d", &x);
	y=CalculaHora(x);
	printf("Horas:%d \nMinutos:%d \nSegundos:%d \n", y.h,y.m,y.s);
	
	return 0;
}
