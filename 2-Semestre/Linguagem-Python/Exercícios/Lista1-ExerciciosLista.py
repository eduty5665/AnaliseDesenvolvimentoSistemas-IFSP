# Exercício 1
lista = []
for i in range(9):
    num = int(input(f"Digite o {i+1}° número inteiro (posição {i}): "))
    lista.append(num)
for i in range(9):
    num = lista[i]
    primo = True
    if num < 2:
        primo = False
    else:
        for j in range(2, num):
            if num % j == 0:
                primo = False
                break
    if primo:
        print(f"Número primo: {num} na posição {i}")


# Exercício 6
lista = []
for i in range(10):
    num = int(input(f"Digite o {i+1}º número inteiro (posição {i}): "))
    lista.append(num)
print(f"Lista: {lista}")
lista.sort(reverse = True)
print(f"Lista em ordem decrescente: {lista}")


# Exercício 8
lista1 = []
for i in range(5):
    num = int(input(f"Digite o {i+1}º número inteiro (posição {i}): "))
    lista1.append(num)
print(f"\n1° lista: {lista1}")
lista1.sort()
print(f"1° lista ordenada de forma crescente: {lista1}\n")

lista2 = []
for i in range(5):
    num = int(input(f"Digite o {i+1}º número inteiro (posição {i}): "))
    lista2.append(num)
print(f"\n2° lista: {lista2}")
lista2.sort()
print(f"2° lista ordenada de forma crescente: {lista2}\n")

lista3 = lista1 + lista2
lista3.sort()
print(f"3° lista formada pela junção das duas listas, em ordem crescente: {lista3}")

#13
cont = 0
list = []
for i in range(10):
   n = int(input('Digite um número: '))
   list.append(n)

for a in range(10):
    if list[a] > 50:
      cont += 1
      print(f'Número: {list[a]}, posição: {a+1}')
    if cont < 0:
      print('Não há números maiores que 50')

#17
lista = []
qtd_impar = 0
qtd_par = 0
soma_par = 0
soma_impar = 0

for _ in range(6):
    n = int(input("Digite um valor: "))
    lista.append(n)

    if n % 2 == 0:
        qtd_par += 1
        soma_par += n
    else:
        qtd_impar += 1
        soma_impar += n

print("\nRelatório\n")
print(qtd_par, "números pares digitados:\n")

for i in range(len(lista)):
    if lista[i] % 2 == 0:
        print(f"Número {lista[i]} na posição {i}")

print("Soma dos pares =", soma_par, "\n")

print(qtd_impar, "números ímpares digitados:\n")

for i in range(len(lista)):
    if lista[i] % 2 != 0:
        print(f"Número {lista[i]} na posição {i}")

print("Soma dos ímpares =", soma_impar)