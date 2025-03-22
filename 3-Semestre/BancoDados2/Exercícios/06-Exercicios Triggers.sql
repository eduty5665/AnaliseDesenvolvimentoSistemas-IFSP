/*EXERCICIO LISTA 05 - TRIGGERS*/
/*Crie as Triggers abaixo para cada situação proposta:*/

/*1.    BEFORE INSERT*/
/*Objetivo: Garantir que nenhum funcionário seja inserido com um salário inferior a 2000.*/

DELIMITER $$

CREATE TRIGGER before_insert_employees
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    IF NEW.salary < 2000 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Salário deve ser no mínimo 2000';
    END IF;
END$$

DELIMITER ;

/*2.    BEFORE DELETE*/
/*Objetivo: Antes de excluir um funcionário, armazenar suas informações em uma tabela de backup chamada employees_backup.*/

CREATE TABLE IF NOT EXISTS employees_backup (
    employee_id INT (11) UNSIGNED NOT NULL,
    first_name VARCHAR(20),
    last_name VARCHAR(25),
    email VARCHAR(25),
    phone_number VARCHAR(20),
    hire_date DATE NOT NULL,
    job_id VARCHAR(10) NOT NULL,
    salary DECIMAL(8, 2) NOT NULL,
    commission_pct DECIMAL(2, 2),
    manager_id INT (11) UNSIGNED,
    department_id INT (11) UNSIGNED,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$

CREATE TRIGGER before_delete_employees
BEFORE DELETE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO employees_backup
    (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary, commission_pct, manager_id, department_id)
    VALUES
    (OLD.employee_id, OLD.first_name, OLD.last_name, OLD.email, OLD.phone_number, OLD.hire_date, OLD.job_id, OLD.salary, OLD.commission_pct, OLD.manager_id, OLD.department_id);
END$$

DELIMITER ;

/*3.    AFTER UPDATE*/
/*Objetivo: Registrar em uma tabela de auditoria salary_changes todas as mudanças de salário dos funcionários.*/

CREATE TABLE IF NOT EXISTS salary_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT (11) UNSIGNED NOT NULL,
    old_salary DECIMAL(8, 2) NOT NULL,
    new_salary DECIMAL(8, 2) NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$

CREATE TRIGGER after_update_salary
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    IF OLD.salary <> NEW.salary THEN
        INSERT INTO salary_changes (employee_id, old_salary, new_salary)
        VALUES (OLD.employee_id, OLD.salary, NEW.salary);
    END IF;
END$$

DELIMITER ;

/*4.    AFTER INSERT*/
/*Objetivo: Após inserir um novo funcionário, enviar uma mensagem de boas-vindas em uma tabela de notificações welcome_messages.*/

CREATE TABLE IF NOT EXISTS welcome_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT (11) UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER $$

CREATE TRIGGER after_insert_employee
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    INSERT INTO welcome_messages (employee_id, message)
    VALUES (NEW.employee_id, CONCAT('Bem-vindo(a) à empresa, ', NEW.first_name, '!'));
END$$

DELIMITER ;