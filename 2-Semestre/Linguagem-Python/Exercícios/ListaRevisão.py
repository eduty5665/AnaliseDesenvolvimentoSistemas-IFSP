#1. Faça um programa contendo uma função que retorne 1 se o número for positivo ou 0 se for negativo.

def VerifNum(n):
    if (n>0):
        return 1
    elif (n<0):
        return 0
    
n=int(input("Insira um numero:"))
while (n==0):
    n=int(input("Insira um número diferente de 0: "))
print(VerifNum(n))

#2. Faça um programa contendo uma função que receba dois números positivos por
#parâmetro e retorne a soma dos N números inteiros existentes entre eles.

def SomaNum(a,b):
    soma=0
    for a in range(a+1,b):
        soma+=a
    return(soma)

x=int(input("Insira o primeiro número: "))
y=int(input("Insira o segundo número: "))
print(f"A soma dos números entre {x} e {y} é {SomaNum(x,y)}")

"""3. Faça um programa contendo uma função que receba três números inteiros "a", "b"
e "c", sendo "a" maior que 1. A sub-rotina deverá somar todos os números inteiros
entre "b" e "c" que sejam divisíveis por "a” (inclusive "b" e "c") e retornar o resultado
para ser impresso."""

def SomaNum(a,b,c):
    soma=0
    for i in range(b+1,c):
        if (i%a==0):
            soma+=i
    return(soma)

x=int(input("Insira o primeiro número: "))
y=int(input("Insira o segundo número: "))
z=int(input("Insira o terceiro número: "))
print(f"A soma dos números entre {y} e {z} divisiveis por {x} é {SomaNum(x,y,z)}")

"""5. Crie um programa que receba valores antigo atual de um produto, chame uma
função que determine o percentual de acréscimo entre esses valores. O resultado
deverá ser mostrado no programa principal."""

def Acresc(x,y):
    perc=((x/y)-1)
    return(perc)

precoAnt=float(input("Insira o preço antigo do produto: "))
precoNovo=float(input("Insira o preço novo do produto: "))
print(f"O percentual de aumento entre {precoAnt} e {precoNovo} foi de {Acresc(precoNovo, precoAnt)*100:.2f}%")


#9. Faça uma função que leia cinco valores inteiros, determine e mostre o maior e menor deles.

def VerificaValores(nums):
    print(f"O menor valor é: ", min(nums))
    print(f"O maior valor é: ", max(nums))

nums=[]
for i in range(5):
    n=int(input(f"Insira o {i+1}º número: "))
    nums.append(n)
VerificaValores(nums)



#10. Crie uma função que receba como parâmetro um valor inteiro e positivo N e retorne
#o valor de S, obtido pelo seguinte cálculo:
# S=1+(1/1!)+(1/2!)+(1/3!)...+(1/N!)

def SomaFatoriais(x):
    soma=1
    for i in range (1, x+1):
        fatorial=1
        for j in range(1, i+1):
            fatorial*=j
        soma+=1/fatorial
    return(soma)

n=int(input("Insira um número: "))
print(f"A soma da equação é: {SomaFatoriais(n):.7f}")