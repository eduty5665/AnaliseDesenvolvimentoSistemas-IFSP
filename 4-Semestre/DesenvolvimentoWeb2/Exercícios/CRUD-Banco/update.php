<?php

	require 'database.php';

	$sql = "UPDATE tab_pessoa
	           SET telefone = :telefone
	         WHERE email    = :email";

	$sql = $db->prepare($sql);
	$sql->bindValue(':telefone','17991111111');	        
	$sql->bindValue(':email'   ,'arthur@ifsp.edu.br');
	$sql->execute();

	echo 'update executado';