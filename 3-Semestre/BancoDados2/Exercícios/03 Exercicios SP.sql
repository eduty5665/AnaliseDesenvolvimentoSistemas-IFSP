/* Crie uma procedure chamada sp_contar_funcionarios_departamento que receba o nome de um departamento e retorne a quantidade de funcionários nesse departamento.

Crie uma procedure chamada sp_aumentar_salario que receba o nome do departamento e um percentual de aumento. Ela deve atualizar o salário de todos os funcionários do departamento correspondente.

Crie uma procedure chamada sp_inserir_funcionario que insira um novo funcionário na tabela employees. A procedure deve receber os seguintes parâmetros: first_name, last_name, email, phone_number, hire_date, job_id, salary, manager_id e department_id.
*/

#1
DELIMITER // 
CREATE PROCEDURE sp_contar_funcionarios_departamento( 
	IN in_department_name VARCHAR(30))
BEGIN 
	SELECT COUNT(e.employee_id)
    FROM employees e, departments d
    WHERE e.department_id=d.department_id AND d.department_name=in_department_name;
END
// DELIMITER ;


CALL sp_contar_funcionarios_departamento('Shipping');

#2
DELIMITER // 
CREATE PROCEDURE sp_aumentar_salario( 
	IN in_department_name VARCHAR(30),
    IN in_perc_aumento DECIMAL(
    ) 
BEGIN 
	SELECT COUNT(e.employee_id)
    FROM employees e, departments d
    WHERE e.department_id=d.department_id AND d.department_name=in_department_name;
END
// DELIMITER ;

#3
DELIMITER // 
CREATE PROCEDURE sp_inserir_funcionario( 
	IN employee_id INT (11),
    IN first_name VARCHAR(20),
    IN last_name VARCHAR(25),
	IN email VARCHAR(25),
	IN phone_number VARCHAR(20),
	IN hire_date DATE,
	IN job_id VARCHAR(10),
	IN salary DECIMAL(8, 2),
	IN commission_pct DECIMAL(2, 2),
	IN manager_id INT (11) UNSIGNED,
	IN department_id INT (11) UNSIGNED    
    ) 
BEGIN 
	INSERT INTO employees (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, comission_pct, manager_id, department_id)
    VALUES (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, comission_pct, manager_id, department_id);
END
// DELIMITER ;

