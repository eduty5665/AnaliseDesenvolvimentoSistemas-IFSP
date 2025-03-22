/*EXERCICIO LISTA 04 - FUNCTIONS*/

/* 1) Crie uma função chamada fn_media_salarial_departamento que receba o nome */
/*de um departamento e retorne a média salarial dos funcionários desse departamento. */

DELIMITER $$

CREATE FUNCTION fn_media_salarial_departamento(fc_department_name VARCHAR(30))
RETURNS DECIMAL (8,2)
DETERMINISTIC
BEGIN
    DECLARE media_salarial DECIMAL (8,2);
    SELECT AVG(salary) INTO media_salarial FROM employees WHERE department_id = (SELECT department_id FROM departments WHERE department_name = fc_department_name);
    RETURN media_salarial;
END$$

DELIMITER ;

/* 2) Crie uma função chamada fn_verificar_gerente que receba um ID de funcionário*/ 
/*e retorne 1 se ele for gerente de algum departamento e 0 caso contrário.*/

DELIMITER $$

CREATE FUNCTION fn_verificar_gerente(employee_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE is_manager INT;
    
    -- Verifica se o funcionário é gerente em algum departamento
    SELECT COUNT(*) INTO is_manager 
    FROM departments 
    WHERE manager_id = employee_id;

    -- Retorna 1 se for gerente, 0 caso contrário
    RETURN IF(is_manager > 0, 1, 0);
END$$

DELIMITER ;

/* 3) Crie uma função chamada fn_tempo_empresa que receba o ID de um funcionário */
/*e retorne o número de anos completos que ele está na empresa.*/

DELIMITER $$

CREATE FUNCTION fn_tempo_empresa(fc_employee_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN TIMESTAMPDIFF(YEAR, (SELECT HireDate FROM employees WHERE employee_id = fc_employee_id), CURDATE());
END$$

DELIMITER ;