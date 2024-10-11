#exercise1
n1 = int(input("Digite um número"))
n2 = int(input("Digite um número"))
n3 = int(input("Digite um número"))
n4 = int(input("Digite um número"))

soma = n1+n2+n3+n4
print(soma)

#exercise2
nota1 = int(input("Digite uma nota"))
nota2 = int(input("Digite uma nota"))
nota3 = int(input("Digite uma nota"))

media = (nota1+nota2+nota3)/3
print(media)

#exercise3
nota1 = int(input("Digite uma nota"))
peso1 = int(input("Digite o peso"))

nota2 = int(input("Digite uma nota"))
peso2 = int(input("Digite o peso"))

nota3 = int(input("Digite uma nota"))
peso3 =  int(input("Digite o peso"))

mediaP = (nota1*peso1 + nota2*peso2 + nota3*peso3)/peso1 + peso2 + peso3
print(mediaP)

#exercise4
salario = float(input('Digite seu salario '))
aumento = salario * 1.25
print(aumento)

#exercise5
salario = float(input('Digite seu salario'))
percentual = float(input('Digite o eprcentual de aumento'))
novoSalario = (salario * (1 + percentual / 100))
print(novoSalario)

#exercise6
salario = float(input('Digite seu salario'))
novoSalario = salario * 1.05 - salario * 0.07
print(novoSalario)

#exercise7
salario = float(input('Digite seu salário'))
novoSalario = salario - (salario * 0.10) + 50
print(novoSalario)

#exercise8
deposito = float(input('Digite o valo do depósito '))
taxaJuro = float(input('Digite o percentual da taxa de juros '))
rendimento = deposito * taxaJuro
valorTotal = deposito + rendimento
print(f'rendimento: {rendimento}\n')
print(f'valor total: {valorTotal}')

#exercise9
base = float(input('Digite o valor da base '))
altura = float(input('Digite o valor da altura '))
area = (base*altura)/2
print(area)

#exercise10
raio = float(input('Digite o valor do raio '))
area = 3.14 * (raio**2)
print(area)
