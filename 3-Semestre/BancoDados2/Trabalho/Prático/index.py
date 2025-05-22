from boto3 import resource
from boto3.dynamodb.conditions import Attr, Key
from datetime import datetime

cadnamo_table = resource('dynamodb').Table('NOME DA TABELA')

def insert():
    print(f'Inserção no Banco')
    response = cadnamo_table.put_item(
        Item={
                'customer_id': 'cus-05', # parition key --> mudar para dados do site
                'order_id' : 'ord-5',  # sort key --> mudar para dados do site
                'status': 'pending', # mudar para dados do site
                'created_date' : datetime.now().isoformat() # mudar para dados do site
            }
        )
    print(f'Resposta de Inserção: {response}') 

# chamada da função pelo botão insert()