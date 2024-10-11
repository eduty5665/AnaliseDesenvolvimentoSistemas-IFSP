#exemplo 001 Operadores Relacionais

print(2==2)

#exemplo 002

print(2!=2)

#exemplo 003

n = int(input("Digite numeros: "))
print(n>100)

#exemplo 004

n = int(input("Diite numeros: "))
print(n>=100)

#exemplo 005

n = int(input("Diite numeros: "))
print(n<100)

#exemplo 006
n = int(input("Diite numeros: "))
print(n<=100)

#exemplo 007
x=10
if x>5:
    print("Maior que 5")
if x<10:
    print("Menor que 10")
if x==10:
    print("Igual a 10")

#oneteste
num = int(input("Digite numero: "))
if num < 0:
    print("Menor 0")
elif num == 5:
    print("Igual 5")
else:
    print("Maior 5")

#exemplo 008
x=10
if x<10:
    print("Menor que")
else:
    print("Maior ou Igual")


#exemplo 009
x=10
if x>5:
    print("x>5")
if x>8:
    print("x>8")
if x>10:
    print("x>10")
else:
    print("Else sendo executado")
    
#exemplo 010
x=10
if x>5:
    if x==6:
        print('x==6')
    elif x==10:
        print("x==10")
    else:
        print("else elif sendo executado")
else:
    print("Else sendo executado")
    
#exemplo 011
a = 3
b = 2
if a%b == 0:
    print("par")
else:
    print("impar")
