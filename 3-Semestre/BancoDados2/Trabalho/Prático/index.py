from boto3 import resource
from boto3.dynamodb.conditions import Attr, Key
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
from decimal import Decimal

dynamodb = resource('dynamodb', region_name="sa-east-1")  # Substitua pela sua região
ProdTable = dynamodb.Table('TurtleTrackDB')
UserTable = dynamodb.Table('Users')

def verificar_id_existente(product_id):
    response = ProdTable.get_item(Key={'product_id': product_id})
    return 'Item' in response

def verificar_nome_existente(nome):
    response = ProdTable.scan(
        FilterExpression=Attr('nome').eq(nome)
    )
    return len(response.get('Items', [])) > 0

def salvar_produto_bd(product_id, nome, quantidade, preco):
    response = ProdTable.put_item(
        Item={
            'product_id': product_id,
            'nome': nome,
            'quantidade': quantidade,
            'preco': preco,
            'data_criacao': datetime.now().isoformat()
        }
    )
    print("Produto salvo:", response)
    return response

def buscar_produto_bd(product_id):
    response = ProdTable.get_item(
        Key={
            'product_id': product_id
        }
    )
    print("Produto:", response)
    return response.get('Item')

def edit_produto_bd(product_id, nome, quantidade, preco):
    response = ProdTable.update_item(
        Key={'product_id': product_id},
        UpdateExpression="set nome=:n, quantidade=:q, preco=:p",
        ExpressionAttributeValues={
            ':n': nome,
            ':q': quantidade,
            ':p': preco
        },
        ReturnValues="UPDATED_NEW"
    )
    print("Produto atualizado:", response)
    return response

def delete_produto_bd(product_id):
    response = ProdTable.delete_item(
        Key={'product_id': product_id}
    )
    print("Produto deletado:", response)

#FUNÇÕES DO CÓDIGO - INTEGRANDO TELA/BANCO

def configurar_abas():
    nivel_acesso = cod_acess_entry.get()
    
    # Exibe apenas as abas permitidas
    if nivel_acesso == '01':  # Usuário com acesso limitado
        notebook.add(aba_buscar, text="Menu Usuário")
        notebook.forget(aba_acesso)
    elif nivel_acesso == '02':  # Administrador com acesso total
        notebook.add(aba_menu, text="Menu Admin")
        notebook.forget(aba_acesso)

#Função botão add da busca
def chama_add():
    notebook.add(aba_adicionar, text="Adicionar Produto")
    notebook.forget(aba_buscar)

#Função botão busca do menu-admin
def chama_buscar_admin():
    notebook.add(aba_buscar, text="Buscar Produto")
    notebook.forget(aba_menu)

#Função botão edit do menu-admin
def chama_edit_admin():
    notebook.add(aba_edit, text="Editar Produto")
    notebook.forget(aba_menu)

#Função botão fechar da aba add
def exit_add():
    notebook.forget(aba_adicionar)
    notebook.add(aba_acesso, text="Acesso")

#Função botão fechar da aba busca
def exit_busca():
    notebook.forget(aba_buscar)
    notebook.add(aba_acesso, text="Acesso")

#Função botão fechar da menu
def exit_menu():
    notebook.forget(aba_menu)
    notebook.add(aba_acesso, text="Acesso")

#Função botão fechar da aba edit
def exit_edit():
    notebook.forget(aba_edit)
    notebook.add(aba_acesso, text="Acesso")

# Função para obter dados da interface e adicionar produto ao estoque
def adicionar_produto_interface():
    produto_id = int(cod_entry.get())
    nome = name_entry.get()
    try:
        quantidade = Decimal(qtd_entry.get())
        preco = Decimal(preco_entry.get())
    except ValueError:
        messagebox.showerror("Erro", "Quantidade e preço devem ser números válidos.")
        return

    # Verificar se o ID já existe
    if verificar_id_existente(produto_id):
        messagebox.showerror("Erro", "ID já cadastrado. Utilize outro ID.")
        return

    # Verificar se o nome já existe
    if verificar_nome_existente(nome):
        messagebox.showerror("Erro", "Nome já cadastrado. Utilize outro nome.")
        return

    try:
        # Jogando dados pra função add BD
        response = salvar_produto_bd(produto_id, nome, quantidade, preco)

        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            
            messagebox.showinfo("Sucesso", "Produto salvo com sucesso.")
            # Limpa os campos da interface
            cod_entry.delete(0, tk.END)
            name_entry.delete(0, tk.END)
            qtd_entry.delete(0, tk.END)
            preco_entry.delete(0, tk.END)
        else:
            messagebox.showerror("Erro", "Falha ao salvar produto.")
    except:
        messagebox.showinfo("Erro", "Falha ao salvar produto.")

