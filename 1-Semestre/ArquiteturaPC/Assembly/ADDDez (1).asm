.data
   
.text
   .globl main
   
main:
   li $t0, 10
   li $t1, 0
   li $t2, 0
   li $t3, 11
   
soma:
   add $t1, $t1, $t0
   sub $t0, $t0, 1
   addi $t2, $t2, 1
   
   beq $t2, $t3, fim
   j soma
   
fim: 
   move $a0, $t1
   li $v0, 1
   syscall
   li $v0, 10
   syscall