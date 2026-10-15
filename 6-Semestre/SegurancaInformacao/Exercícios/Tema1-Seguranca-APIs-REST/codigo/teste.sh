#!/bin/bash
B=http://127.0.0.1:3111
TMP=$(mktemp -d)
J='Content-Type: application/json'
code() { curl -s -o $TMP/out.txt -w '%{http_code}' "$@"; echo " $(head -c 300 $TMP/out.txt)"; }

echo "== login Ana"
TA=$(curl -s -X POST $B/login -H "$J" -d '{"email":"ana@exemplo.com","senha":"senha-da-ana"}' | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).accessToken))')
echo "token: ${TA:0:25}..."

echo "== sem token"; code $B/pedidos/1001
echo "== Ana le o proprio pedido"; code $B/pedidos/1001 -H "Authorization: Bearer $TA"
echo "== INSEGURO: Ana le pedido do Beto"; code $B/inseguro/pedidos/1002 -H "Authorization: Bearer $TA"
echo "== CORRIGIDO: Ana tenta pedido do Beto"; code $B/pedidos/1002 -H "Authorization: Bearer $TA"
echo "== rota admin com token de cliente"; code -X DELETE $B/admin/pedidos/1001 -H "Authorization: Bearer $TA"
echo "== mass assignment"; code -X POST $B/pedidos -H "$J" -H "Authorization: Bearer $TA" -d '{"produto":"Mouse","quantidade":1,"custoInterno":0,"usuarioId":"u2"}'
echo "== tipo errado"; code -X POST $B/pedidos -H "$J" -H "Authorization: Bearer $TA" -d '{"produto":"Mouse","quantidade":"1"}'
echo "== payload valido"; code -X POST $B/pedidos -H "$J" -H "Authorization: Bearer $TA" -d '{"produto":"  Mouse ","quantidade":2}'
echo "== NoSQL-style no login"; code -X POST $B/login -H "$J" -d '{"email":"ana@exemplo.com","senha":{"$ne":null}}'
echo "== token adulterado"; code $B/pedidos/1001 -H "Authorization: Bearer ${TA}x"
echo "== alg none"
NONE="$(printf '{"alg":"none","typ":"JWT"}' | base64 -w0 | tr '+/' '-_' | tr -d '=').$(printf '{"sub":"u2","papel":"admin","iss":"https://auth.exemplo.com","aud":"api-pedidos","exp":9999999999}' | base64 -w0 | tr '+/' '-_' | tr -d '=')."
code $B/pedidos/1002 -H "Authorization: Bearer $NONE"
echo "== corpo grande"; head -c 20000 /dev/zero | tr '\0' 'a' > $TMP/big.txt
code -X POST $B/pedidos -H "$J" -H "Authorization: Bearer $TA" --data-binary "{\"produto\":\"$(cat $TMP/big.txt)\",\"quantidade\":1}"
echo "== json quebrado"; code -X POST $B/pedidos -H "$J" -H "Authorization: Bearer $TA" -d '{"produto":'
echo "== preflight origem permitida"
curl -s -i -X OPTIONS $B/pedidos/1001 -H 'Origin: https://loja.exemplo.com' -H 'Access-Control-Request-Method: DELETE' -H 'Access-Control-Request-Headers: authorization' | grep -i -E '^HTTP|access-control|vary'
echo "== preflight origem maliciosa"
curl -s -i -X OPTIONS $B/pedidos/1001 -H 'Origin: https://site-malicioso.net' -H 'Access-Control-Request-Method: DELETE' | grep -i -E '^HTTP|access-control|vary'
echo "== cabecalhos de uma resposta"
curl -s -i $B/pedidos/1001 -H "Authorization: Bearer $TA" | grep -i -E '^HTTP|ratelimit|strict-transport|x-content-type|x-powered|cache-control|content-security'
echo "== forca bruta no login (8 tentativas)"
for i in 1 2 3 4 5 6 7 8; do curl -s -o /dev/null -w '%{http_code} ' -X POST $B/login -H "$J" -d '{"email":"ana@exemplo.com","senha":"errada-'$i'00"}'; done; echo
curl -s -i -X POST $B/login -H "$J" -d '{"email":"ana@exemplo.com","senha":"errada-900"}' | grep -i -E '^HTTP|ratelimit|retry-after'
