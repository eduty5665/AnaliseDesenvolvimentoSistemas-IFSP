<?php
class produtosController extends controller{

	private $info;
	private $user;

	public function __construct(){
		parent::__construct();

		$this->user = new Usuarios();
		if(!$this->user->isLogged()){
			header("Location: ".BASE_APP."login");
			exit;
		}

		$this->info = array(
			'title' => 'Produtos'
		);
	}

	public function index(){

		$produtos = new Produtos();
		$this->info['list'] = $produtos->getAll();		

		$this->loadTemplate('produtos', $this->info);
	}

	public function adicionar(){

		$this->loadTemplate('produtos_adicionar', $this->info);
	}

	public function cadastro_action(){
		$produtos = new Produtos();
		$produtos->nome        = $_POST['nome'];
		$produtos->marca       = $_POST['marca'];
		$produtos->vlr_produto = $_POST['vlr_produto'];
		$produtos->adicionar($_FILES['arquivo']);

		header("Location: ".BASE_APP."produtos");
		exit;
	}
}
