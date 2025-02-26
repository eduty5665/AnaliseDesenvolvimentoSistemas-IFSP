/* 3.Como seriam, em linguagem C, as declara��es de ponteiros para as seguintes estruturas de dados:
	a) uma vari�vel do tipo int
	b) uma vari�vel do tipo double
	c) uma vari�vel do tipo char
	d) uma vari�vel do tipo struct Hora { int hora; int minuto; int segundo; }
	e) uma vari�vel do tipo double * (um ponteiro para double)
*/

#include <stdio.h>
#include <string.h>

struct Hora{
    int hora, minuto, segundo;
};

int main()
{
	int * nPtr;
	double * dPtr;
	char * cPtr;
	struct Hora h;
	double ** ptrDPtr;
    return 0;
}