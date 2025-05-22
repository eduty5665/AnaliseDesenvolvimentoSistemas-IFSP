use hr;

CREATE VIEW vw_funcionarios_salario_total AS
SELECT 
    e.employee_id AS id_funcionario,
    CONCAT(e.first_name, ' ', e.last_name) AS nome_completo,
    d.department_name AS nome_departamento,
    e.salary AS salario,
    (e.salary + IFNULL(e.salary * e.commission_pct, 0)) AS salario_total
FROM 
    employees e
LEFT JOIN 
    departments d ON e.department_id = d.department_id;

SELECT * FROM vw_funcionarios_salario_total;
