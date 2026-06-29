from fastapi import FastAPI
from pydantic import BaseModel
from backend.database import get_connection

app = FastAPI()

# Modelo do cadastro
class Cliente(BaseModel):
    nome: str
    telefone: str

@app.post("/clientes")
def criar_cliente(cliente: Cliente):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO cliente (nome, telefone)
        VALUES (%s, %s)
        RETURNING id;
        """,
        (cliente.nome, cliente.telefone)
    )

    cliente_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()
    conn.close()

    return {
        "mensagem": "Cliente cadastrado com sucesso",
        "id": cliente_id
    }

@app.get("/clientes")
def listar_clientes():
    return {"mensagem": "Rota GET funcionando"}