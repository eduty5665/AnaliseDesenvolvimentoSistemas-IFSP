use hr;
/*Exercício 1:  Identificação e solução de Dirty Read*/

-- Sessão A
START TRANSACTION;

-- Atualiza o salário do funcionário 207 para 20000
UPDATE employees
SET salary = 20000
WHERE employee_id = 206;

-- Espera 15 segundos antes de confirmar
DO SLEEP(5);

-- Cancela a transação
ROLLBACK;
/*Aqui, o salário foi alterado, mas ainda não foi confirmado. A Transação B pode ver esse valor antes do COMMIT ou ROLLBACK.*/


/* Sessão B */
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

START TRANSACTION;

-- Lê o salário do funcionário 207
SELECT salary FROM employees WHERE employee_id = 206;

COMMIT;
/*Como o nível de isolamento é READ UNCOMMITTED, a Sessão B consegue ler o salário atualizado (20000),
mesmo que a Sessão A ainda não tenha feito COMMIT. Isso é uma leitura suja.*/

/*-------------------------------Solução-----------------------------------*/

/* Sessão B */
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

START TRANSACTION;

-- Agora a leitura vai esperar o COMMIT da Sessão A (ou ver o dado antigo)
SELECT salary FROM employees WHERE employee_id = 206;

COMMIT;
/*Assim, a Sessão B só vai enxergar o salário após a Transação A fazer COMMIT — evitando leitura incorreta.*/




/*Exercício 2: Phantom Read e nível SERIALIZABLE*/
-- Transação A (Rodar na Sessão 1)
USE hr;

SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;

-- Primeira leitura
SELECT employee_id, first_name, last_name FROM employees WHERE department_id = 50;

-- Espera 5 segundos
DO SLEEP(5);

-- Segunda leitura (pode vir com "phantoms")
SELECT employee_id, first_name, last_name FROM employees WHERE department_id = 50;

COMMIT;

-- Transação B (Rodar na Sessão 2)

START TRANSACTION;

INSERT INTO employees (employee_id, first_name, last_name, email, hire_date, job_id, salary, department_id)
VALUES 
(200, 'João', 'Miguel', 'joaoIt@example.com', CURDATE(), 'IT_PROG', 5000, 50),
(201, 'Lucas', 'Batista', 'lucasIt@example.com', CURDATE(), 'IT_PROG', 5000, 50);

COMMIT;
/* A Transação A verá funcionários a mais na segunda leitura.*/

/*---------------------------Solução---------------------------*/
-- Transação A (Sessão 1)
USE hr;

SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;

-- Primeira leitura
SELECT employee_id, first_name, last_name FROM employees WHERE department_id = 50;

-- Espera 5 segundos
DO SLEEP(5);

-- Segunda leitura (retornará o mesmo resultado)
SELECT employee_id, first_name, last_name FROM employees WHERE department_id = 50;

COMMIT;

-- Transação B (Sessão 2)

START TRANSACTION;

INSERT INTO employees (employee_id, first_name, last_name, email, hire_date, job_id, salary, department_id)
VALUES 
(3001, 'Novo1', 'Funcionario', 'novo1@example.com', CURDATE(), 'IT_PROG', 5000, 50),
(3002, 'Novo2', 'Funcionario', 'novo2@example.com', CURDATE(), 'IT_PROG', 5000, 50);

COMMIT;

/*Com SERIALIZABLE, o banco bloqueia inserções que afetem o resultado da consulta em andamento.*/

