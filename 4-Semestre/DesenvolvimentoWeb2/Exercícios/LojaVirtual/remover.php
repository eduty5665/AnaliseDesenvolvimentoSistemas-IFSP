<?php
	
	$index = $_GET['produto'];
	session_start();

	if(isset($_SESSION['carrinho']) && count($_SESSION['carrinho']) > 0){
		unset($_SESSION['carrinho'][$index]);
	}

	header("Location: carrinho.php");
	exit;