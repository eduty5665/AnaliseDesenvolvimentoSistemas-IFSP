<section>
	<div class="container">
		<div class="row mb-3">
			<div class="col-lg-12 col-md-12 col-sm-12">
				<h1>Cadastro de Produtos</h1>
			</div>
		</div>

		<div class="row mb-3">
			<div class="col-lg-12 col-md-12 col-sm-12">

				<div class="mb-3">
					<a href="<?php echo BASE_APP; ?>produtos/adicionar" class="btn btn-success">
						Cadastrar Produto
					</a>
				</div>

				<table class="table table-striped table-hovered">
					<thead>
						<tr>
							<th>#</th>
							<th>Nome</th>
							<th>Marca</th>
							<th>Vlr. Produto</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach($list as $item): ?>
						<tr>
							<td>
								<img src="<?php echo BASE_APP.'media/produtos/'.$item['url_foto']; ?>" style="width: 100%;max-width: 100px">
							</td>
							<td><?php echo $item['nome']; ?></td>
							<td><?php echo $item['marca']; ?></td>
							<td><?php echo $item['vlr_produto']; ?></td>
						</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>