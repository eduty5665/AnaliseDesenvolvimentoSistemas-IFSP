<div class="container">
	<div class="row mb-3">
		<div class="col-lg-12 col-sm-12 text-center">
			<h1>Cadastro de Usuários</h1>
		</div>
	</div>

	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12">
			<form method="POST" action="<?php echo BASE_APP; ?>usuarios/cadastro_action">
				<div class="row">
					<div class="col-6">
						<label>Usuário</label>
						<input type="text" name="usuario" required="" class="form-control">
					</div>
					<div class="col-6">
						<label>Senha</label>
						<input type="password" name="senha" required="" class="form-control">
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<label>Nome do Usuário</label>
						<input type="text" name="nome" required="" class="form-control">
					</div>
				</div>
				<div class="form-row">
					<div class="form-group col-md-12">
						<button type="submit" class="btn btn-success">Salvar</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>