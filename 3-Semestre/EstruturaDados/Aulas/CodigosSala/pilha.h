// Definição da estrutura da pilha
typedef struct Pilha Pilha;

// Interface das operações disponíveis
Pilha* pilha_criar();
void destruir(Pilha* p);
void push(Pilha* p, int valor);
int pop(Pilha* p);
int peek(Pilha* p);
int pilha_vazia(Pilha* p);