<?php
class searchController extends controller{

	private $info;

	public function __construct(){
		parent::__construct();

		$this->info = array(
			'title' => 'Pesquisar'
		);
	}

	public function index(){

		$texto = $_GET['texto'];

		$produtos = new Produtos();
		$this->info['list'] = $produtos->getSearch($texto);

		$this->loadTemplate('search', $this->info);
	}

}