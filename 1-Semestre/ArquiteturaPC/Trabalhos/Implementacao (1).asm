.data 
   msg: .asciiz "Vamos calcular, escolha: soma(1), subtração(2), multiplicação(3), divisão(4), exponenciação(5)"
   num1: .asciiz "Digite um valor"
   num2: .asciiz "Digite outro valor"
   result: .asciiz "O resultado é: "
   falha: .asciiz "Digite valores válidos"
.text 
   .globl main
   
main:
   la $a0, msg
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   li $v0, 5
   syscall 
   move $t0, $v0 #opção de cálculo
   
   #teste
   li $t1, 6
   slt $t3, $t0, $t1
   beqz $t3, erro
   
   #desvio soma
   li $t1, 1
   beq $t0, $t1, soma
   
   #desvio subtração
   li $t2, 2
   beq $t0, $t2, subtracao
   
   #desvio multiplicação
   li $t3, 3
   beq $t0, $t3, multiplicacao
   
   #desvio divisão
   li $t4, 4
   beq $t0, $t4, divisao
   
   #desvio exponenciação
   li $t5, 5
   beq $t0, $t5, exponenciacao
   
erro: 
   la $a0, falha
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   j main
   
soma: 
   la $a0, num1
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #primeiro valor
   li $v0, 5
   syscall 
   move $t0, $v0
   
   la $a0, num2
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #segundo valor
   li $v0, 5
   syscall 
   move $t1, $v0
   
   add $t2, $t0, $t1
   
   la $a0, result
   li $v0, 4
   syscall
   
   move $a0, $t2
   li $v0, 1
   syscall
   
   j fim
   
subtracao:
   la $a0, num1
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #primeiro valor
   li $v0, 5
   syscall 
   move $t0, $v0
   
   la $a0, num2
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #segundo valor
   li $v0, 5
   syscall 
   move $t1, $v0
   
   sub $t2, $t0, $t1
   
   la $a0, result
   li $v0, 4
   syscall 
   
   move $a0, $t2
   li $v0, 1
   syscall
   
   j fim
   
multiplicacao:
   la $a0, num1
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #primeiro valor
   li $v0, 5
   syscall 
   move $t0, $v0
   
   la $a0, num2
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #segundo valor
   li $v0, 5
   syscall 
   move $t1, $v0
   
   mul $t2, $t0, $t1
   
   la $a0, result
   li $v0, 4
   syscall 
   
   move $a0, $t2
   li $v0, 1
   syscall
   
   j fim
divisao:
   la $a0, num1
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #primeiro valor
   li $v0, 5
   syscall 
   move $t0, $v0
   
   beqz $t0, erro
   
   la $a0, num2
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #segundo valor
   li $v0, 5
   syscall 
   move $t1, $v0
   
   beqz $t1, erro
   
   div $t0, $t1
   mflo $t2
   
   la $a0, result
   li $v0, 4
   syscall    

   move $a0, $t2
   li $v0, 1
   syscall
   
   j fim
exponenciacao:
   la $a0, num1
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #primeiro valor
   li $v0, 5
   syscall 
   move $t0, $v0
   
   la $a0, num2
   li $v0, 4
   syscall
   
   li $v0, 11
   li $a0, 10
   syscall
   
   #segundo valor
   li $v0, 5
   syscall 
   move $t1, $v0
   
   li $t2, 1
   
laco:
   beqz $t1, fimlaco
   mul $t2, $t2, $t0
   sub $t1, $t1, 1   
   j laco
         
fimlaco:    
   la $a0, result
   li $v0, 4
   syscall  
   
   move $a0, $t2
   li $v0, 1
   syscall
   
fim: 
   li $v0, 11
   li $a0, 10
   syscall
   j main
