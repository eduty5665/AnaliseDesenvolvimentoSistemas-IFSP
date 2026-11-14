# Previsão do Preço de Combustível — Trabalho Prático de IA

**Disciplina:** Tópicos Avançados em Inteligência Artificial — IFSP Campus Catanduva
**Professor:** Prof. Dr. Márcio Andrey Teixeira
**Integrantes:** _nome 1_, _nome 2_, _nome 3_

**Link da aplicação:** _colar aqui o link do Streamlit Cloud_
**Repositório:** _colar aqui o link do GitHub_

## O que a aplicação faz

Estima o preço de venda de um combustível (R$ por litro) em um município, para a semana seguinte ao último dado da ANP, a partir dos preços médios das semanas anteriores no município e no estado. Modelo: regressão linear (comparada com árvore de decisão no notebook).

## Estrutura

```
app_combustivel/
├── app.py                         # aplicação Streamlit
├── requirements.txt               # bibliotecas
├── README.md
└── modelo/
    ├── modelo_combustivel.pkl     # (regressor, ct, feature_names, info)
    ├── ultimos_precos_municipio.csv
    └── ultimos_precos_uf.csv
```

O notebook de treinamento é `previsao_combustivel_aula.ipynb`. Ele gera os três arquivos da pasta `modelo/` no Drive (`Lab_IA/modelo`).

## Dataset

Série histórica de preços de combustíveis da ANP, arquivo semestral de combustíveis automotivos, 1º semestre de 2026, baixado em dados.gov.br:
https://dados.gov.br/dados/conjuntos-dados/serie-historica-de-precos-de-combustiveis-e-de-glp

Para rodar o notebook, renomear o CSV para `precos_combustivel_2026_01.csv` e colocar em `Lab_IA/Dataset` no Google Drive.

## Como executar

1. Rodar o notebook no Colab, em ordem. No fim ele salva os arquivos em `Lab_IA/modelo`.
2. Copiar os três arquivos para a pasta `modelo/` deste projeto.
3. No Colab, rodar `import sklearn; print(sklearn.__version__)` e colocar essa versão no `requirements.txt` (exemplo: `scikit-learn==1.6.1`). O pickle só abre com a mesma versão do scikit-learn usada no treino.
4. Rodar localmente:
   ```
   pip install -r requirements.txt
   streamlit run app.py
   ```
5. Deploy: subir a pasta no GitHub e criar o app em share.streamlit.io apontando para `app.py`.

## Casos de teste

| # | Tipo | Entrada | Esperado | Obtido | Comentário |
|---|---|---|---|---|---|
| 1 | Válido | SP / São Paulo / Gasolina comum / Branca | Preço perto do último preço da cidade | _preencher_ | _preencher_ |
| 2 | Válido | SP / Ribeirão Preto / Etanol / Raízen | Preço perto do último preço da cidade | _preencher_ | _preencher_ |
| 3 | Válido | AM / Manaus / Diesel S10 / Ipiranga | Preço mais alto que no Sudeste | _preencher_ | _preencher_ |
| 4 | Inválido | SP / São Paulo / Gasolina / Vibra, preço informado R$ 0,50 | Mensagem de erro, sem previsão | _preencher_ | _preencher_ |
| 5 | Difícil | SP / Catanduva / Gasolina comum / Branca | Previsão com aviso de dado desatualizado | _preencher_ | _preencher_ |

Para cada caso: tirar captura de tela da aplicação publicada. Não existe preço real conhecido para a semana prevista (julho de 2026 não está no arquivo), então a saída não deve ser tratada como certa.

Conferência: o caso 1 deve dar o mesmo valor na célula "Previsão manual" do notebook e na aplicação.

## Limitações

- Os dados vão até 30/06/2026; a previsão é para a semana seguinte, não para hoje.
- O modelo não sabe de choques novos (guerra, reajuste da Petrobras, impostos).
- GNV não é previsto.
- Município sem coleta recente usa a média do estado.
- Postos da mesma cidade têm preços diferentes; o modelo estima a média.

## Contribuições

| Integrante | O que fez |
|---|---|
| _nome 1_ | _preencher_ |
| _nome 2_ | _preencher_ |
| _nome 3_ | _preencher_ |

## Uso de IA

_Descrever como o grupo usou IA (por exemplo, o Claude para analisar o dataset e gerar a primeira versão do notebook e da aplicação) e o que o grupo revisou, testou e alterou._

## Referências

- ANP — Série histórica de preços de combustíveis (dados.gov.br)
- Banco Central — SGS série 1 (dólar PTAX)
- Material e notebooks das aulas (regressão linear, árvore de decisão, deploy com Streamlit)
- Documentação do scikit-learn e do Streamlit
