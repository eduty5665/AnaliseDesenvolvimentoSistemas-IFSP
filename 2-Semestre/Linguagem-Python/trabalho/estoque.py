import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3

# FUNÇÕES Do BANCO DE DADOS

# Função para conectar ao banco de dados e criar a tabela
def criar_banco():
    conn = sqlite3.connect('estoque.db')  # Criando o banco de dados
    cursor = conn.cursor()
    
    # Criando a tabela de produtos se ela não existir
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS produtos (
            codigo TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco REAL NOT NULL
        )
    ''')
    
    conn.commit()  # Confirmando a criação da tabela
    conn.close()   # Fechando a conexão

# Chamando a função para criar o banco de dados e a tabela
criar_banco()

# Função para adicionar produto ao banco de dados
def salvar_produto_bd(codigo, nome, quantidade, preco):
    conn = sqlite3.connect('estoque.db')
    cursor = conn.cursor()

    # Inserir o produto no banco de dados
    try:
        cursor.execute('''
            INSERT INTO produtos (codigo, nome, quantidade, preco)
            VALUES (?, ?, ?, ?)
        ''', (codigo, nome, quantidade, preco))

        conn.commit()  # Confirmando a inserção
        messagebox.showinfo("Sucesso", f"Produto {nome} salvo com sucesso!")
    except sqlite3.IntegrityError:
        messagebox.showerror("Erro", f"Produto com código {codigo} já existe.")
    
    conn.close()  # Fechando a conexão

# Função para buscar produto no banco de dados
def buscar_produto_bd(codigo):
    conn = sqlite3.connect('estoque.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM produtos WHERE codigo = ?", (codigo,))
    produto = cursor.fetchone()
    
    conn.close()  # Fechando a conexão

    return produto

# Função para editar produto no banco de dados
def edit_produto_bd(codigo, nome, quantidade, preco):
    conn = sqlite3.connect('estoque.db')
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE produtos SET nome = ?, quantidade = ?, preco = ? WHERE codigo = ?", 
                       (nome, quantidade, preco, codigo))
        conn.commit()  # Confirmando a atualização
        messagebox.showinfo("Sucesso", "Produto editado com sucesso!")
    except sqlite3.Error:
        messagebox.showerror("Erro", "Falha ao editar produto!")
    
    conn.close()  # Fechando a conexão

# Função para excluir produto no banco de dados
def delete_produto_bd(codigo):
    conn = sqlite3.connect('estoque.db')
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM produtos WHERE codigo = ?", (codigo,))
        conn.commit()  # Confirmando a exclusão
        if cursor.rowcount > 0:
            messagebox.showinfo("Sucesso", "Produto excluído com sucesso!")
        else:
            messagebox.showwarning("Aviso", "Produto não encontrado!")
    except sqlite3.Error:
        messagebox.showerror("Erro", "Falha ao excluir produto!")
    
    conn.close()  # Fechando a conexão

# FUNÇÕES DA INTERFACE

# Função para obter dados da interface e adicionar produto ao estoque
def adicionar_produto_interface():
    codigo = cod_entry.get()
    nome = name_entry.get()
    try:
        quantidade = int(qtd_entry.get())
        preco = float(preco_entry.get())
    except ValueError:
        messagebox.showerror("Erro", "Quantidade e preço devem ser números válidos.")
        return

    # Jogando dados pra função add BD
    salvar_produto_bd(codigo, nome, quantidade, preco)

    # Limpa os campos da interface
    cod_entry.delete(0, tk.END)
    name_entry.delete(0, tk.END)
    qtd_entry.delete(0, tk.END)
    preco_entry.delete(0, tk.END)

# Função para buscar e exibir produto
def pesquisar_produto_interface():
    codigo = cod_busca_entry.get()
    produto = buscar_produto_bd(codigo)

    if produto:
        # Exibir os dados do produto na interface de busca
        nome_busca_entry.config(state='normal')  # Permite edição
        nome_busca_entry.delete(0, tk.END)
        nome_busca_entry.insert(0, produto[1])  # Nome
        nome_busca_entry.config(state='readonly')  # Modo somente leitura
        
        qtd_busca_entry.config(state='normal')
        qtd_busca_entry.delete(0, tk.END)
        qtd_busca_entry.insert(0, produto[2])  # Quantidade
        qtd_busca_entry.config(state='readonly')
        
        preco_busca_entry.config(state='normal')
        preco_busca_entry.delete(0, tk.END)
        preco_busca_entry.insert(0, produto[3])  # Preço
        preco_busca_entry.config(state='readonly')
    else:
        messagebox.showerror("Erro", f"Produto com código {codigo} não encontrado.")

    # Muda os campos da interface para modo edição
    nome_busca_entry.config(state='normal')
    qtd_busca_entry.config(state='normal')
    preco_busca_entry.config(state='normal')

# Função para buscar e atualizar o produto
def editar_produto_interface():
    codigo = cod_busca_entry.get()
    nome = nome_busca_entry.get()
    try:
        quantidade = int(qtd_busca_entry.get())
        preco = float(preco_busca_entry.get())
    except ValueError:
        messagebox.showerror("Erro", "Quantidade e preço devem ser números válidos.")
        return

    # Jogando dados pra função edit BD
    edit_produto_bd(codigo, nome, quantidade, preco)

    # Limpa os campos da interface
    cod_busca_entry.delete(0, tk.END)
    nome_busca_entry.config(state='normal')
    nome_busca_entry.delete(0, tk.END)
    qtd_busca_entry.config(state='normal')
    qtd_busca_entry.delete(0, tk.END)
    preco_busca_entry.config(state='normal')
    preco_busca_entry.delete(0, tk.END)

# Função para buscar e excluir o produto
def deletar_produto_interface():
    codigo = cod_busca_entry.get()

    # Jogando dados pra função delete BD
    delete_produto_bd(codigo)

    # Limpa os campos da interface
    cod_busca_entry.delete(0, tk.END)
    nome_busca_entry.config(state='normal')
    nome_busca_entry.delete(0, tk.END)
    qtd_busca_entry.config(state='normal')
    qtd_busca_entry.delete(0, tk.END)
    preco_busca_entry.config(state='normal')
    preco_busca_entry.delete(0, tk.END)

# INTERFACE

# Configuração da interface
tela = tk.Tk()
tela.title("Controle de Estoque")

# Criando o notebook (abas)
notebook = ttk.Notebook(tela)
notebook.pack(pady=10, expand=True)

# Aba de Adicionar Produto
aba_adicionar = ttk.Frame(notebook)
notebook.add(aba_adicionar, text="Adicionar Produto")

# Elementos da aba de adicionar
cod_label = tk.Label(aba_adicionar, text="Código do Produto: ")
cod_label.grid(row=0, column=0, padx=10, pady=6)
cod_entry = tk.Entry(aba_adicionar)
cod_entry.grid(row=0, column=1, padx=10, pady=6)

name_label = tk.Label(aba_adicionar, text="Nome do Produto: ")
name_label.grid(row=1, column=0, padx=10, pady=6)
name_entry = tk.Entry(aba_adicionar)
name_entry.grid(row=1, column=1, padx=10, pady=6)

qtd_label = tk.Label(aba_adicionar, text="Quantidade do Produto: ")
qtd_label.grid(row=2, column=0, padx=10, pady=6)
qtd_entry = tk.Entry(aba_adicionar)
qtd_entry.grid(row=2, column=1, padx=10, pady=6)

preco_label = tk.Label(aba_adicionar, text="Preço do Produto: ")
preco_label.grid(row=3, column=0, padx=10, pady=6)
preco_entry = tk.Entry(aba_adicionar)
preco_entry.grid(row=3, column=1, padx=10, pady=6)

# Botão para adicionar produto
botao_adicionar = tk.Button(aba_adicionar, text="Adicionar Produto", command=adicionar_produto_interface)
botao_adicionar.grid(row=4, column=0, columnspan=2, pady=10)

# Aba de Buscar Produto
aba_buscar = ttk.Frame(notebook)
notebook.add(aba_buscar, text="Buscar Produto")

# Elementos da aba de buscar
cod_busca_label = tk.Label(aba_buscar, text="Código do Produto: ")
cod_busca_label.grid(row=0, column=0, padx=10, pady=6)
cod_busca_entry = tk.Entry(aba_buscar)
cod_busca_entry.grid(row=0, column=1, padx=10, pady=6)

# Botão para buscar produto
botao_buscar = tk.Button(aba_buscar, text="Buscar Produto", command=pesquisar_produto_interface)
botao_buscar.grid(row=1, column=0, columnspan=2, pady=10)

nome_busca_label = tk.Label(aba_buscar, text="Nome do Produto: ")
nome_busca_label.grid(row=2, column=0, padx=10, pady=6)
nome_busca_entry = tk.Entry(aba_buscar, state='readonly')
nome_busca_entry.grid(row=2, column=1, padx=10, pady=6)

qtd_busca_label = tk.Label(aba_buscar, text="Quantidade do Produto: ")
qtd_busca_label.grid(row=3, column=0, padx=10, pady=6)
qtd_busca_entry = tk.Entry(aba_buscar, state='readonly')
qtd_busca_entry.grid(row=3, column=1, padx=10, pady=6)

preco_busca_label = tk.Label(aba_buscar, text="Preço do Produto: ")
preco_busca_label.grid(row=4, column=0, padx=10, pady=6)
preco_busca_entry = tk.Entry(aba_buscar, state='readonly')
preco_busca_entry.grid(row=4, column=1, padx=10, pady=6)

# Botão para editar produto
botao_edit = tk.Button(aba_buscar, text="Editar Produto", command=editar_produto_interface)
botao_edit.grid(row=5, column=0, pady=10)

# Botão para excluir produto
botao_delete = tk.Button(aba_buscar, text="Excluir Produto", command=deletar_produto_interface)
botao_delete.grid(row=5, column=1, pady=10)

# Loop principal da interface
tela.mainloop()
