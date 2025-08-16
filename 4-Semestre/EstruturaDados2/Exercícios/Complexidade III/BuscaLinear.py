import timeit
import random
import pandas as pd
import matplotlib.pyplot as plt

#Busca linear de um elemento
# 3. Busca linear
def busca_linear(lista, alvo):
    for i in range(len(lista)):
        if lista[i] == alvo:
            return i
    return -1

#variaveis para manipulação das funções
def medir_tempo():
    """Executa os algoritmos com diferentes entradas e mede o tempo."""

    # Entradas definidas conforme a especificação
    entradas_normais = [10, 100, 200, 300, 400]
    entradas_leves = list(range(1, 21))  # para exponencial e fatorial
    entradas_busca = []

    # Dicionário para armazenar todos os resultados
    resultados = {        
        "Busca1": {
            "Linear": {"entradas": entradas_normais, "tempos": []},
        }
    }

    # Número de repetições para o timeit (para obter médias mais estáveis)
    num_repeticoes = 100

    # --- Medição para Buscas ---
    # Para buscas, o tempo depende do tamanho da lista e da posição do alvo.
    # Usaremos o pior caso: o elemento não está na lista.
    for n in entradas_normais:
        lista_ordenada = list(range(n))
        alvo = -1 # Pior caso: alvo não existe

        t = timeit.timeit(lambda: busca_linear(lista_ordenada, alvo), number=num_repeticoes)
        resultados["Busca1"]["Linear"]["tempos"].append(t)

    return resultados

def exibir_tabela_de_resultados(resultados):
    """
    Pega o dicionário de resultados e exibe os dados em tabelas formatadas no console.

    Args:
        resultados (dict): O dicionário contendo os dados de tempo de execução.
    """
    print("\n" + "="*60)
    print(" " * 15 + "TABELAS DE TEMPO DE EXECUÇÃO")
    print("="*60)

    # Itera sobre cada grupo de algoritmos (ex: "Soma de 1 a n")
    for titulo_grupo, dados_grupo in resultados.items():

        # 1. Coleta todas as entradas únicas e os nomes dos algoritmos para o cabeçalho
        todas_entradas = set()
        nomes_algoritmos = list(dados_grupo.keys())
        for dados_algoritmo in dados_grupo.values():
            todas_entradas.update(dados_algoritmo['entradas'])

        entradas_ordenadas = sorted(list(todas_entradas))

        # 2. Cria um mapa de tempo para fácil acesso: {nome_alg: {entrada: tempo}}
        mapa_tempos = {}
        for nome_alg, dados_alg in dados_grupo.items():
            mapa_tempos[nome_alg] = dict(zip(dados_alg['entradas'], dados_alg['tempos']))

        # 3. Imprime o cabeçalho da tabela
        # Define a largura das colunas para alinhamento
        largura_coluna_entrada = 12
        largura_coluna_tempo = 20

        header = f"{'Entrada (n)':<{largura_coluna_entrada}}"
        for nome in nomes_algoritmos:
            header += f"| {nome + ' (s)':<{largura_coluna_tempo}}"
        print(header)
        print("-" * len(header))

        # 4. Imprime as linhas de dados
        for entrada in entradas_ordenadas:
            linha_str = f"{entrada:<{largura_coluna_entrada}}"
            for nome_alg in nomes_algoritmos:
                # Usa .get() para encontrar o tempo. Se não existir para essa entrada, retorna 'N/A'
                tempo = mapa_tempos[nome_alg].get(entrada)

                if tempo is not None:
                    # Formata o tempo para 8 casas decimais
                    tempo_str = f"{tempo:.8f}"
                else:
                    tempo_str = "N/A"

                linha_str += f"| {tempo_str:<{largura_coluna_tempo}}"
            print(linha_str)

def gerar_graficos(resultados):
    """Gera gráficos separados para cada categoria de algoritmo."""

    for titulo, dados_algoritmo in resultados.items():
        plt.figure(figsize=(10, 6)) # Cria uma nova figura para cada gráfico

        for tipo, dados in dados_algoritmo.items():
            plt.plot(dados["entradas"], dados["tempos"], marker='o', linestyle='-', label=tipo)

        plt.title(f'Desempenho: Busca Linear')
        plt.xlabel('Tamanho da Entrada (n)')
        plt.ylabel(f'Tempo de Execução (s) - Média de {100} repetições')
        plt.grid(True)
        plt.legend()
        # Escala logarítmica pode ser útil para visualizar grandes diferenças,
        # especialmente no eixo Y. Ex: plt.yscale('log')
        plt.xscale('linear') # Garante escala linear no eixo X
        plt.yscale('linear') # Garante escala linear no eixo Y

    plt.show() # Exibe todos os gráficos criados

# --- Bloco de Execução Principal ---
if __name__ == "__main__":
    # 1. Executa a medição para obter os dados de tempo
    dados_de_tempo = medir_tempo()

    # 2. Chama a nova função para exibir os dados em tabelas
    exibir_tabela_de_resultados(dados_de_tempo)

    # 3. Gera os gráficos como antes (opcional)
    gerar_graficos(dados_de_tempo)

