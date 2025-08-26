<?php
	require 'database.php';

	//select com php
	$array = array();
	$sql = "SELECT * FROM tab_pessoa";

	//executar o comando
	$sql = $db->query($sql);

	if($sql->rowCount() > 0){
		$array = $sql->fetchAll(\PDO::FETCH_ASSOC);
	}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Cadastro de Pessoas</title>
</head>
<body>
	<table style="600px">
		<thead>
			<tr>
				<th>Nome</th>
				<th>Telefone</th>
				<th>E-mail</th>
				<th>Data Registro</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach($array as $pessoa): ?>
				<tr>
					<td><?php echo $pessoa['nome']; ?></td>
					<td><?php echo $pessoa['telefone']; ?></td>
					<td><?php echo $pessoa['email']; ?></td>
					<td><?php echo date('d/m/Y H:i',strtotime($pessoa['data_insert'])); ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>

	<hr/>

	<form method="POST" action="insert.php">
		<input type="text" name="nome" required="" placeholder="Nome">
		<input type="text" name="telefone" required="" placeholder="telefone">
		<input type="email" name="email" required="" placeholder="E-mail">
		<button type="submit">Cadastar</button>
	</form>
</body>
</html>