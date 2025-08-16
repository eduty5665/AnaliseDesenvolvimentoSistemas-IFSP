<?php
	//cookies
	setcookie("usuario","michel",time() + 3600); //1h
	echo 'cookie ok';

	echo '<pre>';
	print_r($_COOKIE);
	echo '</pre>';

	/***********************************/
	//sessões
	session_start();
	$_SESSION['usuario'] = 'michel';
	$_SESSION['alunos']  = array('Mario','Jose','Pedro');

	echo '<pre>';
	print_r($_SESSION);
	echo '</pre>';

	//apagar indexes
	unset($_SESSION['usuario']);

	echo '<pre>';
	print_r($_SESSION);
	echo '</pre>';
