/*1.Crie uma procedure que utilize um cursor para percorrer todos os empregados do departamento 90, exibindo no console o nome completo e o salário de cada um.
( DECLARE, OPEN, FETCH, e CLOSE)*/
DELIMITER $$

CREATE PROCEDURE ShowEmployeesDept90()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_first_name VARCHAR(50);
    DECLARE emp_last_name VARCHAR(50);
    DECLARE emp_salary DECIMAL(10,2);

    DECLARE cur CURSOR FOR
        SELECT first_name, last_name, salary
        FROM employees
        WHERE department_id = 90;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    CREATE TABLE IF NOT EXISTS dept90_employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100),
        salary DECIMAL(10,2)
    );

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO emp_first_name, emp_last_name, emp_salary;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Inserir os dados na tabela
        INSERT INTO dept90_employees (full_name, salary)
        VALUES (CONCAT(emp_first_name, ' ', emp_last_name), emp_salary);
    END LOOP;

    CLOSE cur;

    -- Mostrar os dados inseridos
    SELECT * FROM dept90_employees;
END$$

DELIMITER ;

CALL ShowEmployeesDept90();


/*2.Crie uma procedure que percorra todos os empregados e calcule a soma total dos salários usando um cursor.
 Ao final, exiba o total com SELECT.*/


DELIMITER $$

CREATE PROCEDURE SumAllSalaries()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_salary DECIMAL(10,2);
    DECLARE total_salary DECIMAL(15,2) DEFAULT 0.00;

    -- Cursor para pegar todos os salários
    DECLARE cur CURSOR FOR
        SELECT salary FROM employees;

    -- Handler para fim dos dados
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Abrir o cursor
    OPEN cur;

    -- Loop para somar os salários
    read_loop: LOOP
        FETCH cur INTO emp_salary;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET total_salary = total_salary + emp_salary;
    END LOOP;

    CLOSE cur;

    SELECT total_salary AS total_salaries;
END$$

DELIMITER ;

CALL SumAllSalaries();

 
 /*3.Implemente uma procedure que use um cursor para percorrer os empregados do departamento 100. 
 Para cada um, aplique um aumento de 5% no salário utilizando UPDATE.*/
 
 DROP TABLE IF EXISTS salary_changes;
 
CREATE TABLE salary_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED,  -- Usando o mesmo tipo de dados (INT UNSIGNED)
    old_salary DECIMAL(10,2),
    new_salary DECIMAL(10,2),
    change_time DATETIME DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);


DELIMITER $$

CREATE PROCEDURE AumentoDept100()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_id INT;
    DECLARE emp_salary DECIMAL(10,2);
    DECLARE novo_salario DECIMAL(10,2);
    DECLARE existe INT;

    -- Cursor para percorrer os funcionários do departamento 100
    DECLARE cur CURSOR FOR
        SELECT employee_id, salary
        FROM employees
        WHERE department_id = 100;

    -- Handler para fim dos dados
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO emp_id, emp_salary;

        IF done THEN
            LEAVE read_loop;
        END IF;

        SET novo_salario = emp_salary * 1.05;

        -- Atualiza o salário no employees
        UPDATE employees
        SET salary = novo_salario
        WHERE employee_id = emp_id;

        -- Verifica se o funcionário já existe na tabela salary_changes
        SELECT COUNT(*) INTO existe
        FROM salary_changes
        WHERE employee_id = emp_id;

        -- Se já existir, faz UPDATE do histórico
        IF existe > 0 THEN
            UPDATE salary_changes
            SET old_salary = emp_salary,
                new_salary = novo_salario,
                change_time = NOW()
            WHERE employee_id = emp_id;
        ELSE
            -- Se não existir, faz INSERT para novo registro
            INSERT INTO salary_changes (employee_id, old_salary, new_salary)
            VALUES (emp_id, emp_salary, novo_salario);
        END IF;
    END LOOP;

    CLOSE cur;

    -- Exibe os funcionários do departamento 100 com o salário atualizado
    SELECT employee_id, first_name, last_name, salary
    FROM employees
    WHERE department_id = 100;
END$$

DELIMITER ;

CALL AumentoDept100();

/*4.Crie uma procedure com um cursor que percorra os empregados com salário acima de 10.000. 
Utilize a estrutura CONTINUE HANDLER para tratar o fim do cursor corretamente.
 Para cada empregado, exiba o nome completo e cargo (job_id).
(Praticar o controle de fluxo com tratamento adequado do NOT FOUND.)*/
 
 CREATE TABLE IF NOT EXISTS EmployeeSalary10000 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    job_id VARCHAR(10)
);

DELIMITER $$

CREATE PROCEDURE EmployeeSalaryOver()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_first_name VARCHAR(50);
    DECLARE emp_last_name VARCHAR(50);
    DECLARE emp_job_id VARCHAR(10);
    DECLARE full_name VARCHAR(100);

    DECLARE cur CURSOR FOR 
        SELECT first_name, last_name, job_id
        FROM employees
        WHERE salary > 10000;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO emp_first_name, emp_last_name, emp_job_id;

        IF done THEN
            LEAVE read_loop;
        END IF;

        SET full_name = CONCAT(emp_first_name, ' ', emp_last_name);

        INSERT INTO EmployeeSalary10000 (full_name, job_id)
        VALUES (full_name, emp_job_id);

    END LOOP;

    CLOSE cur;

    SELECT * FROM EmployeeSalary10000;
END $$

DELIMITER ;

CALL EmployeeSalaryOver();
