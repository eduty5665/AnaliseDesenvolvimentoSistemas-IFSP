-- Conferência da carga: o kardex precisa fechar com o saldo em todo produto/depósito e as vendas com seus itens e pagamentos.
-- Todos os contadores devem voltar 0.
WITH efeitos AS (
  SELECT CASE WHEN m."Tipo" IN ('Entrada', 'RecebimentoTransferencia', 'CancelamentoVenda') THEN m."DepositoDestinoId" ELSE m."DepositoOrigemId" END AS dep,
         i."ProdutoId" AS prod, m."Data", m."Id",
         CASE WHEN m."Tipo" IN ('Entrada', 'RecebimentoTransferencia', 'CancelamentoVenda') THEN abs(i."Quantidade")
              WHEN m."Tipo" = 'Ajuste' THEN i."Quantidade" ELSE -abs(i."Quantidade") END AS delta
  FROM vino."Movimentacoes" m JOIN vino."ItensMovimentacao" i ON i."MovimentacaoId" = m."Id"
  UNION ALL   -- transferência direta (sem ordem de separação): o mesmo documento também dá entrada no destino
  SELECT m."DepositoDestinoId", i."ProdutoId", m."Data", m."Id", abs(i."Quantidade")
  FROM vino."Movimentacoes" m JOIN vino."ItensMovimentacao" i ON i."MovimentacaoId" = m."Id"
  WHERE m."Tipo" = 'Transferencia' AND m."OrdemSeparacaoId" IS NULL
), corrido AS (
  SELECT dep, prod, sum(delta) OVER (PARTITION BY dep, prod ORDER BY "Data", "Id" ROWS UNBOUNDED PRECEDING) AS saldo FROM efeitos
), total AS (SELECT dep, prod, sum(delta) AS q FROM efeitos GROUP BY dep, prod)
SELECT
  (SELECT count(*) FROM vino."Saldos" s LEFT JOIN total t ON t.dep = s."DepositoId" AND t.prod = s."ProdutoId" WHERE s."Quantidade" <> COALESCE(t.q, 0)) AS saldos_que_nao_fecham_com_kardex,
  (SELECT count(*) FROM corrido WHERE saldo < 0) AS saldos_negativos_no_historico,
  (SELECT count(*) FROM vino."Saldos" WHERE "Reservado" > "Quantidade") AS reservado_maior_que_fisico,
  (SELECT count(*) FROM vino."Vendas" v WHERE v."Total" + v."Troco" <> (SELECT sum(p."Valor") FROM vino."PagamentosVenda" p WHERE p."VendaId" = v."Id")) AS vendas_com_pagamento_divergente,
  (SELECT count(*) FROM vino."Vendas" v WHERE v."Subtotal" <> (SELECT sum(i."Total") FROM vino."ItensVenda" i WHERE i."VendaId" = v."Id")) AS vendas_com_itens_divergentes;
