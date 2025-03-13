/*View

Crie uma visão chamada vw_funcionarios_detalhes que exiba o ID do funcionário, seu nome completo (concatene first_name e last_name), cargo (job_title) e nome do departamento.

Crie uma visão chamada vw_funcionarios_acima_media que exiba os funcionários cujo salário seja maior que a média dos salários de todos os funcionários.

Crie uma visão chamada vw_gerentes_departamentos que exiba o ID e nome dos gerentes, juntamente com os nomes dos departamentos que eles gerenciam.

*/

use hr;

#1.
CREATE VIEW vw_funcionarios_detalhes AS
SELECT e.employee_id, CONCAT(e.first_name, e.last_name), j.job_title, d.department_name
FROM employees e, jobs j, departments d
WHERE e.department_id=d.department_id AND e.job_id=j.job_id;

#2
CREATE VIEW vw_funcionarios_acima_media AS
SELECT *
FROM employees e
WHERE e.salary > (SELECT AVG(salary) FROM employees);

#3
CREATE VIEW vw_gerentes_departamentos AS
SELECT e.manager_id, CONCAT(e.first_name, e.last_name), d.department_name
FROM employees e, departments d
WHERE e.manager_id = d.manager_id AND e.department_id = d.department_id AND e.manager_id = e.employee_id