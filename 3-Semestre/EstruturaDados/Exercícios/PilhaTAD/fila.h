#ifndef FILA_H
#define FILA_H

typedef struct Fila Fila;

// Fun��o para criar uma fila
Fila* fila_criar();

// Fun��o para destruir a fila e liberar a mem�ria
void fila_destruir(Fila* f);

// Fun��o para inserir um valor na fila
void enqueue(Fila* f, int valor);

// Fun��o para remover o primeiro valor da fila
int dequeue(Fila* f);

// Fun��o para visualizar o primeiro valor da fila
int peek(Fila* f);

// Fun��o para verificar se a fila est� vazia
int fila_vazia(Fila* f);

#endif // FILA_H

