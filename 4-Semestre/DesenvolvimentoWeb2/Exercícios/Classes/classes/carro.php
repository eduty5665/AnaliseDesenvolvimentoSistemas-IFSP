<?php
class Carro{
	//atributos
	public  $marca;
	public  $modelo;
	public  $ano;
	private $valor;

	/*3 tipos de uso dos metodos e atributos
	public = disponível em qualquer lugar
	private = disponível apenas dentro da propria classe
	protected = disponivel na classe e na sub-classe*/

	public function __construct($marca, $modelo, $ano){
		$this->marca  = $marca;
		$this->modelo = $modelo;
		$this->ano    = $ano;
	}

	//método
	public function buzinar(){
		return 'biii biii';
	}
	public function getAno(){
		return 'Fabricado em '.$this->ano;
	}
	public function vender($valor){
		$this->valor = $valor;
	}
	public function getVenda(){
		return $this->valor;
	}
}

$carro = new Carro('Fiat','Uno','2015');
/*
$carro->marca  = 'Fiat';
$carro->modelo = 'Uno';
$carro->ano    = '2015';*/

echo $carro->marca.' '.$carro->modelo.'/'.$carro->ano;
echo '<br>';
echo $carro->buzinar();
echo '<br>';
$carro->vender(100000);
echo 'venda efetuada';
echo '<br>';
echo $carro->getVenda();