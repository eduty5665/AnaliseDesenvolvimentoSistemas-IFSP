<?php
include('config.php');

function listarProdutos($conn) {
    $sql = "SELECT * FROM produtos ORDER BY id DESC";
    return $conn->query($sql);
}

function buscarProduto($conn, $busca) {
    $sql = "SELECT * FROM produtos WHERE nome LIKE '%$busca%'";
    return $conn->query($sql);
}

function adicionarProduto($conn, $nome, $quantidade, $preco) {
    $sql = "INSERT INTO produtos (nome, quantidade_estoque, preco) 
            VALUES ('$nome', '$quantidade', '$preco')";
    return $conn->query($sql);
}

function editarProduto($conn, $id, $nome, $quantidade, $preco) {
    $sql = "UPDATE produtos 
            SET nome='$nome', quantidade_estoque='$quantidade', preco='$preco'
            WHERE id=$id";
    return $conn->query($sql);
}

function deletarProduto($conn, $id) {
    $sql = "DELETE FROM produtos WHERE id=$id";
    return $conn->query($sql);
}

function movimentarProduto($conn, $id, $qtd_loja) {
    $sql = "UPDATE produtos 
            SET quantidade_estoque = quantidade_estoque - $qtd_loja,
                quantidade_loja = quantidade_loja + $qtd_loja
            WHERE id = $id";
    return $conn->query($sql);
}

function movimentarEstoque($conn, $produto_id, $tipo, $quantidade, $descricao) {
    if ($tipo === 'entrada') {
        $sql = "UPDATE produtos 
                SET quantidade_estoque = quantidade_estoque + $quantidade
                WHERE id = $produto_id";
    } elseif ($tipo === 'saida') {
        $sql = "UPDATE produtos 
                SET quantidade_estoque = quantidade_estoque - $quantidade,
                    quantidade_loja = quantidade_loja + $quantidade
                WHERE id = $produto_id";
    } else {
        return false;
    }

    $conn->query($sql);

    // Registrar no histórico
    $descricao = $conn->real_escape_string($descricao);
    $sql_mov = "INSERT INTO movimentacoes (produto_id, tipo, quantidade, descricao)
                VALUES ($produto_id, '$tipo', $quantidade, '$descricao')";
    return $conn->query($sql_mov);
}
?>