<?php
class homeController extends controller{

	private $info;

	public function __construct(){
		parent::__construct();

		$this->info = array(
			'title' => 'Home'
		);
	}

	public function index(){

		$produtos = new Produtos();
		$this->info['list'] = $produtos->getLimit(12);

		$this->loadTemplate('home', $this->info);
	}

}