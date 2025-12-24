<?php
include('config.php');
include('functions.php');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nome = $_POST['nome'];
    $quantidade = $_POST['quantidade'];
    $preco = $_POST['preco'];

    if (!empty($nome) && !empty($quantidade) && !empty($preco)) {
        $sql = "INSERT INTO produtos (nome, quantidade_estoque, preco)
                VALUES ('$nome', '$quantidade', '$preco')";
        if ($conn->query($sql)) {
            echo "<script>alert('✅ Produto cadastrado com sucesso!'); window.location.href='cadastro.php';</script>";
        } else {
            echo "<script>alert('❌ Erro ao cadastrar produto: " . $conn->error . "');</script>";
        }
    } else {
        echo "<script>alert('Preencha todos os campos!');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Cadastrar Produto - TurtleTrack</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body class="dashboard-body">
    <header class="header">
        <img src="../src/turtle.png" alt="TurtleTrack Logo" class="logo-login">
        <nav>
            <a href="menu.php">🏠 Home</a>
            <a href="menu.php">⬅ Voltar</a>
        </nav>
    </header>

    <main class="form-container">
        <form action="cadastro.php" method="post" class="form-card">
            <h2>➕ Novo Produto</h2>

            <label for="nome">Nome do Produto</label>
            <input type="text" id="nome" name="nome" placeholder="Ex: Água Mineral 500ml" required>

            <label for="quantidade">Quantidade</label>
            <input type="number" id="quantidade" name="quantidade" placeholder="Ex: 100" required>

            <label for="preco">Preço (R$)</label>
            <input type="number" step="0.01" id="preco" name="preco" placeholder="Ex: 3.50" required>

            <label for="categoria">Categoria</label>
            <select id="categoria" name="categoria" required>
                <option value="">Selecione...</option>
                <option value="bebida">Bebida</option>
                <option value="lanche">Lanche</option>
                <option value="salgado">Salgado</option>
                <option value="porcao">Porção</option>
            </select>
            <br />
            <br />
            <button type="submit" class="btn-login">Cadastrar Produto</button>
        </form>
    </main>

    <footer class="footer">© 2025 TurtleTrack | Gerencie seu estoque com leveza</footer>
</body>
</html>
