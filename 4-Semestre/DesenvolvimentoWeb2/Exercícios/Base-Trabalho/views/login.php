<link rel="stylesheet" type="text/css" href="<?php echo BASE_APP; ?>assets/css/login.css">
<section id="wrapper">
	<div class="box">
		<form method="POST" action="<?php echo BASE_APP; ?>login/login_action">
			<div class="row">
				<div class="col-lg-12 col-sm-12">
					<label for="usuario">Usuário</label>
					<input type="text" name="usuario" id="usuario" placeholder="Digite seu usuário" required="" class="form-control">
				</div>
			</div>
			<div class="row mb-2">
				<div class="col-lg-12 col-sm-12">
					<label for="senha">Senha</label>
					<input type="password" name="senha" id="senha" placeholder="Digite sua senha" required="" class="form-control">
				</div>
			</div> 
			<div class="row">
				<div class="col-lg-12 col-sm-12">
					<button type="submit" class="btn btn-success w-100">Logar</button>
				</div>
			</div>
		</form>
	</div>
</section>