# Função para buscar e exibir produto da aba busca
def busca_produto_interface_busca():
    produto_id = int(cod_busca_entry.get())
    produto = buscar_produto_bd(produto_id)

    if produto:
        nome_busca_entry.config(state='normal')  # Permite edição
        nome_busca_entry.delete(0, tk.END)
        nome_busca_entry.insert(0, produto.get('nome', ''))  # Nome do produto
        nome_busca_entry.config(state='readonly')  # Só leitura
        
        qtd_busca_entry.config(state='normal')
        qtd_busca_entry.delete(0, tk.END)
        qtd_busca_entry.insert(0, str(produto.get('quantidade', '')))  # Quantidade
        qtd_busca_entry.config(state='readonly')
        
        preco_busca_entry.config(state='normal')
        preco_busca_entry.delete(0, tk.END)
        preco_busca_entry.insert(0, str(produto.get('preco', '')))  # Preço
        preco_busca_entry.config(state='readonly')
    else:
        messagebox.showerror("Erro", f"Produto com código {produto_id} não encontrado.")

#Função para buscar e exibir produto da aba edit
def busca_produto_interface_edit():
    produto_id = int(cod_edit_entry.get())
    produto = buscar_produto_bd(produto_id)

    if produto:
        # Exibir os dados do produto na interface de busca
        nome_edit_entry.config(state='normal')  # Permite edição
        nome_edit_entry.delete(0, tk.END)
        nome_edit_entry.insert(0, produto.get('nome', ''))  # Nome
        nome_edit_entry.config(state='readonly')  # Modo somente leitura
        
        qtd_edit_entry.config(state='normal')
        qtd_edit_entry.delete(0, tk.END)
        qtd_edit_entry.insert(0, str(produto.get('quantidade', '')))  # Quantidade
        qtd_edit_entry.config(state='readonly')
        
        preco_edit_entry.config(state='normal')
        preco_edit_entry.delete(0, tk.END)
        preco_edit_entry.insert(0, str(produto.get('preco', '')))  # Preço
        preco_edit_entry.config(state='readonly')
    else:
        messagebox.showerror("Erro", f"Produto com código {produto_id} não encontrado.")

    nome_edit_entry.config(state='normal')  # Permite edição
    qtd_edit_entry.config(state='normal')
    preco_edit_entry.config(state='normal')


# Função para buscar e atualizar o produto
def editar_produto_interface():
    produto_id = int(cod_edit_entry.get())
    nome = nome_edit_entry.get()
    try:
        quantidade = Decimal(qtd_edit_entry.get())
        preco = Decimal(preco_edit_entry.get())
    except ValueError:
        messagebox.showerror("Erro", "Quantidade e preço devem ser números válidos.")
        return

    # Verifica se o ID existe antes de editar
    if not verificar_id_existente(produto_id):
        messagebox.showerror("Erro", "Produto não encontrado para editar.")
        return

    # Verifica se o nome já está em outro produto
    produtos_com_nome = ProdTable.scan(
        FilterExpression=Attr('nome').eq(nome)
    ).get('Items', [])

    if produtos_com_nome:
        for produto in produtos_com_nome:
            if produto['product_id'] != produto_id:
                messagebox.showerror("Erro", "Nome já cadastrado em outro produto.")
                return

    # Jogando dados pra função edit BD
    response = edit_produto_bd(produto_id, nome, quantidade, preco)

    if response and 'Attributes' in response:
        messagebox.showinfo("Sucesso", "Produto atualizado com sucesso.")

        # Limpa os campos da interface de edição
        cod_edit_entry.delete(0, tk.END)
        nome_edit_entry.delete(0, tk.END)
        qtd_edit_entry.delete(0, tk.END)
        preco_edit_entry.delete(0, tk.END)
    else:
        messagebox.showerror("Erro", "Falha ao atualizar o produto.")


# Função para buscar e excluir o produto
def deletar_produto_interface():
    produto_id = int(cod_edit_entry.get())
    # Jogando dados pra função delete BD
    response = delete_produto_bd(produto_id)

    if response and 'Attributes' in response:
        messagebox.showinfo("Erro", "Falha ao deletar produto.")
    else:
        messagebox.showinfo("Sucesso", "Produto deletado com sucesso.")
        # Limpa os campos da interface
        cod_edit_entry.delete(0, tk.END)
        nome_edit_entry.config(state='normal')
        nome_edit_entry.delete(0, tk.END)
        qtd_edit_entry.config(state='normal')
        qtd_edit_entry.delete(0, tk.END)
        preco_edit_entry.config(state='normal')
        preco_edit_entry.delete(0, tk.END)


