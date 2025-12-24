<!DOCTYPE html>
<html>
<head>
	<title>Sistema Base</title>
	<link href="<?php echo BASE_APP; ?>assets/css/bootstrap.min.css" rel="stylesheet">
	<meta charset="utf-8">
	<meta name='viewport' content="width=devide-width, initial-scale=1.0,maximum-scale=1.0">
</head>
<body>	

	<header>
		<nav class="navbar bg-body-tertiary">
		  <div class="container-fluid">
		    <form class="d-flex" role="search" method="GET" action="<?php echo BASE_APP; ?>search">
		      <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" name="texto" value="<?php echo (isset($_GET['texto']))?$_GET['texto']:null; ?>" />
		      <button class="btn btn-outline-success" type="submit">Search</button>
		    </form>
		  </div>
		</nav>
	</header>

	<main>
		<?php $this->loadViewInTemplate($viewName, $viewData); ?>
	</main>

	<script src="<?php echo BASE_APP; ?>assets/js/bootstrap.bundle.min.js"></script>
</body>
</html>