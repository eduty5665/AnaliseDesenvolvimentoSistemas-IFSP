use hr;

DELIMITER $$

CREATE FUNCTION fn_bonus_aproximado (
    p_employee_id INT
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_salario DECIMAL(10,2);
    DECLARE v_comissao DECIMAL(2,2);
    DECLARE v_bonus DECIMAL(10,2);

    SELECT salary, commission_pct
    INTO v_salario, v_comissao
    FROM employees
    WHERE employee_id = p_employee_id;

    IF v_comissao IS NOT NULL THEN
        SET v_bonus = v_salario * 0.15;
    ELSE
        SET v_bonus = v_salario * 0.05;
    END IF;

    RETURN v_bonus;
END $$

DELIMITER ;


SELECT fn_bonus_aproximado(100);