#INTERFACE - TELAS

# Cores e estilos
COR_FUNDO = "#f0f4f7"
COR_BOTAO = "#4CAF50"
COR_TEXTO = "#333"
COR_DESTAQUE = "#2E8B57"
FONTE = ("Arial", 10)
FONTE_TITULO = ("Arial", 14, "bold")

# Início da interface
tela = tk.Tk()
tela.title("Turtle Track - Controle de Estoque")
tela.configure(bg=COR_FUNDO)

# Logo
logo_img = Image.open("98efd7f0-09a9-4033-a446-7a637d6903e2.png")
logo_img = logo_img.resize((200, 80))
logo = ImageTk.PhotoImage(logo_img)
logo_label = tk.Label(tela, image=logo, bg=COR_FUNDO)
logo_label.pack(pady=5)

# Notebook
notebook = ttk.Notebook(tela)
notebook.pack(pady=10, expand=True)

style = ttk.Style()
style.configure("TNotebook", background=COR_FUNDO)
style.configure("TFrame", background=COR_FUNDO)
style.configure("TLabel", background=COR_FUNDO, font=FONTE)
style.configure("TButton", font=FONTE)

# Aba de Acesso
aba_acesso = ttk.Frame(notebook)
notebook.add(aba_acesso, text="Acesso")

title_label = tk.Label(aba_acesso, text="Acesso ao Sistema", font=FONTE_TITULO, bg=COR_FUNDO, fg=COR_DESTAQUE)
title_label.grid(row=0, column=1, padx=10, pady=10)

cod_acess_label = tk.Label(aba_acesso, text="Código do Acesso:", bg=COR_FUNDO)
cod_acess_label.grid(row=1, column=0, padx=10, pady=6)

cod_acess_entry = tk.Entry(aba_acesso)
cod_acess_entry.grid(row=2, column=1, padx=10, pady=6)

botao_acess = tk.Button(aba_acesso, text="🔓 Acessar", bg=COR_BOTAO, fg="white", command=configurar_abas)
botao_acess.grid(row=3, column=2, pady=10)

# Aba Menu Admin
aba_menu = ttk.Frame(notebook)
notebook.add(aba_menu, text="Menu - Admin")

botao_busca_menu_admin = tk.Button(aba_menu, text="🔍 Buscar Produto", bg=COR_BOTAO, fg="white", command=chama_buscar_admin)
botao_busca_menu_admin.grid(row=0, column=0, columnspan=2, pady=10)

botao_edit_menu_admin = tk.Button(aba_menu, text="✏️ Editar Produto", bg=COR_BOTAO, fg="white", command=chama_edit_admin)
botao_edit_menu_admin.grid(row=0, column=4, columnspan=2, pady=10)

botao_fechar_busca = tk.Button(aba_menu, text="❌ Fechar", bg="red", fg="white", command=exit_menu)
botao_fechar_busca.grid(row=1, column=2, columnspan=2, pady=10)

# Aba Buscar Produto
aba_buscar = ttk.Frame(notebook)
notebook.add(aba_buscar, text="Buscar Produto")

botao_fechar_busca = tk.Button(aba_buscar, text="❌", bg="red", fg="white", command=exit_busca)
botao_fechar_busca.grid(row=0, column=3, columnspan=2, pady=10)

tk.Label(aba_buscar, text="Código do Produto:", bg=COR_FUNDO).grid(row=0, column=0, padx=10, pady=6)
cod_busca_entry = tk.Entry(aba_buscar)
cod_busca_entry.grid(row=0, column=1, padx=10, pady=6)

tk.Button(aba_buscar, text="🔍 Buscar Produto", bg=COR_BOTAO, fg="white", command=busca_produto_interface_busca).grid(row=1, column=1, columnspan=2, pady=10)

tk.Label(aba_buscar, text="Nome do Produto:", bg=COR_FUNDO).grid(row=2, column=0, padx=10, pady=6)
nome_busca_entry = tk.Entry(aba_buscar, state='readonly')
nome_busca_entry.grid(row=2, column=1, padx=10, pady=6)

