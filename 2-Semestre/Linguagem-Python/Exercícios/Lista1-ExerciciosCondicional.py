#exercise3
n1 = int(input('digite um n�mero: '))
n2 = int(input('digite outro n�mero: '))

if n1 > n2:
    print(f'o n�mero {n1} � maior do que o n�mero {n2}')
elif n2 > n1:
    print(f'o n�mero {n2} � maior do que o n�mero {n1}')
else:
    print('os n�mero s�o iguais')

#exercise4
n1 = int(input('digite um n�mero: '))
n2 = int(input('digite outro n�mero: '))
n3 = int(input('digite outro n�mero: '))

lista =  [n1, n2, n3]
lista.sort()
print(lista)

#exercise6
n1 = int(input('Digite um n�mero: '))

if(n1 % 2 == 0):
    print(f'o n�mero {n1} � par')
else:
    print(f'o n�mero {n1} � �mpar')

#exercise8
print('Menu de op��es')
print('1. Somar dois n�meros')
print('2. Raiz quadrada de um n�mero')
op = int(input('Digite a op��o desejada: '))

if op == 1:
    n1 = int(input('Digite um n�mero: '))
    n2 = int(input('Digite outro n�mero: '))
    print(f'A soma dos n�meros � {n1 + n2}')
elif op == 2:
    n1 = int(input('Digite um n�mero: '))
    raiz = n1 ** (1/2)
    print(f'A raiz quadrada de {n1} � {raiz}')
else:
    print('Op��o inv�lida')

#exercise12
cod = int(input('Digite o c�digo correspondente ao cargo de trabalho: '))
salAt = float(input('Digite seu sal�rio atual: '))

if cod == 1:
    aumento = salAt * 0.5
    salNovo = salAt + aumento
    print(f'Cargo: Escritu�rio\nAumento: {aumento}\nNovo sal�rio: {salNovo}')
elif cod == 2:
    aumento = salAt * 0.35
    salNovo = salAt + aumento
    print(f'Cargo: Secret�rio\nAumento: {aumento}\nNovo sal�rio: {salNovo}')
elif cod == 3:
    aumento = salAt * 0.2
    salNovo = salAt + aumento
    print(f'Cargo: Caixa\nAumento: {aumento}\nNovo sal�rio: {salNovo}')
elif cod == 4:
    aumento = salAt * 0.1
    salNovo = salAt + aumento
    print(f'Cargo: Gerente\nAumento: {aumento}\nNovo sal�rio: {salNovo}')
elif cod == 5:
    print('Cargo: Diretor\nN�o h� aumento')
else:
    print('C�digo inv�lido')

#exercise14
salIn = float(input('Digite seu sal�rio: '))

if salIn <= 500:
    novoSal = salIn * 1.05 + 150
    print(f'Seu novo sal�rio � de {novoSal}')
elif salIn > 500 and salIn <= 1200:
    if salIn <= 600:
        auxEscola = 150
    else:
        auxEscola = 100
    novoSal = (salIn * 1.12) + auxEscola
    print(f'Seu novo sal�rio � de {novoSal:.2f}')
elif salIn > 1200:
    novoSal = salIn + 100
    print(f'Seu novo sal�rio � de {novoSal}')
