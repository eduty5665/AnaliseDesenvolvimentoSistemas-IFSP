<?php
include('config.php');
include('functions.php');

if (isset($_POST['id'])) {
    $id = intval($_POST['id']);
    if (deletarProduto($conn, $id)) {
        echo "✅ Produto excluído com sucesso!";
    } else {
        echo "❌ Erro ao excluir produto.";
    }
}
?>
