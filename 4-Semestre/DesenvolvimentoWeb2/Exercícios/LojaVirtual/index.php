<?php require 'dados.php'; ?>
<?php require 'head.php'; ?>

	<main>
		<div class="container">
			<div class="produtos">

				<?php foreach($produtos as $index => $prod): ?>
				<div class="prod">
					<div class="imagem">
						<img src="imagens/<?php echo $prod['url_arquivo']; ?>">
					</div>
					<div class="nome">
						<?php echo $prod['nome']; ?>
					</div>
					<div class="marca">
						<?php echo $prod['marca']; ?>
					</div>
					<div class="valor">
						R$<?php echo number_format($prod['vlr_produto'],2,',','.'); ?>
					</div>
					<div class="botao">
						<a href="adicionar.php?produto=<?php echo $index; ?>">	Comprar
						</a>
					</div>
				</div>
				<?php endforeach; ?>

			</div>
		</div>
	</main>

<?php require 'footer.php'; ?>