# Tema 1 — Segurança em APIs REST e Microsserviços

Material do seminário de Segurança da Informação (apresentação em 05/11/2026, 18 a 22 minutos).
Grupo: Guilherme, Eduardo, Lucas Marcelino e Ruan.

Pacote gerado em 09/10/2026.

## O que tem aqui

```
Tema1-Seguranca-APIs-REST/
├── README.md
├── documentos/
│   ├── Documento-de-Contexto-Tema1.pdf     58 páginas, base de estudo do grupo
│   ├── Documento-de-Contexto-Tema1.docx    mesma coisa, editável no Word
│   └── Roteiro-de-Apresentacao-Tema1.pdf   7 páginas, 13 slides em 20 minutos
├── imagens/
│   ├── 01-camadas-de-defesa.png            diagrama da seção 6.4
│   ├── 02-preflight-cors.png               diagrama da seção 10.3
│   └── 03-arquitetura-de-referencia.png    diagrama da seção 12.2
└── codigo/
    ├── app.js                              API de exemplo da seção 13
    ├── teste.sh                            requisições da tabela da seção 13.8
    └── package.json                        dependências
```

## Por onde começar

1. Ler o resumo executivo (seção 2) do Documento de Contexto.
2. Abrir o Roteiro e definir quem é o integrante A, B, C e D.
3. Montar os slides usando a coluna "Apoio" do roteiro, que aponta a seção do
   Documento de Contexto de cada slide.

## Documentos

| Arquivo | Para que serve |
| --- | --- |
| Documento de Contexto | História, conceitos, OWASP API Security Top 10, os cinco itens do escopo (tokens, rate limiting, CORS, payload, arquitetura), código comentado, vantagens x desvantagens, checklist, glossário e referências em ABNT |
| Roteiro de Apresentação | Divisão em quatro blocos, o que mostrar e o que falar em cada slide, frases de passagem, marcas de tempo, checklist de ensaio e perguntas prováveis |

O roteiro vai só em PDF. A versão editável é o documento online; para baixar em
Word, abra o documento, clique no nome dele e escolha Exportar.

A seção 16 do Documento de Contexto traz uma versão resumida e mais antiga do
roteiro. Vale a do arquivo separado.

## Imagens

Os três diagramas estão em PNG com 1344 px de largura e fundo branco, prontos
para colar nos slides.

| Arquivo | Sugestão de slide |
| --- | --- |
| 01-camadas-de-defesa.png | Slide 6 — Defesa em camadas |
| 02-preflight-cors.png | Slide 8 — Rate limiting e CORS |
| 03-arquitetura-de-referencia.png | Slide 6 (alternativa) ou slide 12 |

## Código

É a API de pedidos usada como exemplo na seção 13. Os arquivos são código-fonte:
abrem em um editor (VS Code, por exemplo), não com duplo clique.

Requisitos: Node.js 22 ou mais recente.

Instalar as dependências, dentro da pasta `codigo`:

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

Com a API no ar, em outro terminal:

```
bash teste.sh
```

O `teste.sh` precisa de `bash` e `curl`. No Windows, rode pelo Git Bash ou pelo
WSL. A saída esperada é a da tabela da seção 13.8.

O exemplo é didático e roda só na sua máquina: os dados ficam em memória, as
senhas estão em texto puro e não há gateway. A seção 13.9 lista o que ele
simplifica em relação a um sistema real.

## O que conferir antes de citar

A seção 18.3 do Documento de Contexto lista os limites da pesquisa. Em resumo:

- Os números de 2026 vêm do comunicado de imprensa da Akamai, não do relatório completo.
- Os detalhes do caso Dell são o relato do autor do ataque à imprensa.
- As datas da linha do tempo anteriores a 2019 não foram reconferidas em fonte primária.
- As obras da seção 18.2 devem ser abertas pelo grupo antes de entrarem nos slides.
