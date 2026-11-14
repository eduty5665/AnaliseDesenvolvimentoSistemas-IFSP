import streamlit as st
import pickle
import pandas as pd


st.set_page_config(page_title="Previsão do Preço de Combustível", page_icon="⛽")


def reais(valor):
    # "\$" evita que o Streamlit leia o cifrão como fórmula matemática
    return f"R\\$ {valor:.2f}".replace(".", ",")

# Carregar o modelo, o ct e as tabelas de últimos preços
@st.cache_resource
def carregar_modelo():
    with open("modelo/modelo_combustivel.pkl", "rb") as model_file:
        regressor, ct, feature_names, info = pickle.load(model_file)
    precos_mun = pd.read_csv("modelo/ultimos_precos_municipio.csv")
    precos_uf = pd.read_csv("modelo/ultimos_precos_uf.csv")
    return regressor, ct, feature_names, info, precos_mun, precos_uf

try:
    regressor, ct, feature_names, info, precos_mun, precos_uf = carregar_modelo()
except FileNotFoundError:
    st.error("Arquivo do modelo não encontrado. Confira a pasta modelo/.")
    st.stop()


# Informações do trabalho
st.markdown("**Tópicos Avançados em Inteligência Artificial — IFSP Campus Catanduva**")
st.markdown("**Integrantes:** _preencher_")
st.markdown("Trabalho prático: previsão do preço de combustível com dados da ANP (1º semestre de 2026).")

st.markdown("---")

st.title("Previsão do Preço de Combustível")
ultima = pd.Timestamp(info["ultima_semana"])
st.write(
    "Informe o local, o combustível e a bandeira do posto. A aplicação estima o preço de venda, "
    f"em R\\$ por litro, para a semana seguinte ao último dado disponível (semana de {ultima:%d/%m/%Y})."
)

# Entrada de dados do usuário
st.header("Dados da consulta")

lista_uf = sorted(precos_uf["uf"].unique())
uf = st.selectbox("Estado (UF)", lista_uf, index=lista_uf.index("SP"))

municipios_uf = sorted(m.split("-", 1)[1] for m in precos_mun["municipio"].unique() if m.startswith(uf + "-"))
municipio = st.selectbox("Município", municipios_uf,
                         help="Municípios pesquisados pela ANP no 1º semestre de 2026.")

produtos = {"Gasolina comum": "GASOLINA", "Gasolina aditivada": "GASOLINA ADITIVADA",
            "Etanol": "ETANOL", "Diesel S10": "DIESEL S10", "Diesel comum": "DIESEL"}
produto_nome = st.selectbox("Combustível", list(produtos.keys()))
produto = produtos[produto_nome]

bandeiras = {"Branca (sem bandeira)": "BRANCA", "Vibra (BR)": "VIBRA", "Ipiranga": "IPIRANGA",
             "Raízen (Shell)": "RAIZEN", "Ale": "ALE", "Outra": "OUTRAS"}
bandeira = bandeiras[st.selectbox("Bandeira do posto", list(bandeiras.keys()))]

informar_preco = st.checkbox("Quero informar o preço que vi nesta semana no município")
preco_visto = None
if informar_preco:
    preco_visto = st.number_input("Preço que você viu (R$ por litro)", min_value=0.0, max_value=20.0,
                                  value=6.00, step=0.01, format="%.2f")

dolar = None
if "dolar_ant" in feature_names:
    dolar = st.number_input("Dólar (R$) — cenário", min_value=3.0, max_value=10.0,
                            value=float(info.get("dolar_ant", 5.3)), step=0.01, format="%.2f",
                            help="Já vem com o último valor usado no treino. Pode mudar para simular outro cenário.")


# Prever o preço
if st.button("Prever"):
    erros = []
    if not municipio:
        erros.append("Escolha um município.")
    if preco_visto is not None and not (2.0 <= preco_visto <= 15.0):
        erros.append("O preço informado deve estar entre R\\$ 2,00 e R\\$ 15,00 por litro.")

    linha_uf = precos_uf[(precos_uf["uf"] == uf) & (precos_uf["produto"] == produto)]
    if linha_uf.empty:
        erros.append(f"Não há preços recentes de {produto_nome} em {uf} para fazer a previsão.")

    if erros:
        for e in erros:
            st.error(e)
        st.stop()

    preco_uf_ant = float(linha_uf["preco_uf_ant"].iloc[0])
    avisos = []
    origem = "média do município nas semanas anteriores"

    linha_mun = precos_mun[(precos_mun["municipio"] == f"{uf}-{municipio}") & (precos_mun["produto"] == produto)]
    if linha_mun.empty:
        preco_mun_ant = preco_mun_ant2 = preco_uf_ant
        origem = "média do estado"
        avisos.append(f"{municipio} não tem coleta recente de {produto_nome}. Usamos a média do estado.")
    else:
        ant = linha_mun["preco_mun_ant"].iloc[0]
        ant2 = linha_mun["preco_mun_ant2"].iloc[0]
        if pd.isna(ant) and pd.isna(ant2):
            ant = ant2 = preco_uf_ant
            origem = "média do estado"
            coleta = pd.Timestamp(linha_mun["ultima_coleta"].iloc[0])
            avisos.append(f"A última coleta de {produto_nome} em {municipio} foi em {coleta:%d/%m/%Y}. "
                          "Como não há dado recente, usamos a média do estado.")
        elif pd.isna(ant):
            ant = ant2
        elif pd.isna(ant2):
            ant2 = ant
        preco_mun_ant, preco_mun_ant2 = float(ant), float(ant2)

    if preco_visto is not None:
        preco_mun_ant2 = preco_mun_ant
        preco_mun_ant = preco_visto
        origem = "preço informado por você"

    # Montar a entrada igual ao treino
    entrada = pd.DataFrame([{
        "produto": produto, "bandeira": bandeira, "uf": uf,
        "preco_mun_ant": preco_mun_ant, "preco_mun_ant2": preco_mun_ant2, "preco_uf_ant": preco_uf_ant}])
    if dolar is not None:
        entrada["dolar_ant"] = dolar

    previsto = regressor.predict(ct.transform(entrada[feature_names]))[0]
    erro_medio = info["mae_teste"]

    st.success(f"Preço estimado de {produto_nome} em {municipio}/{uf}: {reais(previsto)} por litro")
    st.write(f"Faixa provável: {reais(previsto - erro_medio)} a {reais(previsto + erro_medio)} "
             f"(mais ou menos o erro médio do modelo no teste, {reais(erro_medio)}).")
    st.write(f"Preço de referência usado ({origem}): {reais(preco_mun_ant)}")
    for a in avisos:
        st.warning(a)


st.markdown("---")
with st.expander("Como funciona e limitações"):
    st.markdown(f"""
- Modelo: regressão linear treinada com os preços da ANP de janeiro a junho de 2026.
- Entradas: combustível, bandeira, estado e os preços médios das semanas anteriores no município e no estado.
- Os dados vão até a semana de {ultima:%d/%m/%Y}. A previsão é para a semana seguinte, não para hoje.
- O modelo não sabe de choques novos (guerra, reajuste da Petrobras, mudança de imposto).
- Postos da mesma cidade cobram preços diferentes; o modelo estima a média esperada.
- GNV não é previsto (unidade diferente, R$/m³).
""")
