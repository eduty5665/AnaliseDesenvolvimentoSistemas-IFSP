<?php
class Animal{
	protected function comer(){
		return "O animal está comendo";
	}
}

class Cachorro extends Animal{

	public function __destruct(){
		echo 'Classe encerrada';
		/*essa ação pode ser executada em 3 casos
			1 - no final de script
			2 - unset($cachorro) - quando remover a classe
			3 - remover a variável de escopo
		*/
	}

	public function latir(){
		return 'O cachorro está latindo';
	}
	public function acao(){
		return $this->comer();
	}
	public function comer(){
		return "O Cachorro está comendo";
	}
}
//instanciar o objeto
$cachorro = new Cachorro();
echo $cachorro->latir();
echo '<br>';
echo $cachorro->comer();