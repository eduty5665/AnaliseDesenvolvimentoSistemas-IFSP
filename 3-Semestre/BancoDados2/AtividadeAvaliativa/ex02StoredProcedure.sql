use hr;

DELIMITER $$

CREATE PROCEDURE sp_transferir_funcionario (
    IN p_employee_id INT,
    IN p_novo_department_id INT
)
BEGIN
    UPDATE employees
    SET department_id = p_novo_department_id
    WHERE employee_id = p_employee_id;
END $$

DELIMITER ;

CALL sp_transferir_funcionario(90, 80);
