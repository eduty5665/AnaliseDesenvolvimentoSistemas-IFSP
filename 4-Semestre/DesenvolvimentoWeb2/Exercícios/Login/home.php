<?php
	session_start();
	if(!$_SESSION['logado']){
		header("Location: index.php");
		exit;
	}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Home</title>
</head>
<body>
	<h1>Bem-vindo ao sistema, <?php echo $_SESSION['usuario']; ?></h1>
	<a href="logout.php">Sair do sistema</a>
</body>
</html>