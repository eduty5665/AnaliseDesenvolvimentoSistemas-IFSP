import streamlit as st
import pickle
import pandas as pd
import numpy as np


st.set_page_config(page_title="Predição de Compra", page_icon="📊")

# Carregar o modelo e o scaler
@st.cache_resource
def carregar_modelo():
    with open("modelo/logistic_model.pkl", "rb") as model_file:
        logistic_model, scaler = pickle.load(model_file)
    return logistic_model, scaler

try:
    logistic_model, scaler = carregar_modelo()
except FileNotFoundError:
    st.error("Arquivo do modelo não encontrado.")
    st.stop()


# Informações institucionais
st.markdown("""
**Professor Dr. Márcio Andrey Teixeira**  
**IFSP - Campus Catanduva**  
Aplicação didática desenvolvida para demonstração de Machine Learning com Regressão Logística.
""")

st.markdown("---")

# Título da aplicação
st.title("Predição de Compra")

# Entrada de dados do usuário
st.header("Informações do Usuário")
gender = st.selectbox("Gênero", ["Masculino", "Feminino"])
age = st.number_input("Idade", min_value=18, max_value=100, value=25)
estimated_salary = st.number_input("Salário Estimado", min_value=15000, max_value=150000, value=50000)

# Converter entrada de dados
gender_encoded = 0 if gender == "Masculino" else 1
input_data = np.array([[gender_encoded, age, estimated_salary]])
input_data[:, 1:] = scaler.transform(input_data[:, 1:])

# Prever compra
if st.button("Prever"):
    prediction = logistic_model.predict(input_data)
    probability = logistic_model.predict_proba(input_data)[0, 1]

    if prediction[0] == 1:
        st.success(f"Usuário provavelmente fará uma compra! (Probabilidade: {probability:.2f})")
    else:
        st.error(f"Usuário provavelmente não fará uma compra. (Probabilidade: {probability:.2f})")