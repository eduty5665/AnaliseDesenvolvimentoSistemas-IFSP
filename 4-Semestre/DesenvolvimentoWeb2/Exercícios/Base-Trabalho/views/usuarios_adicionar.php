<div class="container">
	<div class="row mb-3">
		<div class="col-lg-12 text-center">
			<h1>Adicionar de usuários</h1>
		</div>
	</div>
	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12">
			<form method="POST" action="<?php echo BASE_APP; ?>usuarios/adicionar_action">
				<div class="row">
					<div class="col-6">
						<label>Usuário</label>
						<input type="text" name="usuario" class="form-control" required="">
					</div>
					<div class="col-6">
						<label>Senha</label>
						<input type="password" name="senha" class="form-control" required="">
					</div>
				</div>
				<div class="row mb-2">
					<div class="col-12">
						<label>Nome</label>
						<input type="text" name="nome" class="form-control" required="">
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<button type="submit" class="btn btn-success">Salvar</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>