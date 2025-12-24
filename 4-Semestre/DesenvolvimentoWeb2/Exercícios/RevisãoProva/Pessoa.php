<?php 
class Pessoa{

	public $id_pessoa;
	public $nome;
	public $email;
	public $telefone;
	public $endereco;
	public $data_nasc;
	private $db;

	public function __construct(){
		global $db;
		$this->db = $db;
	}

	public function listar(){
		$sql = "SELECT * FROM tab_pessoa";

		$sql = $this->db->query($sql);

		if($sql->rowCount() > 0){
			$array = $sql->fetchAll(\PDO::FETCH_ASSOC);
		}

		return $array;
	}

	public function inserir(){
		$sql = "INSERT INTO tab_pessoa(nome, email, telefone, endereco, data_nasc) VALUES (:nome, :email, :telefone, :endereco, :data_nasc)";

		$sql = $this->db->prepare($sql);
		$sql->bindValue(':nome'     , $this->nome);
		$sql->bindValue(':email'    , $this->email);
		$sql->bindValue(':telefone' , $this->telefone);
		$sql->bindValue(':endereco' , $this->endereco);
		$sql->bindValue(':data_nasc', $this->data_nasc);
		$sql->execute();
	}

	public function atualizar(){
		$sql = "UPDATE tab_pessoa
		           SET nome      = :nome
		             , email     = :email
		             , telefone  = :telefone
		             , endereco  = :endereco
		             , data_nasc = :data_nasc
		         WHERE id_pessoa = :id_pessoa";

		$sql = $this->db->prepare($sql);
		$sql->bindValue(':nome'     , $this->nome);
		$sql->bindValue(':email'    , $this->email);
		$sql->bindValue(':telefone' , $this->telefone);
		$sql->bindValue(':endereco' , $this->endereco);
		$sql->bindValue(':data_nasc', $this->data_nasc);
		$sql->bindValue(':id_pessoa', $this->id_pessoa);
		$sql->execute();
	}

	public function apagar(){
		$sql = "DELETE FROM tab_pessoa
		         WHERE id_pessoa = :id_pessoa";

		$sql = $this->db->prepare($sql);
		$sql->bindValue(':id_pessoa', $this->id_pessoa);
		$sql->execute();
	}
}