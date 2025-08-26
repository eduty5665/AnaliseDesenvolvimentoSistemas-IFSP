<?php

	require 'database.php';

	$sql = "DELETE FROM tab_pessoa WHERE email = :email";

	$sql = $db->prepare($sql);
	$sql->bindValue('email','arthur@ifsp.edu.br');
	$sql->execute();

	echo 'delete executado com sucesso';