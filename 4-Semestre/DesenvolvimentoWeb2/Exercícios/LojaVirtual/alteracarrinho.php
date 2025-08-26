<?php
	$index    = $_GET['produto'];
	$operacao = $_GET['operacao'];
	session_start(); //iniciar a sessão

	if(isset($_SESSION['carrinho']) && count($_SESSION['carrinho']) > 0){
		foreach($_SESSION['carrinho'] as $key => $item){
			if($key == $index){

				if($operacao == 'sub'){
					///checa se não é 1
					if($item['qtd'] == 1){
						header("Location: remover.php?produto=".$index);
						exit;	
					}

					$_SESSION['carrinho'][$key]['qtd'] -= 1;				

				}else if($operacao == 'soma'){
					$_SESSION['carrinho'][$key]['qtd'] += 1;					
				}

				$_SESSION['carrinho'][$key]['vlr_total'] 
					= $_SESSION['carrinho'][$key]['qtd'] * $item['vlr_unitario'];
			}
		}
	}

	header("Location: carrinho.php");
	exit;