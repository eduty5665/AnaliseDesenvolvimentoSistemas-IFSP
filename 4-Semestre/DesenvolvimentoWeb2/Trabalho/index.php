<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>TurtleTrack - Login</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body class="login-body">
    <div class="login-container">
        <img src="./src/turtle.png" alt="TurtleTrack Logo" class="logo-login">
        <h1>Bem-vindo ao TurtleTrack</h1>
        <p>Controle sustentável do seu estoque</p>

        <form action="index.php" method="POST">
            <div class="input-group">
                <input type="text" name="user" placeholder="Usuário" required>
            </div>
            <div class="input-group">
                <input type="password" name="senha" placeholder="Senha" required>
            </div>
            <button type="submit" class="btn-login">Entrar</button>
        </form>

        <footer>🐢 TurtleTrack © 2025</footer>
    </div>
</body>
</html>

<?php
session_start();
include("./php/config.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = $_POST['user'];
    $senha = $_POST['senha'];

    // Previne SQL Injection
    $user = mysqli_real_escape_string($conn, $user);
    $senha = mysqli_real_escape_string($conn, $senha);

    // Consulta no banco
    $sql = "SELECT * FROM users WHERE user='$user' AND senha='$senha'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $_SESSION['user'] = $row['user'];
        $_SESSION['type'] = $row['type'];

        // Redireciona para o menu principal
        header("Location: ./php/menu.php");
        exit();
    } else {
        echo "<script>alert('Usuário ou senha incorretos!'); window.location.href='index.php';</script>";
    }
}
?>
