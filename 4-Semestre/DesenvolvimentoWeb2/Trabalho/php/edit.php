<?php
include('config.php');
include('functions.php');

if (isset($_POST['id'], $_POST['nome'], $_POST['quantidade'], $_POST['preco'])) {
    $id = intval($_POST['id']);
    $nome = $_POST['nome'];
    $quantidade = $_POST['quantidade'];
    $preco = $_POST['preco'];

    $sql = "UPDATE produtos 
            SET nome='$nome', quantidade_estoque='$quantidade', preco='$preco'
            WHERE id=$id";

    if ($conn->query($sql)) {
        echo "✅ Produto atualizado com sucesso!";
    } else {
        echo "❌ Erro ao atualizar produto: " . $conn->error;
    }
}
?>
