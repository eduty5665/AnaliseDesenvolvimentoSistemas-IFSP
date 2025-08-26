<?php
	$index = $_GET['produto'];

	if(empty($index)){
		header("Location: index.php");
		exit;
	}

	require 'dados.php';
	$produto = $produtos[$index];

	session_start(); //iniciar a sessão

	if(isset($_SESSION['carrinho']) && count($_SESSION['carrinho']) > 0){
		$achou = false;
		foreach($_SESSION['carrinho'] as $key => $item){
			if($item['index'] == $index){
				$achou = true;
				$_SESSION['carrinho'][$key]['qtd'] += 1;
				$_SESSION['carrinho'][$key]['vlr_total'] 
				= $item['vlr_unitario'] * $_SESSION['carrinho'][$key]['qtd'];
			}
		}

		if(!$achou){
			$_SESSION['carrinho'][] = array(
				'index'        => $index
			   ,'nome'         => $produto['nome']
			   ,'qtd'          => 1
			   ,'vlr_unitario' => $produto['vlr_produto']
			   ,'vlr_total'    => $produto['vlr_produto']
			);	
		}

	//quando o carrinho tiver vazio
	}else{
		$_SESSION['carrinho'][] = array(
			'index'        => $index
		   ,'nome'         => $produto['nome']
		   ,'qtd'          => 1
		   ,'vlr_unitario' => $produto['vlr_produto']
		   ,'vlr_total'    => $produto['vlr_produto']
		);		
	}

	header("Location: carrinho.php");
	exit;