#ifndef FILA_H
#define FILA_H

typedef struct Fila Fila;

// Função para criar uma fila
Fila* fila_criar();

// Função para destruir a fila e liberar a memória
void fila_destruir(Fila* f);

// Função para inserir um valor na fila
void enqueue(Fila* f, int valor);

// Função para remover o primeiro valor da fila
int dequeue(Fila* f);

// Função para visualizar o primeiro valor da fila
int peek(Fila* f);

// Função para verificar se a fila está vazia
int fila_vazia(Fila* f);

#endif // FILA_H

