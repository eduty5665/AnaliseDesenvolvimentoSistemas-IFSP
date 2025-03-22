/* 1) Crie um Procedimento Armazenado que informado o ID de um determinado empregado, aumente o salario dele em 10% */
DELIMITER //
CREATE PROCEDURE AumentoSalario(
	in empregado_id int)
Begin
	Update employees
    set salary = salary * 1.10
    where employee_id = empregado_id;
End;
//DELIMITER ;

Call AumentoSalario(100);

/* 2) Crie um Procedimento Armazenado que Informado o ID do departamento, retorne os funcionários que trabalham neste departamento. */
DELIMITER //
CREATE PROCEDURE DepartamentoEmpregado(
	in id_departamento int)
Begin
	select * from employees
    where department_id = id_departamento;
End;
//DELIMITER ;

CALL DepartamentoEmpregado(90);
