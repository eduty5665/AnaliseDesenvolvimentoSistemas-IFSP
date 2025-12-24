<?php
	require 'database.php';
	require 'Pessoa.php';

	$pessoa = new Pessoa();
	$dados = $pessoa->listar();
?>
<!DOCTYPE html>
<html>
<head>
	<title>Lista Pessoas</title>
</head>
<body>
	<a href="pessoaAction.php?acao=adicionar">Adicionar Pessoa</a>
	<table>
		<thead>
			<tr>
				<th>Nome</th>
				<th>Telefone</th>
				<th>E-mail</th>
				<th>Endereço</th>
				<th>Data de Nasc.</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach($dados as $item): ?>
				<tr>
					<td><?php echo $item['nome']; ?></td>
					<td><?php echo $item['telefone']; ?></td>
					<td><?php echo $item['email']; ?></td>
					<td><?php echo $item['endereco']; ?></td>
					<td><?php echo $item['data_nasc']; ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>

</body>
</html>