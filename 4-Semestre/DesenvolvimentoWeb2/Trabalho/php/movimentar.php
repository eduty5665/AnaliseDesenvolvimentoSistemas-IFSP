<?php
include('config.php');
include('functions.php');

// Processar o formulário
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $produto_id = $_POST['produto'];
    $tipo = $_POST['tipo'];
    $quantidade = intval($_POST['quantidade']);
    $descricao = $_POST['descricao'] ?? '';

    if (movimentarEstoque($conn, $produto_id, $tipo, $quantidade, $descricao)) {
        echo "<script>alert('Movimentação registrada com sucesso!'); window.location.href='movimentar.php';</script>";
    } else {
        echo "<script>alert('Erro ao registrar movimentação.');</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>Movimentar Produto - TurtleTrack</title>
    <link rel="stylesheet" href="../css/style.css">
</head>

<body class="dashboard-body">
    <header class="header">
        <img src="../src/turtle.png" alt="TurtleTrack Logo" class="logo-login">
        <nav>
            <a href="menu.php">🏠 Home</a>
            <a href="#">⚙️ Configurações</a>
            <a href="menu.php">⬅ Voltar</a>
        </nav>
    </header>

    <main class="estoque-container">

        <!-- Formulário de movimentação -->
        <section class="form-card">
            <h2>📥 Movimentar Estoque</h2>
            <form action="" method="post">
                <label for="produto">Produto</label>
                <select id="produto" name="produto" required>
                    <option value="">Selecione o produto...</option>
                    <?php
                    $result = listarProdutos($conn);
                    while ($row = $result->fetch_assoc()) {
                        echo "<option value='{$row['id']}'>{$row['nome']}</option>";
                    }
                    ?>
                </select>

                <label for="tipo">Tipo de Movimentação</label>
                <select id="tipo" name="tipo" required>
                    <option value="">Selecione...</option>
                    <option value="entrada">Entrada (Estoque)</option>
                    <option value="saida">Saída (Loja)</option>
                </select>

                <label for="quantidade">Quantidade</label>
                <input type="number" id="quantidade" name="quantidade" placeholder="Ex: 20" required>

                <label for="descricao">Observação (opcional)</label>
                <textarea id="descricao" name="descricao" rows="3" placeholder="Ex: Reposição de estoque da loja"></textarea>

                <button type="submit">Registrar Movimentação</button>
            </form>
        </section>

        <!-- Histórico de movimentações -->
        <section class="movimentos">
            <h3>📊 Histórico de Movimentações</h3>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Observação</th>
                        <th>Estoque Atual</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $sql = "SELECT 
                                m.*, 
                                p.nome, 
                                p.quantidade_estoque 
                            FROM movimentacoes m
                            JOIN produtos p ON m.produto_id = p.id
                            ORDER BY m.data_movimentacao DESC";

                    $result = $conn->query($sql);

                    if ($result && $result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            echo "<tr>
                                    <td>" . date('d/m/Y H:i', strtotime($row['data_movimentacao'])) . "</td>
                                    <td>{$row['nome']}</td>
                                    <td>" . ucfirst($row['tipo']) . "</td>
                                    <td>{$row['quantidade']}</td>
                                    <td>{$row['descricao']}</td>
                                    <td><strong>{$row['quantidade_estoque']}</strong></td>
                                  </tr>";
                        }
                    } else {
                        echo "<tr><td colspan='6'>Nenhuma movimentação registrada.</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </section>

    </main>

    <footer class="footer">© 2025 TurtleTrack | Controle completo do seu fluxo</footer>
</body>
</html>
