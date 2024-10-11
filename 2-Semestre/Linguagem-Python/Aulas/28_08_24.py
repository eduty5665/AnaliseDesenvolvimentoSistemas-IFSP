#exemplo12
x, y, z = 5, 10, 8
print("x, y, z")
print(x, y, z)
x, y, z = z, y, x
print(x, y, z)

#exemplo13
#leia tres numeros
number1 = int(input("Digite o primeiro numero"))
number2 = int(input("Digite o segundo numero"))
number3 = int(input("Digite o terceiro numero"))

#verifica qual o maior e passa a variavel maior
largest_number = max(number1, number2, number3)
print(largest_number)

#imprime o resultado
print("O maior numero é: ", largest_number)

#exemplo14
income = float(input("Entre com os rendimentos anuais"))
if income < 85528:
    tax = income * 0.18 - 556.02
else:
    tax = (income - 85528) * 0.32 + 14839
if tax <= 0:
    tax = 0.0
tax = round(tax, 0)
print("A taxa é: ", tax, "thalers")

#exemplo15
idade = int(input("Qual a sua idade? "))
if idade>=18:
    print("A pessoa é maior de idade")
print("FIM DO PROGRAMA")

#exemplo16
idade = int(input("Qual a sua idade? "))
if idade>=18:
    print("A pessoa é maior de idade")
if idade<18:
    print("A pessoa é menor de idade")
print("FIM DO PROGRAMA")

#exemplo17
media = int(input("Digite a nota final do aluno: "))
if (media>=50):
    print("O aluno foi aprovado.")
else:
    print("O aluno foi reprovado.")
print("FIM DO PROGRAMA")

#exemplo18
nota = float(input("Digite a nota do aluno: "))
if(nota>=9):
    print("Conceito Final: A")
elif(nota>=7):
    print("Conceito Final: B")
elif(nota>=6):
    print("Conceito Final: C")
elif(nota>=5):
    print("Conceito Final: D")
else:
    print("Conceito Final: F")
print("FIM DO PROGRAMA")

#exemplo19
numero = int(input("Digite um numero para calculo de tabuada: \n"))
print(f" (numero) x 1 = (numero*1)")
print(f" (numero) x 2 = (numero*2)")
print(f" (numero) x 3 = (numero*3)")
print(f" (numero) x 4 = (numero*4)")
print(f" (numero) x 5 = (numero*5)")
print(f" (numero) x 6 = (numero*6)")
print(f" (numero) x 7 = (numero*7)")
print(f" (numero) x 8 = (numero*8)")
print(f" (numero) x 9 = (numero*9)")
print(f" (numero) x 10 = (numero*10)")
print("FIM DO PROGRAMA")

#exemplo20
entrada_1 = True
entrada_2 = False
print(entrada_1 and entrada_2)

entrada_1 = True
entrada_2 = True
print(f"(entrada_1) and (entrada_2) = (entrada_1 and entrada_2)")

print(((2*2=3) == 7) and ((2+2) != 3) and (5*2==10))

entrada_1 = False
entrada_2 = False
resultado = entrada_1 or entrada_2
print(resultado)

entrada_1 = True
entrada_2 = False
resultado = entrada_1 or entrada_2
print(resultado)

print(((2*2=3) == 6) and ((2+2) != 4) and (1+9!=10))

entrada_1 = True
entrada_2 = False
entrada_3 = True
resultado = ((entrada_1 and entrada_2) or entrada_3)
print(resultado)

entrada = True
resultado = not entrada
print(resultado)

entrada = False
resultado = not entrada
print(resultado)

entrada_1 = True
entrada_2 = False
entrada_3 = True
resultado = ((entrada_1 and entrada_2) or entrada_3)
print(resultado)
