import socket
import os

HOST = '127.0.0.1'
PORT = 50000
FILE_PATH = "mensagens.txt"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.listen()

print('Aguardando conexão...')
conn, ender = s.accept()
print('Conectado em', ender)


def escrever_mensagem(msg):
    with open(FILE_PATH, "a", encoding="utf-8") as f:
        f.write(msg + "\n")
    return "Mensagem salva com sucesso!"


def listar_mensagens():
    if not os.path.exists(FILE_PATH):
        return "Nenhuma mensagem encontrada."

    with open(FILE_PATH, "r", encoding="utf-8") as f:
        linhas = f.readlines()

    if not linhas:
        return "Nenhuma mensagem encontrada."

    resposta = ""
    for i, linha in enumerate(linhas, 1):
        resposta += f"{i}. {linha.strip()}\n"

    return resposta


def deletar_mensagem(indice):
    if not os.path.exists(FILE_PATH):
        return "Nenhuma mensagem encontrada."

    with open(FILE_PATH, "r", encoding="utf-8") as f:
        linhas = f.readlines()

    if 0 <= indice < len(linhas):
        linhas.pop(indice)
        with open(FILE_PATH, "w", encoding="utf-8") as f:
            f.writelines(linhas)
        return "Mensagem deletada com sucesso!"
    else:
        return "Número inválido."


while True:
    data = conn.recv(1024)

    if not data:
        print('Cliente encerrou a conexão')
        break

    mensagem = data.decode()
    partes = mensagem.split("|")
    comando = partes[0]

    if comando == "ADD":
        resposta = escrever_mensagem(partes[1])

    elif comando == "LIST":
        resposta = listar_mensagens()

    elif comando == "DEL":
        resposta = deletar_mensagem(int(partes[1]))

    elif comando == "EXIT":
        conn.sendall("Conexão encerrada.".encode())
        print("Cliente saiu.")
        break

    else:
        resposta = "Comando inválido."

    conn.sendall(resposta.encode())

conn.close()
s.close()
