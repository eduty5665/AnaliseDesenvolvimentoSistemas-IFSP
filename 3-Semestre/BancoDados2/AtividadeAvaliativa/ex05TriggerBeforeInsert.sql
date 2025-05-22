use hr;

DELIMITER $$

CREATE TRIGGER trg_verifica_email_unico
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM employees
        WHERE email = NEW.email
    ) THEN
    
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: Já existe um funcionário com este email.';
    END IF;
END $$

DELIMITER ;

INSERT INTO employees (
    employee_id, first_name, last_name, email, phone_number, hire_date,
    job_id, salary, commission_pct, manager_id, department_id
)
VALUES (
    999, 'João', 'Silva', 'joao.silva@example.com', '555-1234', '2025-05-16',
    'IT_PROG', 5000.00, NULL, NULL, 60
);

-- O email 'joao.silva@example.com' já existe
INSERT INTO employees (
    employee_id, first_name, last_name, email, phone_number, hire_date,
    job_id, salary, commission_pct, manager_id, department_id
)
VALUES (
    1000, 'Ruan', 'Lucas', 'joao.silva@example.com', '555-5678', '2025-05-17',
    'IT_PROG', 6000.00, NULL, NULL, 60
);

