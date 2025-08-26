<?php

	require 'database.php';

	$nome     = $_POST['nome'];
	$telefone = $_POST['telefone'];
	$email    = $_POST['email'];

	$sql = "INSERT INTO tab_pessoa(nome, telefone, email)
	        VALUES(:nome, :telefone, :email)";

	$sql = $db->prepare($sql);
	$sql->bindValue(':nome'    , $nome);
	$sql->bindValue(':telefone', $telefone);
	$sql->bindValue(':email'   , $email);
	$sql->execute();

	//$sql->commit();

	//resgatando código
	//echo 'ID inserido: '.$db->lastInsertId();

	header("Location: index.php");
	exit;