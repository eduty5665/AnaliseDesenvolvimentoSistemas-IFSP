import socket

HOST = '127.0.0.1'
PORT = 50000

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))


while True:
    print("\n=== Cliente de Mensagens ===")
    print("1. Escrever mensagem")
    print("2. Listar mensagens")
    print("3. Deletar mensagem")
    print("4. Sair")

    op = input("Escolha: ")

    if op == "1":
        msg = input("Digite a mensagem: ")
        s.sendall(f"ADD|{msg}".encode())
        print(s.recv(4096).decode())

    elif op == "2":
        s.sendall("LIST".encode())
        print(s.recv(4096).decode())

    elif op == "3":
        num = input("Número da mensagem: ")
        s.sendall(f"DEL|{int(num)-1}".encode())
        print(s.recv(4096).decode())

    elif op == "4":
        s.sendall("EXIT".encode())
        print(s.recv(1024).decode())
        break

    else:
        print("Opção inválida")

s.close()
