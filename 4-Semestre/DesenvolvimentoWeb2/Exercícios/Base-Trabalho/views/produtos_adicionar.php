<section>
	<div class="container">
		<div class="row mb-3">
			<div class="col-lg-12 col-sm-12 text-center">
				<h1>Cadastro de Produtos</h1>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12">
				<form method="POST" action="<?php echo BASE_APP; ?>produtos/cadastro_action" enctype="multipart/form-data">
					<div class="row">
						<div class="col-6">
							<label>Nome</label>
							<input type="text" name="nome" required="" class="form-control" placeholder="Ex: João da silva">
						</div>
						<div class="col-6">
							<label>Marca</label>
							<input type="text" name="marca" required="" class="form-control">
						</div>
					</div>
					<div class="row mb-3">
						<div class="col-6">
							<label>Vlr. Produto</label>
							<input type="number" name="vlr_produto" required="" class="form-control">
						</div>
						<div class="col-6">
							<label>Imagem</label>
							<input type="file" name="arquivo" required="" class="form-control" accept="image/*">
						</div>
					</div>
					<div class="row">
						<div class="col-6">
							<button type="submit" class="btn btn-success">
								Salvar
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>