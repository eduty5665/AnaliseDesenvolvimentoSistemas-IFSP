<?php
class usuariosController extends controller{

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
			'title' => 'Usuários'
		);
	}

	public function index(){

		$usuarios = new Usuarios();
		$this->info['list'] = $usuarios->getAll();		

		$this->loadTemplate('usuarios', $this->info);
	}

	public function cadastro(){

		$this->loadTemplate('usuarios_cadastro', $this->info);	
	}

	public function cadastro_action(){
		$usuario = $_POST['usuario'];
		$senha   = $_POST['senha'];
		$nome    = $_POST['nome'];

		if(!empty($usuario) && !empty($senha)){
			$usu = new Usuarios();
			//atributos da classe
			$usu->usuario = $usuario;	
			$usu->senha   = $senha;
			$usu->nome    = $nome;

			$usu->adicionar();
		}

		header("Location: ".BASE_APP."usuarios");
		exit;
	}

	public function editar($usuario = ''){
		if(empty($usuario)){
			header("Location: ".BASE_APP."usuarios");
			exit;
		}

		$usu = new Usuarios();
		$this->info['dados'] = $usu->getUsuario($usuario);

		//checar se trouxe dados
		if(!isset($this->info['dados']['id_usuario'])){
			header("Location: ".BASE_APP."usuarios");
			exit;
		}

		$this->loadTemplate('usuarios_editar', $this->info);	
	}

	public function editar_action($id_usuario = ''){
		if(empty($id_usuario)){
			header("Location: ".BASE_APP."usuarios");
			exit;
		}

		$usuario = $_POST['usuario'];
		$senha   = $_POST['senha'];
		$nome    = $_POST['nome'];

		if(!empty($id_usuario) && !empty($usuario) && !empty($senha)){
			$usu = new Usuarios();
			//atributos da classe
			$usu->id_usuario = $id_usuario;
			$usu->usuario    = $usuario;	
			$usu->senha      = $senha;
			$usu->nome       = $nome;

			$usu->editar();
		}

		header("Location: ".BASE_APP."usuarios");
		exit;
	}

	public function apagar($usuario){

		$usu = new Usuarios();
		$usu->delete($usuario);

		header("Location: ".BASE_APP."usuarios");
		exit;	

	}
}