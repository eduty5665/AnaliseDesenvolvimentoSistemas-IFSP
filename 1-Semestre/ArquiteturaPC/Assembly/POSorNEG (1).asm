.data
   inicio: .asciiz "Digite um número: "
   msgP: .asciiz "O número é positivo"
   msgN: .asciiz "O número é negativo"
   msgZ: .asciiz "O número é zero"
   
.text
   .globl main
   
main:
   la $a0, inicio
   li $v0, 4
   syscall
  
   li $v0, 5
   syscall
   move $t0, $v0
   li $t1, 1
   
   beqz $t0, valorZero
   
   addi $t0, $t0, 1
   slt $t2, $t0, $t1
   beq $t2, $t1, valorNeg
   
   j valorPos
   
valorZero:
   la $a0, msgZ
   li $v0, 4
   syscall
   j fim
   
valorNeg:
   la $a0, msgN
   li, $v0, 4
   syscall
   j fim
   
valorPos:
   la $a0, msgP
   li $v0, 4
   syscall
   
fim:
   li $v0, 10
   syscall
