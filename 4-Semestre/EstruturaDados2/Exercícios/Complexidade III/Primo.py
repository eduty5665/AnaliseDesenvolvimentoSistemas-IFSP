import timeit
import pandas as pd
import matplotlib.pyplot as plt
import random # Import random to use random.choice later if needed, though not for the primo function

##Verifica se um numero é primo
def primo(n):
    """Verifica se um número é primo de forma iterativa."""
    if n <= 1:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    # Verifica apenas divisores ímpares até a raiz quadrada de n
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True

def medir_tempo():
    """Executa os algoritmos com diferentes entradas e mede o tempo."""

    # Entradas definidas conforme a especificação
    ##Definição de Inputs
    entradas_normais = [10, 100, 1000, 10000]
    entradas_leves = list(range(1, 21))  # para exponencial e fatorial
    entradas_busca = []

    # Dicionário para armazenar todos os resultados
    resultados = {
        "Verificação de Primo": {
            "Iterativo": {"entradas": entradas_normais, "tempos": []}
        }
    }

    # Número de repetições para o timeit (para obter médias mais estáveis)
    num_repeticoes = 100


    # --- Medição para Verificação de Primo ---
    # O tempo de verificação de primos pode variar muito. Usaremos n+1 para ter um caso consistente.
    for n in entradas_normais:
        # Usamos n + 1 (ou um número ímpar próximo) para evitar números pares fáceis de checar
        numero_para_checar = n + 1
        t = timeit.timeit(lambda: primo(numero_para_checar), number=num_repeticoes)
        resultados["Verificação de Primo"]["Iterativo"]["tempos"].append(t)
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

# =============================================================================
# PARTE 3: GERAÇÃO DE GRÁFICOS
# =============================================================================

def gerar_graficos(resultados):
    """Gera gráficos separados para cada categoria de algoritmo."""

    for titulo, dados_algoritmo in resultados.items():
        plt.figure(figsize=(10, 6)) # Cria uma nova figura para cada gráfico

        for tipo, dados in dados_algoritmo.items():
            plt.plot(dados["entradas"], dados["tempos"], marker='o', linestyle='-', label=tipo)

        plt.title(f'Desempenho: Primo')
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
