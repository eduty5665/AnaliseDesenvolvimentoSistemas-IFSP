.data 
   idade: .word 0
  
.text
   .globl main
 
main:
   la $t0, idade
   lw $t1, 0($t0)
   li $t2, 11

teste: 
   slt $t3, $t1, $t2  
   beq $t3, $zero, fim 
   
   move $a0, $t1      
   li $v0, 1           
   syscall

   li $a0, 10          
   li $v0, 11          
   syscall
   
   addi $t1, $t1, 1    
   sw $t1, 0($t0)
   
   j teste              
   
fim:
   li $v0, 10
   syscall
   
   
   