tk.Label(aba_buscar, text="Quantidade do Produto:", bg=COR_FUNDO).grid(row=3, column=0, padx=10, pady=6)
qtd_busca_entry = tk.Entry(aba_buscar, state='readonly')
qtd_busca_entry.grid(row=3, column=1, padx=10, pady=6)

tk.Label(aba_buscar, text="Preço do Produto:", bg=COR_FUNDO).grid(row=4, column=0, padx=10, pady=6)
preco_busca_entry = tk.Entry(aba_buscar, state='readonly')
preco_busca_entry.grid(row=4, column=1, padx=10, pady=6)

tk.Button(aba_buscar, text="➕ Adicionar Produto", bg="#2196F3", fg="white", command=chama_add).grid(row=5, column=1, columnspan=2, pady=10)

# Aba Adicionar Produto
aba_adicionar = ttk.Frame(notebook)
notebook.add(aba_adicionar, text="Adicionar Produto")

tk.Button(aba_adicionar, text="❌", bg="red", fg="white", command=exit_add).grid(row=0, column=3, columnspan=2, pady=10)
tk.Label(aba_adicionar, text="Código do Produto:", bg=COR_FUNDO).grid(row=0, column=0, padx=10, pady=6)
cod_entry = tk.Entry(aba_adicionar)
cod_entry.grid(row=0, column=1, padx=10, pady=6)

tk.Label(aba_adicionar, text="Nome do Produto:", bg=COR_FUNDO).grid(row=1, column=0, padx=10, pady=6)
name_entry = tk.Entry(aba_adicionar)
name_entry.grid(row=1, column=1, padx=10, pady=6)

tk.Label(aba_adicionar, text="Quantidade do Produto:", bg=COR_FUNDO).grid(row=2, column=0, padx=10, pady=6)
qtd_entry = tk.Entry(aba_adicionar)
qtd_entry.grid(row=2, column=1, padx=10, pady=6)

tk.Label(aba_adicionar, text="Preço do Produto:", bg=COR_FUNDO).grid(row=3, column=0, padx=10, pady=6)
preco_entry = tk.Entry(aba_adicionar)
preco_entry.grid(row=3, column=1, padx=10, pady=6)

tk.Button(aba_adicionar, text="➕ Adicionar Produto", bg=COR_BOTAO, fg="white", command=adicionar_produto_interface).grid(row=4, column=0, columnspan=2, pady=10)

# Aba Editar Produto
aba_edit = ttk.Frame(notebook)
notebook.add(aba_edit, text="Editar Produto")

tk.Button(aba_edit, text="❌", bg="red", fg="white", command=exit_edit).grid(row=0, column=3, columnspan=2, pady=10)
tk.Label(aba_edit, text="Código do Produto:", bg=COR_FUNDO).grid(row=0, column=0, padx=10, pady=6)
cod_edit_entry = tk.Entry(aba_edit)
cod_edit_entry.grid(row=0, column=1, padx=10, pady=6)

tk.Button(aba_edit, text="🔍 Buscar Produto", bg=COR_BOTAO, fg="white", command=busca_produto_interface_edit).grid(row=1, column=1, columnspan=2, pady=10)

tk.Label(aba_edit, text="Nome do Produto:", bg=COR_FUNDO).grid(row=2, column=0, padx=10, pady=6)
nome_edit_entry = tk.Entry(aba_edit)
nome_edit_entry.grid(row=2, column=1, padx=10, pady=6)

tk.Label(aba_edit, text="Quantidade do Produto:", bg=COR_FUNDO).grid(row=3, column=0, padx=10, pady=6)
qtd_edit_entry = tk.Entry(aba_edit)
qtd_edit_entry.grid(row=3, column=1, padx=10, pady=6)

tk.Label(aba_edit, text="Preço do Produto:", bg=COR_FUNDO).grid(row=4, column=0, padx=10, pady=6)
preco_edit_entry = tk.Entry(aba_edit)
preco_edit_entry.grid(row=4, column=1, padx=10, pady=6)

tk.Button(aba_edit, text="✏️ Editar Produto", bg="#FFA000", fg="white", command=editar_produto_interface).grid(row=5, column=0, pady=10)
tk.Button(aba_edit, text="🗑️ Excluir Produto", bg="darkred", fg="white", command=deletar_produto_interface).grid(row=5, column=3, pady=10)

# Oculta as abas
notebook.forget(aba_edit)
notebook.forget(aba_adicionar)
notebook.forget(aba_buscar)
notebook.forget(aba_menu)

tela.mainloop()
