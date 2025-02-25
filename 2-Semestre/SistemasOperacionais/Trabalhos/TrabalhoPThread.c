#include <stdio.h>
#include <locale.h>
#include <pthread.h>
#include <unistd.h> // Para usar sleep()

pthread_mutex_t bomba; // Mutex para controlar o acesso à bomba de gasolina
int cont; // Contador dos laços
int prior = 1; // Contador da prioridade
int lim; // Contador para limitar os veiculos
int somatemp; // Para somar o tempo após cada processo
int somaqtd; // Soma das quantidades de veiculos

// Função genérica para abastecer
void* abastecer(void* tempo_abastecimento) {
    int tempo = *(int*)tempo_abastecimento;

    pthread_mutex_lock(&bomba); // Início da região crítica (ocupando a bomba)
    somatemp = somatemp + tempo;
    printf("\nVeículo está abastecendo por %d segundos... Tempo corrente: %d segundos.\n", tempo, somatemp);
    sleep(tempo); // Simula o tempo de abastecimento
    printf("Veículo terminou de abastecer.\n");
    printf("\n");
    pthread_mutex_unlock(&bomba); // Fim da região crítica (liberando a bomba)

    return NULL;
}

// Função para organizar e garantir que a moto, carro e caminhão abasteçam nessa ordem
void organizar_abastecimento(int tempo_moto, int tempo_carro, int tempo_caminhao, int qtdmoto, int qtdcar, int qtdcami, int somaqtd) {
    pthread_t moto, carro, caminhao;
    
    while(prior<=somaqtd){
        // Motos abastecem primeiro
        while(qtdmoto > 0){
            if(lim>=2){
                break;
            }
            printf("Moto está esperando para abastecer...\n");
            pthread_create(&moto, NULL, abastecer, &tempo_moto);
            pthread_join(moto, NULL); // Espera a moto terminar de abastecer
            lim++;
            prior++;
            qtdmoto--;
        }
        lim=0;
        // Depois os carros
        while(qtdcar > 0){
            if(lim>=2){
                break;
            }
            printf("Carro está esperando para abastecer...\n");
            pthread_create(&carro, NULL, abastecer, &tempo_carro);
            pthread_join(carro, NULL); // Espera o carro terminar de abastecer
            lim++;
            prior++;
            qtdcar--;
        }
        lim=0;
        // Por último os caminhões
        while(qtdcami > 0){
            if(lim>=2){
                break;
            }
            printf("Caminhão está esperando para abastecer...\n");
            pthread_create(&caminhao, NULL, abastecer, &tempo_caminhao);
            pthread_join(caminhao, NULL); // Espera o caminhão terminar de abastecer
            lim++;
            prior++;
            qtdcami--;
        }
        lim=0;
    }
}

int main() {
    int tempo_moto = 2; // Moto demora 2 segundo para abastecer
    int tempo_carro = 4; // Carro demora 4 segundos para abastecer
    int tempo_caminhao = 6; // Caminhão demora 6 segundos para abastecer
    int qtdmoto = 0; // Quantidade de motos na fila
    int qtdcar = 0; // Quantidade de carros na fila
    int qtdcami = 0; // Quantidade de caminhao na fila

    setlocale(LC_ALL, "Portuguese");
    printf("-----------POSTO LINUX-----------\n");
    printf("Quantas motos estão na fila para abastecer?\n");
    scanf("%d",&qtdmoto);
    printf("Quantos carros?\n");
    scanf("%d",&qtdcar);
    printf("Quantos caminhões?\n");
    scanf("%d",&qtdcami);
    printf("\n");

    somaqtd = qtdcami+qtdcar+qtdmoto;

    // Inicializa o mutex da bomba de gasolina
    pthread_mutex_init(&bomba, NULL);

    // Organiza o abastecimento de acordo com Shortest Job First (SJF)
    organizar_abastecimento(tempo_moto, tempo_carro, tempo_caminhao, qtdmoto, qtdcar, qtdcami, somaqtd);

    // Destroi o mutex após o uso
    pthread_mutex_destroy(&bomba);
    
    printf("Todos os veículos foram abastecidos.");

    return 0;
}

// Grupo: 
// Eduardo Lucas Januário Lemes
// Guilherme Batista de Souza
// Lucas Marcelino
// Polayne da Silva Bastos