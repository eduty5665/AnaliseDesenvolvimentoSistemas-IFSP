use hr;

CREATE TABLE alteracoes_salariais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NOT NULL,
    old_salary DECIMAL(8,2) NOT NULL,
    new_salary DECIMAL(8,2) NOT NULL,
    data_alteracao DATETIME NOT NULL
);

DELIMITER $$

CREATE TRIGGER trg_log_alteracao_salario
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    -- Verifica se o salário foi alterado
    IF OLD.salary <> NEW.salary THEN
        INSERT INTO alteracoes_salariais (
            employee_id,
            old_salary,
            new_salary,
            data_alteracao
        )
        VALUES (
            NEW.employee_id,
            OLD.salary,
            NEW.salary,
            NOW()
        );
    END IF;
END $$

DELIMITER ;

UPDATE employees
SET salary = salary + 200
WHERE employee_id = 100;

SELECT * FROM alteracoes_salariais;
