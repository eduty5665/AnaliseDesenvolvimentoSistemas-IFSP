.data
   msg: .asciiz "Digite um número: "

.text
   .globl main

main:
   la $a0, msg
   li, $v0, 4
   syscall
   
   li $v0, 5
   syscall
   move $t0, $v0
   move $t1, $t0
   li $t2, 1
   li $t3, 1
   
calc:
   mul $t2, $t2, $t1
   sub $t1, $t1, 1
   
   beq $t1, $t3, fim
   j calc
   
fim: 
   move $a0, $t2
   li $v0, 1
   syscall
   li $v0, 10
   syscall
   
   
   