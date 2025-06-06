from boto3 import resource
from boto3.dynamodb.conditions import Attr, Key
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3

#INTEGRAÇÃO BANCO DE DADOS

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

#SELECT * (FAZER)


#SELECT FILTROS

def query_by_partition_key(customer_value):
    print('Select por ID')

    response = {}
    filtering_exp = Key('customer_id').eq(customer_value)
    response = cadnamo_table.query(
        KeyConditionExpression=filtering_exp)
    #print(f'Query response: {response}')
    #print(f'Query response: {response["Items"]}')

    item_list = response["Items"]
    for item in item_list:
        print(f'Item: {item}')
# chamada da função pelo botão query_by_partition_key('CHAVE QUE DESEJA LER')

def query_by_partition_key_order(customer_value):
    print(f'\n\t\t\t>>>>>>>>>>>>>>>>> demo_query_partition_key_order <<<<<<<<<<<<<<<<<<<<<<')
    
    response = {}
    filtering_exp = Key('customer_id').eq(customer_value)
    response = cadnamo_table.query(
        KeyConditionExpression=filtering_exp,
        ScanIndexForward=True)#true-->crescente, false-->decrescente
    
    item_list = response["Items"]
    for item in item_list:
        print(f'Item: {item}')
# chamada da função pelo botão query_by_partition_key_order('CHAVE QUE DESEJA LER')

def query_by_index_key(status_value):
    print(f'\n\t\t\t>>>>>>>>>>>>>>>>> demo_query_index_key <<<<<<<<<<<<<<<<<<<<<<')
    
    filtering_exp = Key('status').eq(status_value)
    response = cadnamo_table.query(
        IndexName="status-index",
        KeyConditionExpression=filtering_exp,
        ScanIndexForward=False)
    
    for item in response["Items"]:
        print(f'Item: {item}')
# chamada da função pelo botão query_by_index_key('STATUS QUE DESEJA LER')
#esta função é para o status, por exemplo, um campo texto
#um campo que não tem como filtrar a info, então cria-se um index para esse campo
#index global(criado a qualquer hora) ou local(criado junto com a tabela)
#depois so pegar esse index que sera equivalente ao campo
#query_by_index_key('pending') chamando a função com o status pending
#mas iremos chamar pelo botao

def query_by_partition_key_and_sort_key(customer_value, order_value):
    print(f'\n\t\t\t>>>>>>>>>>>>>>>>> demo_query_partition_key_and_sort_key <<<<<<<<<<<<<<<<<<<<<<')
    
    response={}
    filtering_exp = Key('customer_id').eq(customer_value)
    filtering_exp2 = Key('order_id').eq(order_value)
    response = cadnamo_table.query(
        KeyConditionExpression=filtering_exp & filtering_exp2)
    
    for item in response["Items"]:
        print(f'Item: {item}')
# chamada da função pelo botão query_by_partition_key_and_sort_key('CHAVE1', 'CHAVE1')
# Esta função ensina como mesclar duas ou mais chaves para busca
# aqui ele mescla a chave de partição e a chave real para buscar as infos






#CHAMADA DE FUNÇÃO

def configurar_abas():
    nivel_acesso = cod_acess_entry.get()
    
    # Exibe apenas as abas permitidas
    if nivel_acesso == '01':  # Usuário com acesso limitado
        notebook.add(aba_buscar, text="Menu Usuário")
        notebook.forget(aba_acesso)
    elif nivel_acesso == '02':  # Administrador com acesso total
        notebook.add(aba_menu, text="Menu Admin")
        notebook.forget(aba_acesso)


#CRIAÇÃO DAS TELAS - INTERFACE

# Configuração da interface
tela = tk.Tk()
tela.title("Cadastro de Livros")

# Criando o notebook (abas)
notebook = ttk.Notebook(tela)
notebook.pack(pady=10, expand=True)

# Aba de Acesso
aba_acesso = ttk.Frame(notebook)
notebook.add(aba_acesso, text="Login")

# Elementos da aba de acesso
title_label = tk.Label(aba_acesso, text="Acesso ao Sistema ")
title_label.grid(row=0, column=1, padx=10, pady=10)
user_label = tk.Label(aba_acesso, text="Use suas credenciais.")
user_label.grid(row=1, column=0, padx=10, pady=10)


user_acess_label = tk.Label(aba_acesso, text="Usuário: ")
user_acess_label.grid(row=2, column=0, padx=10, pady=6)
user_acess_entry = tk.Entry(aba_acesso)
user_acess_entry.grid(row=3, column=1, padx=10, pady=6)

password_acess_label = tk.Label(aba_acesso, text="Senha: ")
password_acess_label.grid(row=4, column=0, padx=10, pady=6)
password_acess_entry = tk.Entry(aba_acesso)
password_acess_entry.grid(row=5, column=1, padx=10, pady=6)

# Botão para acesso edit produto
botao_acess = tk.Button(aba_acesso, text="Acessar", command=configurar_abas)
botao_acess.grid(row=6, column=2, columnspan=1, pady=10)

