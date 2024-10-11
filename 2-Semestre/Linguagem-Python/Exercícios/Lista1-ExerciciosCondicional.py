#exercise3
n1 = int(input('digite um número: '))
n2 = int(input('digite outro número: '))

if n1 > n2:
    print(f'o número {n1} é maior do que o número {n2}')
elif n2 > n1:
    print(f'o número {n2} é maior do que o número {n1}')
else:
    print('os número são iguais')

#exercise4
n1 = int(input('digite um número: '))
n2 = int(input('digite outro número: '))
n3 = int(input('digite outro número: '))

lista =  [n1, n2, n3]
lista.sort()
print(lista)

#exercise6
n1 = int(input('Digite um número: '))

if(n1 % 2 == 0):
    print(f'o número {n1} é par')
else:
    print(f'o número {n1} é ímpar')

#exercise8
print('Menu de opções')
print('1. Somar dois números')
print('2. Raiz quadrada de um número')
op = int(input('Digite a opção desejada: '))

if op == 1:
    n1 = int(input('Digite um número: '))
    n2 = int(input('Digite outro número: '))
    print(f'A soma dos números é {n1 + n2}')
elif op == 2:
    n1 = int(input('Digite um número: '))
    raiz = n1 ** (1/2)
    print(f'A raiz quadrada de {n1} é {raiz}')
else:
    print('Opção inválida')

#exercise12
cod = int(input('Digite o código correspondente ao cargo de trabalho: '))
salAt = float(input('Digite seu salário atual: '))

if cod == 1:
    aumento = salAt * 0.5
    salNovo = salAt + aumento
    print(f'Cargo: Escrituário\nAumento: {aumento}\nNovo salário: {salNovo}')
elif cod == 2:
    aumento = salAt * 0.35
    salNovo = salAt + aumento
    print(f'Cargo: Secretário\nAumento: {aumento}\nNovo salário: {salNovo}')
elif cod == 3:
    aumento = salAt * 0.2
    salNovo = salAt + aumento
    print(f'Cargo: Caixa\nAumento: {aumento}\nNovo salário: {salNovo}')
elif cod == 4:
    aumento = salAt * 0.1
    salNovo = salAt + aumento
    print(f'Cargo: Gerente\nAumento: {aumento}\nNovo salário: {salNovo}')
elif cod == 5:
    print('Cargo: Diretor\nNão há aumento')
else:
    print('Código inválido')

#exercise14
salIn = float(input('Digite seu salário: '))

if salIn <= 500:
    novoSal = salIn * 1.05 + 150
    print(f'Seu novo salário é de {novoSal}')
elif salIn > 500 and salIn <= 1200:
    if salIn <= 600:
        auxEscola = 150
    else:
        auxEscola = 100
    novoSal = (salIn * 1.12) + auxEscola
    print(f'Seu novo salário é de {novoSal:.2f}')
elif salIn > 1200:
    novoSal = salIn + 100
    print(f'Seu novo salário é de {novoSal}')
