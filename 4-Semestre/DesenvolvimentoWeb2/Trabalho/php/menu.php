<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: ../index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>TurtleTrack - Painel Principal</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body class="dashboard-body">
    <header class="header">
        <img src="../src/turtle.png" alt="TurtleTrack Logo" class="logo-login">
        <nav>
            <a href="menu.php">🏠 Home</a>
            <a href="#">⚙️ Configurações</a>
            <a href="../index.php">🚪 Sair</a>
        </nav>
    </header>

    <main class="dashboard-grid">
        <a href="cadastro.php" class="card green">➕ Cadastrar Produto</a>
        <a href="produtos.php" class="card blue">📋 Listar / Buscar Produtos</a>
        <a href="movimentar.php" class="card orange">🔄 Movimentar Produto</a>
    </main>

    <footer class="footer">🐢 TurtleTrack © 2025 | Sustentabilidade e Eficiência</footer>
</body>
</html>