# Aba de Menu - Admin
aba_menu = ttk.Frame(notebook)
notebook.add(aba_menu, text="Menu - Admin")

# Elementos da aba de adicionar
botao_busca_menu_admin = tk.Button(aba_menu, text="Listar Livros", command=chama_buscar_admin)
botao_busca_menu_admin.grid(row=0, column=0, columnspan=2, pady=10)
botao_edit_menu_admin = tk.Button(aba_menu, text="Cadastrar Livros", command=chama_cad_admin)
botao_edit_menu_admin.grid(row=0, column=4, columnspan=2, pady=10)

botao_fechar_busca = tk.Button(aba_menu, text="fechar", command=exit_menu)
botao_fechar_busca.grid(row=1, column=2, columnspan=2, pady=10)

# Aba de Buscar Produto
aba_list = ttk.Frame(notebook)
notebook.add(aba_list, text="Listagem dos Livros")

# Elementos da aba de buscar

# Botão para buscar produto
botao_fechar_busca = tk.Button(aba_list, text="X", command=exit_busca)
botao_fechar_busca.grid(row=0, column=3, columnspan=2, pady=10)
cod_busca_label = tk.Label(aba_list, text="Código do Produto: ")
cod_busca_label.grid(row=0, column=0, padx=10, pady=6)
cod_busca_entry = tk.Entry(aba_list)
cod_busca_entry.grid(row=0, column=1, padx=10, pady=6)

# Botão para buscar produto
botao_buscar = tk.Button(aba_list, text="Buscar Produto", command=busca_produto_interface_busca)
botao_buscar.grid(row=1, column=1, columnspan=2, pady=10)

nome_busca_label = tk.Label(aba_list, text="Nome do Produto: ")
nome_busca_label.grid(row=2, column=0, padx=10, pady=6)
nome_busca_entry = tk.Entry(aba_list, state='readonly')
nome_busca_entry.grid(row=2, column=1, padx=10, pady=6)

qtd_busca_label = tk.Label(aba_list, text="Quantidade do Produto: ")
qtd_busca_label.grid(row=3, column=0, padx=10, pady=6)
qtd_busca_entry = tk.Entry(aba_list, state='readonly')
qtd_busca_entry.grid(row=3, column=1, padx=10, pady=6)

preco_busca_label = tk.Label(aba_list, text="Preço do Produto: ")
preco_busca_label.grid(row=4, column=0, padx=10, pady=6)
preco_busca_entry = tk.Entry(aba_list, state='readonly')
preco_busca_entry.grid(row=4, column=1, padx=10, pady=6)

# Botão para adicionar produto
botao_add_busca = tk.Button(aba_list, text="Adicionar Produto", command=chama_add)
botao_add_busca.grid(row=5, column=1, columnspan=2, pady=10)

# Aba de Adicionar Produto
aba_cad = ttk.Frame(notebook)
notebook.add(aba_cad, text="Cadastramento dos Livros")

# Elementos da aba de adicionar
botao_fechar_add = tk.Button(aba_cad, text="X", command=exit_add)
botao_fechar_add.grid(row=0, column=3, columnspan=2, pady=10)
cod_label = tk.Label(aba_cad, text="Código do Livro: ")
cod_label.grid(row=0, column=0, padx=10, pady=6)
cod_entry = tk.Entry(aba_cad)
cod_entry.grid(row=0, column=1, padx=10, pady=6)

name_label = tk.Label(aba_cad, text="Nome do Livro: ")
name_label.grid(row=1, column=0, padx=10, pady=6)
name_entry = tk.Entry(aba_cad)
name_entry.grid(row=1, column=1, padx=10, pady=6)

qtd_label = tk.Label(aba_cad, text="Autor do Livro: ")
qtd_label.grid(row=2, column=0, padx=10, pady=6)
qtd_entry = tk.Entry(aba_cad)
qtd_entry.grid(row=2, column=1, padx=10, pady=6)

preco_label = tk.Label(aba_cad, text="Ano de Lançamento: ")
preco_label.grid(row=3, column=0, padx=10, pady=6)
preco_entry = tk.Entry(aba_cad)
preco_entry.grid(row=3, column=1, padx=10, pady=6)

# Botão para adicionar produto
botao_cad = tk.Button(aba_cad, text="Cadastrar", command=adicionar_produto_interface)
botao_cad.grid(row=4, column=0, columnspan=2, pady=10)

# Botão para editar produto
#botao_edit_edit = tk.Button(aba_edit, text="Editar Produto", command=editar_produto_interface)
#botao_edit_edit.grid(row=5, column=0, pady=10)

# Botão para excluir produto
#botao_delete = tk.Button(aba_edit, text="Excluir Produto", command=deletar_produto_interface)
#botao_delete.grid(row=5, column=3, pady=10)

# Oculta todas as abas primeiro
notebook.forget(aba_cad)
notebook.forget(aba_list)
notebook.forget(aba_menu)

# Mantém a janela aberta
tela.mainloop()