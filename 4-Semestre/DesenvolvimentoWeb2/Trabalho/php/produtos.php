<?php
include('config.php');
include('functions.php');
?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>Produtos - TurtleTrack</title>
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

    <main class="content">
        <h2>📦 Lista de Produtos</h2>

        <input type="text" id="search" placeholder="🔍 Buscar produto..." onkeyup="buscarProduto()">

        <table id="tabela-produtos">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Quantidade</th>
                    <th>Preço</th>
                    <th>Categoria</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $result = listarProdutos($conn);
                if ($result && $result->num_rows > 0):
                    while ($row = $result->fetch_assoc()):
                ?>
                        <tr>
                            <td><?= $row['id']; ?></td>
                            <td><?= htmlspecialchars($row['nome']); ?></td>
                            <td><?= $row['quantidade_estoque']; ?></td>
                            <td>R$ <?= number_format($row['preco'], 2, ',', '.'); ?></td>
                            <td><?= htmlspecialchars($row['categoria'] ?? '-'); ?></td>
                            <td>                                
                                <button class="btn-edit" onclick='abrirEdicao(<?= json_encode($row) ?>)'>✏️</button>
                                <button class="btn-del" onclick="excluirProduto(<?= $row['id'] ?>)">🗑️</button>
                            </td>
                        </tr>
                <?php
                    endwhile;
                else:
                    echo "<tr><td colspan='6'>Nenhum produto encontrado.</td></tr>";
                endif;
                ?>
            </tbody>
        </table>
        <!-- Modal de Edição -->
        <div id="modal-editar" class="modal" style="display:none;">
            <div class="modal-content">
                <h3>Editar Produto</h3>
                <form id="form-editar">
                    <input type="hidden" id="edit-id" name="id">

                    <label for="edit-nome">Nome:</label>
                    <input type="text" id="edit-nome" name="nome" required>

                    <label for="edit-quantidade">Quantidade:</label>
                    <input type="number" id="edit-quantidade" name="quantidade" required>

                    <label for="edit-preco">Preço:</label>
                    <input type="number" step="0.01" id="edit-preco" name="preco" required>

                    <label for="edit-categoria">Categoria:</label>
                    <input type="text" id="edit-categoria" name="categoria">

                    <button type="submit" class="btn-save">💾 Salvar</button>
                    <button type="button" class="btn-cancel" onclick="fecharModal()">Cancelar</button>
                </form>
            </div>
        </div>
    </main>
    <footer class="footer">© 2025 TurtleTrack | Gerencie seu estoque com leveza</footer>
</body>

<script>
function buscarProduto() {
    const input = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#tabela-produtos tbody tr");
    rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(input) ? "" : "none";
    });
}

// 🗑️ Função para excluir produto
function excluirProduto(id) {
    if (confirm("Deseja realmente excluir este produto?")) {
        fetch('delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'id=' + id
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            location.reload();
        })
        .catch(() => alert("Erro ao excluir produto!"));
    }
}

// ✏️ Função para abrir modal de edição
function abrirEdicao(produto) {
    const modal = document.getElementById("modal-editar");
    modal.style.display = "flex";
    document.getElementById("edit-id").value = produto.id;
    document.getElementById("edit-nome").value = produto.nome;
    document.getElementById("edit-quantidade").value = produto.quantidade_estoque;
    document.getElementById("edit-preco").value = produto.preco;
    document.getElementById("edit-categoria").value = produto.categoria || "";
}

// Fechar modal
function fecharModal() {
    document.getElementById("modal-editar").style.display = "none";
}

// Enviar edição ao servidor
document.getElementById("form-editar").addEventListener("submit", e => {
    e.preventDefault();
    const dados = new URLSearchParams(new FormData(e.target));
    fetch('edit.php', { method: 'POST', body: dados })
        .then(r => r.text())
        .then(data => {
            alert(data);
            fecharModal();
            location.reload();
        })
        .catch(() => alert("Erro ao atualizar produto!"));
});
</script>


</html>
