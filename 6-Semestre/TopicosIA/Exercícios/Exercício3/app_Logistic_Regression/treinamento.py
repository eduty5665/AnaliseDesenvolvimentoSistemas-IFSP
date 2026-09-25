import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
import pickle

# Carregar o dataset
dataset = pd.read_csv('dataset/Social_Network_Ads.csv')

# Pré-processamento
if 'User ID' in dataset.columns:
    dataset = dataset.drop('User ID', axis=1)

label_encoder = LabelEncoder()
dataset['Gender'] = label_encoder.fit_transform(dataset['Gender'])

X = dataset.drop('Purchased', axis=1)
y = dataset['Purchased']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

scaler = StandardScaler()
X_train[['Age', 'EstimatedSalary']] = scaler.fit_transform(X_train[['Age', 'EstimatedSalary']])
X_test[['Age', 'EstimatedSalary']] = scaler.transform(X_test[['Age', 'EstimatedSalary']])

# Treinar modelo
logistic_model = LogisticRegression(random_state=42)
logistic_model.fit(X_train, y_train)

# Salvar o modelo e o scaler
with open('modelo/logistic_model.pkl', 'wb') as model_file:
    pickle.dump((logistic_model, scaler), model_file)