# Tema 1 — Segurança em APIs REST e Microsserviços

Material do seminário de Segurança da Informação, IFSP Câmpus Catanduva.
Apresentação em 05/11/2026, de 18 a 22 minutos.
Grupo: Guilherme, Eduardo, Lucas Marcelino e Ruan.

Pacote atualizado em 27/10/2026.

## O que mudou desde o pacote anterior

- **Novo:** `documentos/Apresentacao-Slides-Tema1.pdf`, com os 36 slides da
  apresentação, gerado a partir da versão atual do deck online.
- O deck agora tem os três diagramas (slides 13, 18 e 25), a linha do tempo
  (slide 5), os casos reais (slide 7), os resultados dos testes (slide 29) e a
  tabela de vantagens x desvantagens (slide 32).
- Os dois documentos foram exportados de novo a partir da versão online.

## O que tem aqui

```
Tema1-Seguranca-APIs-REST/
├── README.md
├── documentos/
│   ├── Apresentacao-Slides-Tema1.pdf      36 slides, 16:9, para apresentar ou imprimir
│   ├── Documento-de-Contexto-Tema1.pdf    58 páginas, base de estudo do grupo
│   ├── Documento-de-Contexto-Tema1.docx   o mesmo documento, editável no Word
│   └── Roteiro-de-Apresentacao-Tema1.pdf  7 páginas, roteiro de falas e ensaio
├── imagens/
│   ├── 01-camadas-de-defesa.png           slide 18 do deck
│   ├── 02-preflight-cors.png              slide 25 do deck
│   └── 03-arquitetura-de-referencia.png   slide 13 do deck
└── codigo/
    ├── app.js                             API de exemplo (seção 13 do documento)
    ├── teste.sh                           requisições cujos resultados estão no slide 29
    └── package.json                       dependências
```

## Estrutura da apresentação

| Parte | Slides | Quem apresenta |
| --- | --- | --- |
| Abertura e roteiro | 1 e 2 | Grupo |
| 01 Introdução e conceituação | 3 a 10 | Guilherme |
| 02 Funcionamento e arquitetura | 11 a 19 | Eduardo |
| 03 Aplicação prática e código | 20 a 29 | Lucas e Ruan |
| 04 Conclusão | 30 a 36 | Ruan e grupo |

O PDF dos slides não traz as notas do apresentador. Elas estão no deck online.

Atenção: o arquivo do roteiro ainda descreve a versão antiga, de 13 slides,
com integrantes A a D. As falas por assunto continuam valendo, mas a numeração
e a divisão de slides de referência são as da tabela acima.

## Código

É a API de pedidos usada como exemplo. Os arquivos são código-fonte: abrem em
um editor (VS Code, por exemplo), não com duplo clique.

Requisito: Node.js 22 ou mais recente.

Dentro da pasta `codigo`:

```
npm install
```

Subir a API no Linux, macOS ou Git Bash:

```
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") PORTA=3111 node app.js
```

Subir a API no Windows (PowerShell):

```
$env:JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$env:PORTA = "3111"
node app.js
```

Com a API no ar, em outro terminal (precisa de `bash` e `curl`; no Windows,
use o Git Bash ou o WSL):

```
bash teste.sh
```

A saída esperada é a da tabela do slide 29 e da seção 13.8 do documento.

O exemplo é didático e roda só na sua máquina: dados em memória, senhas em
texto puro, limite de taxa por IP e sem gateway.

Os slides de código usam a biblioteca `jsonwebtoken`; a API de exemplo usa
`jose`. As regras de validação do token são as mesmas nas duas.

## O que conferir antes de citar

A seção 18.3 do Documento de Contexto lista os limites da pesquisa. Em resumo:

- Os números de 2026 vêm do comunicado de imprensa da Akamai, não do relatório completo.
- Os detalhes do caso Dell são o relato do autor do ataque à imprensa.
- As datas anteriores a 2019 não foram reconferidas em fonte primária.
