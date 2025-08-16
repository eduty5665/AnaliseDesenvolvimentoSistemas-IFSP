<?php
	session_start();
	if(isset($_SESSION['logado']) && $_SESSION['logado']){
		header("Location: home.php");
		exit;
	}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Login</title>
</head>
<body>
	<form method="POST" action="login.php">
		<label for="usuario">Login</label>
		<input type="text" name="usuario" id="usuario">
		<label for="senha">Senha</label>
		<input type="password" name="senha" id="senha">
		<button type="submit">Logar</button>
	</form>

	<?php if(isset($_SESSION['msg']) 
		   && !empty($_SESSION['msg'])): ?>

		<div style="color:red;">
			<?php echo $_SESSION['msg']; ?>
			<?php unset($_SESSION['msg']); ?>
		</div>

    <?php endif; ?>
    
</body>
</html>