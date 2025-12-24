<div class="container">
	<div class="row mb-3">
		<div class="col-lg-12 col-sm-12 text-center">
			<h1>Essa é minha tela de usuários</h1>
		</div>
	</div>

	<div class="row">
		<div class="col-lg-12 col-md-12 col-sm-12">
			<div class="botao mb-1">
				<a href="<?php echo BASE_APP; ?>usuarios/cadastro" class="btn btn-success">
					Adicionar Usuário
				</a>
			</div>
			<table class="table table-striped table-hover">
				<thead>
					<tr>
						<th>ID</th>
						<th>Usuário</th>
						<th>Nome</th>
						<th>#</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach($list as $item): ?>
						<tr>
							<td><?php echo $item['id_usuario']; ?></td>
							<td><?php echo $item['usuario']; ?></td>
							<td><?php echo $item['nome']; ?></td>
							<td>
								<div class="btn-group">
									<a href="<?php echo BASE_APP.'usuarios/editar/'.$item['usuario']; ?>" class="btn btn-warning">Editar</a>	
									<a href="<?php echo BASE_APP.'usuarios/apagar/'.$item['usuario']; ?>" class="btn btn-danger" onclick="return confirm('deseja apagar esse registro?');">X</a>
								</div>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
	</div>
</div>