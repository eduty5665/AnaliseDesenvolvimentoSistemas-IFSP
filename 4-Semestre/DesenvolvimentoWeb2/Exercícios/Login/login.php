<?php

	$usuario = $_POST['usuario'];
	$senha   = $_POST['senha'];

	if(empty($usuario) || empty($senha)){
		header("Location: index.php");
		exit;
	}

	session_start();
	if($usuario == 'michel' && $senha == '1234'){
		$_SESSION['logado']  = true;
		$_SESSION['usuario'] = $usuario;

		header("Location: home.php");
		exit;
	}

	$_SESSION['msg'] = "Dados de login inválidos";
	header("Location: index.php");
	exit;