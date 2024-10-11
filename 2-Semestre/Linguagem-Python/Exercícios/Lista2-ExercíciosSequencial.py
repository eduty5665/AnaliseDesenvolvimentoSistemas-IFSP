#exercise11
num = float(input('Digite um número: '))
print(num**2)
print(num**3)
print(num**1/2)
print(num**1/3)

#exercise12
n1 = float(input('Digite um número: '))
n2 = float(input('Digite outro número: '))
print(n1**n2)

#exercise13
po = 12
ja = 1/3
mi = 1/5280

medida = float(input('Digite uma medida em pés: '))
print(medida*po)
print(medida*ja)
print(medida*mi)

#exercise14
anoNasc = int(input('Digite seu ano de nascimento: '))
anoAtual = int(input('Digite o ano atual: '))
print(anoAtual - anoNasc)
print(2050 - anoNasc)

#exercise15
precoFabrica = float(input('Digite o preço de fábrica do carro: '))
percentualLucro = float(input('Digite o percentual de lucro do distribuidor: '))
percentualImposto = float(input('Digite o percentual de imposto: '))
lucro = float(precoFabrica * percentualLucro)
imposto = float(precoFabrica * percentualImposto)
print(f'lucro: {lucro}')
print(f'imposto: {imposto}')
print(f'preço final: {precoFabrica+lucro+imposto}')

#exercise16
horas = int(input('Digite a quantidade de horas trabalhadas: '))
salarioMinimo = float(input('Digite o valor do salário mínimo: '))
horaTrabalhada = salarioMinimo / 2
salarioBruto = horas * horaTrabalhada
imposto = salarioBruto * 0.03
salarioReceber = salarioBruto - imposto
print(f'Salário a receber: {salarioReceber}')

#exercise17
salarioRecebido = float(input('Digite o valor do salário recebido: '))
cheque1 = float(input('Digite o valor do primeiro cheque: '))
cheque2 = float(input('Digite o valor do segundo cheque: '))
saldoFinal = salarioRecebido - ((cheque1 * 1.38) + (cheque2 * 1.38))
print(f'Saldo final: {saldoFinal}')

#exeercise18
pesoSaco = float(input('Informe o peso do saco de ração em Kg: '))
quantGato = float(input('Informe a quantidade de ração para cada gato em gramas: '))
resto = pesoSaco - ((quantGato *2 * 5)/1000)
print(f'Restará {resto}Kg de ração no saco')
