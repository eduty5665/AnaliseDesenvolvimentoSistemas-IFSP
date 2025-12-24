<!DOCTYPE html>
<html>
<head>
	<title>Adicionar</title>
</head>
<body>

	<form method="POST" action=" pessoaAction.php?acao=adicionarbanco">
		<label for="nome">Nome</label>
		<input type="text" name="nome" placeholder="Nome">
		<label for="telefone">Telefone</label>
		<input type="text" name="telefone" placeholder="telefone">
		<label for="email">E-mail</label>
		<input type="email" name="email" placeholder="email">
		<label for="endereco">Endereço</label>
		<input type="endereco" name="endereco" placeholder="endereco">
		<label for="data_nasc">Data Nasc.</label>
		<input type="date" name="data_nasc" placeholder="data_nasc">
		<button type="submit">Salvar</button>
	</form>
</body>
</html>