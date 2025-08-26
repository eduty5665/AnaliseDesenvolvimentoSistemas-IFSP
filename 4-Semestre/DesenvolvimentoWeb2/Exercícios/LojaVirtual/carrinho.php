<?php
	session_start();
	if(!isset($_SESSION['carrinho']) || count($_SESSION['carrinho']) == 0){
		header("Location: index.php");
		exit;
	}
	$dados = $_SESSION['carrinho'];
?>
<?php require 'head.php'; ?>
<main>
	<div class="container">
		<table class="table">
			<thead>
				<tr>
					<th>Nome</th>
					<th>Qtd.</th>
					<th>Vlr. Unitário</th>
					<th>Vlr. Total</th>
					<th>#</th>
				</tr>
			</thead>
			<tbody>
				<?php foreach($dados as $key => $item): ?>
					<tr>
						<td><?php echo $item['nome']; ?></td>
						<td>
							<a href="alteracarrinho.php?produto=<?php echo $key; ?>&operacao=sub" class="btn">-</a>
								<?php echo $item['qtd']; ?>
							<a href="alteracarrinho.php?produto=<?php echo $key; ?>&operacao=soma" class="btn">+</a>
						</td>
						<td><?php echo number_format($item['vlr_unitario'],2,',','.'); ?></td>
						<td><?php echo number_format($item['vlr_total'],2,',','.'); ?></td>
						<td>
							<a href="remover.php?produto=<?php echo $key; ?>" class="btn btn-danger" onclick="return confirm('deseja remover esse item?');">
								X
							</a>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</main>

<?php require 'footer.php'; ?>
