<?php
class Usuarios extends model{

	public $id_usuario;
	public $usuario;
	public $senha;
	public $nome;

	public function adicionar(){
		$sql = "INSERT INTO usuarios(usuario, senha, nome) 
		            VALUES (:usuario, :senha, :nome)";

		$sql = $this->db->prepare($sql);
		$sql->bindValue(":usuario", $this->usuario);
		$sql->bindValue(":senha"  , $this->senha);
		$sql->bindValue(":nome"   , $this->nome);
		$sql->execute();
	}

	public function editar(){
		$sql = "UPDATE usuarios
		           SET usuario    = :usuario
		             , senha      = :senha
		             , nome       = :nome
		         WHERE id_usuario = :id_usuario";

		$sql = $this->db->prepare($sql);
		$sql->bindValue(':usuario'   , $this->usuario);
		$sql->bindValue(':senha'     , $this->senha);
		$sql->bindValue(':nome'      , $this->nome);
		$sql->bindValue(':id_usuario', $this->id_usuario);
		$sql->execute();
	}

	public function delete($usuario){
		$sql = "DELETE FROM usuarios WHERE usuario = :usuario";
		$sql = $this->db->prepare($sql);
		$sql->bindValue(":usuario", $usuario);
		$sql->execute();
	}

	public function getAll(){
		$retorno = array();

		$sql = "SELECT * FROM usuarios ORDER BY usuario";

		$sql = $this->db->query($sql);
		if($sql->rowCount() > 0){
			$retorno = $sql->fetchAll(\PDO::FETCH_ASSOC);
		}

		return $retorno;
	}

	public function getUsuario($usuario){
		$retorno = array();

		$sql = 'SELECT * 
				  FROM usuarios
				 WHERE usuario = :usuario';

		$sql = $this->db->prepare($sql);
		$sql->bindValue(':usuario', $usuario);
		$sql->execute();

		if($sql->rowcount() > 0){
			$retorno = $sql->fetch(\PDO::FETCH_ASSOC);
		}

		return $retorno;
	}

	public function validateLogin($usuario, $senha){
		$sql = "SELECT *
		          FROM usuarios
		         WHERE usuario = :usuario
		           AND senha   = :senha";
	
		$sql = $this->db->prepare($sql);
		$sql->bindValue(":usuario", $usuario);		           
		$sql->bindValue(":senha"  , $senha);
		$sql->execute();

		if($sql->rowCount() > 0){
			$dados = $sql->fetch(\PDO::FETCH_ASSOC);

			$token = md5(date('Ymdhis').rand(0,999));

			$sql = "UPDATE usuarios SET token = :token 
			         WHERE id_usuario = :id_usuario";
			$sql = $this->db->prepare($sql);
			$sql->bindValue(":token"      , $token);		           
			$sql->bindValue(":id_usuario" , $dados['id_usuario']);
			$sql->execute();

			$_SESSION['token'] = $token;

			return true;
		}

		return false;
	}

	public function isLogged(){
		if(!empty($_SESSION['token'])){
			$token = $_SESSION['token'];

			$sql = "SELECT *
		              FROM usuarios
		             WHERE token = :token";
	
			$sql = $this->db->prepare($sql);
			$sql->bindValue(":token", $token);		
			$sql->execute();

			if($sql->rowCount() > 0){
				return true;
			}
		}

		return false;
	}

}