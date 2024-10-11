.data
  num:    .asciiz "Digite um número: "
  msgP:   .asciiz "O número é par.\n"
  msgI: .asciiz "O número é ímpar.\n"

.text
  .globl main

main:
  la $a0, num         
  li $v0, 4      
  syscall

  li $v0, 5            
  syscall
  move $t0, $v0        

  andi $t1, $t0, 1    
  beq $t1, $zero, numero_par  
  
numero_impar:
  li $v0, 4            
  la $a0, msgI   
  syscall
  j fim
  
numero_par:
  la $a0, msgP
  li $v0, 4      
  syscall

fim:
  li $v0, 10           
  syscall
   
