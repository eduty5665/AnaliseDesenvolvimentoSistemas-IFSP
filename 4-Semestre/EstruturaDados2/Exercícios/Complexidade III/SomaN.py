import timeit
import pandas as pd
import matplotlib.pyplot as plt

##Definição de Inputs
entradas_normais = [10, 100, 200, 300, 400]
entradas_leves = list(range(1, 21))  # para exponencial e fatorial

##Soma de números de 1 a n
# Iterativo
def soma_iterativa(n):
    """Calcula a soma de 1 a n de forma iterativa."""
    soma = 0
    for i in range(1, n + 1):
        soma += i
    return soma

##Soma de números de 1 a n
# Recursivo
def soma_recursiva(n):
    """Calcula a soma de 1 a n de forma recursiva."""
    if n == 1:
        return 1
    else:
        return n + soma_recursiva(n - 1)

##Soma de números de 1 a n
# Usando a fórmula diretamente
def soma_formula(n):
    """Calcula a soma de 1 a n usando a fórmula n*(n+1)/2."""
    return n * (n + 1) // 2

#cria variaveis para manipulação das funções
number_of_repetitions = 100
results = {}

#roda as funções com as diferentes entradas
for n in entradas_normais:
    results[f'soma_iterativa_{n}'] = timeit.timeit(f'soma_iterativa({n})', number=number_of_repetitions, globals=globals())

for n in entradas_leves:
    results[f'soma_recursiva_{n}'] = timeit.timeit(f'soma_recursiva({n})', number=number_of_repetitions, globals=globals())

for n in entradas_normais:
  results[f'soma_formula_{n}'] = timeit.timeit(f'soma_formula({n})', number=number_of_repetitions, globals=globals())

#Calcula os resultados colocando na tabela
results_df = pd.DataFrame.from_dict(results, orient='index', columns=['execution_time'])

#criação da tabela
results_df = results_df.reset_index()
results_df = results_df.rename(columns={'index': 'metric_and_input'})
results_df['algorithm'] = results_df['metric_and_input'].str.split('_').str[0:2].str.join('_')
results_df['input_size'] = results_df['metric_and_input'].str.split('_').str[-1].astype(int)
pivot_df = results_df.pivot(index='input_size', columns='algorithm', values='execution_time')
pivot_df = pivot_df.reset_index()
display(pivot_df) #mostra a tabela

#criação do grafico
plt.figure(figsize=(12, 6))

for column in pivot_df.columns:
    if column != 'input_size':
        plt.plot(pivot_df['input_size'], pivot_df[column], marker='o', linestyle='-', label=column)

plt.xlabel("Entradas (n)")
plt.ylabel("Tempo de Execução (s)")
plt.title("Algoritmo Tempo de Execução vs. Entradas")
plt.legend()
plt.grid(True)
plt.show()#mostra o grafico