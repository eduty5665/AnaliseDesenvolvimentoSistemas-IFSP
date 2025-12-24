<?php
	
	require 'database.php';
	require 'Pessoa.php';

	$acao = $_GET['acao'];

	if(empty($acao)){
		header('Location: index.php');
		exit;
	}

	if($acao == 'adicionar'){
		header("Location: pessoaAdicionar.php");
		exit;
		
	}elseif($acao == 'adicionarbanco'){
		$pessoa = new Pessoa();
		$pessoa->nome      = $_POST['nome'];
		$pessoa->telefone  = $_POST['telefone'];
		$pessoa->email     = $_POST['email'];
		$pessoa->endereco  = $_POST['endereco'];
		$pessoa->data_nasc = $_POST['data_nasc'];
		$pessoa->inserir();

		header("Location: index.php");
		exit;

	}elseif($acao == 'editar'){

	}elseif($acao == 'apagar'){

	}