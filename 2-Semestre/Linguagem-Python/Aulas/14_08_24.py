#exemplo 1
print("Ola mundo python")

#exemplo 2
print("Ola mundo teste 2 em python")

#exemplo 3
input()

#exemplo 4
print("Digite seu nome ")
input()

#exemplo 5
input("Digite seu nome ")

#exemplo 6
idade = 20
print(type(idade))

#exemplo 7
idade = "20"
print(type(idade))

#exemplo 8
altura = 1.87
print(type(altura))

#exemplo 9
altura = float("1.87")
print(type(altura))

#exemplo 10
idade = int(20.8)
print(type(idade))

#exemplo 11
texto = str(20)
print(type(texto))

#exemplo 12
teste = True
print(type(teste))

#exemplo 13
print("Douglas \n Godoy")
print("Douglas", "Godoy")

#exemplo 14
john=4
mary=5
adam=6
print(john, mary, adam, sep=',')
total_apples = john + mary + adam
print(total_apples)

#exemplo 15
print(0o123)
print(0x123)

print(11_111_11)

print(3E8)

#exemplo 16
a = 2
b = 2

print(a/b)
print(a%b)
print(a//b)
print(a**b)

#exemplo 17
i = 1
i = i + 1
print(i)
i+=1
print(i)

#exemplo 18
anything = input("Conta-me qualquer coisa...")
print("Hummm...", anything, "... realmente?")

#exemplo 19
#Erro srt and float
anything = input("Digite um numero: ")
something = anything ** 2.0
print(anything, " elevado a 2 é ", something)

#srt and float
anything = float(input("Digite um numero: "))
something = anything ** 2.0
print(anything, " elevado a 2 é ", something)

#exemplo 20
fname = 'douglas'
lname = "godoy"
print("\n Seu nome completo é "+fname+""lname+".")

#exemplo 21
print("Lógica"*3)

z = 2.5
print(type(z))

a = ((2**2)**3)
print(a)

b = 2**2**3
print(b)

#exemplo 22
x = 0
x = float(x)
y = (3*(x**3)) - (2*(x**2)) + (3*x) - 1
print ("y = ", y)

#exemplo 23
x = input("Digite um numero: ")
print(type(float(x)))

x = int(input())
y = int(input())

x = x//y
y = y//x

#exemplo 24 IMC
#Entrada de Dados
altura = input("Digite sua altura: ")
peso = input("Digite seu altura: ")
idade = input("Digite sua altura: ")
#Processamento
altura = float(altura)
peso = float(peso)
idade = float(idade)
imc = peso / (altura*altura)
#Saida
print(imc)

#exemplo 25
#Entrada de Dados
altura = float(input("Digite sua altura: "))
peso = float(input("Digite seu altura: "))
idade = float(input("Digite sua altura: "))
#Processamento
imc = peso / (altura*altura)
#Saida
print(f"O seu IMC é igual à: ", (imc:.2f), " e sua idade igual à: ", (idade))

