<link rel="stylesheet" type="text/css" href="<?php echo BASE_APP; ?>assets/css/home.css">

<section id="produtos">
	<div class="container">
		<div class="row">
			<div class="col-lg-12 col-md-12 col-sm-12">
				<div class="box">
					<?php foreach($list as $produto): ?>			
						<div class="item">
							<div class="foto">
								<img src="<?php echo BASE_APP.'media/produtos/'.$produto['url_foto']; ?>" class="w-100">
							</div>
							<div class="nome"><?php echo $produto['nome']; ?></div>
							<div class="marca"><?php echo $produto['marca']; ?></div>
							<div class="valor">R$ <?php echo number_format($produto['vlr_produto'],2,',','.'); ?></div>
							<div class="botao">
								<a href="" class="btn btn-success w-100">Comprar Agora</a>
							</div>
						</div>				
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>
</section>