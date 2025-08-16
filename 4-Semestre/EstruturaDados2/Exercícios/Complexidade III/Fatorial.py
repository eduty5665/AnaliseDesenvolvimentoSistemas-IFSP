import timeit
import pandas as pd
import matplotlib.pyplot as plt

##Definição de Inputs
entradas_normais = [10, 100, 200, 300, 400]
entradas_leves = list(range(1, 21))  # para exponencial e fatorial

##Fatorial de um numero
# Iterativo
def fatorial_iterativo(n):
    """Calcula o fatorial de um número de forma iterativa."""
    if n == 0:
        return 1
    else:
        resultado = 1
        for i in range(1, n + 1):
            resultado *= i
        return resultado

##Fatorial de um numero
# Recursivo
def fatorial_recursivo(n):
    """Calcula o fatorial de um número de forma recursiva."""
    if n == 0 or n == 1:
        return 1
    else:
        return n * fatorial_recursivo(n - 1)

#variaveis para manipulação das funções
number_of_repetitions = 100
results = {}

#roda as funções
for n in entradas_normais:
    results[f'fatorial_iterativo_{n}'] = timeit.timeit(f'fatorial_iterativo({n})', number=number_of_repetitions, globals=globals())

for n in entradas_leves:
    results[f'fatorial_recursivo_{n}'] = timeit.timeit(f'fatorial_recursivo({n})', number=number_of_repetitions, globals=globals())

#criação da tabela
results_df = pd.DataFrame.from_dict(results, orient='index', columns=['execution_time'])

results_df = results_df.reset_index()
results_df = results_df.rename(columns={'index': 'metric_and_input'})
results_df['algorithm'] = results_df['metric_and_input'].str.split('_').str[0:2].str.join('_')
results_df['input_size'] = results_df['metric_and_input'].str.split('_').str[-1].astype(int)
pivot_df = results_df.pivot(index='input_size', columns='algorithm', values='execution_time')
pivot_df = pivot_df.reset_index()
display(pivot_df)#mostra a tabela

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