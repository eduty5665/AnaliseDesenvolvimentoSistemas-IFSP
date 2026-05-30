**1. Salve o script em:**



&#x20;/usr/local/bin/internet



**2. Verifique a permissão de execução:**



sudo chmod +x /usr/local/bin/internet





**3. Crie o serviço systemd**



Agora vamos criar o serviço.



sudo nano /etc/systemd/system/nat.service



Coloque o conteúdo abaixo:



\[Unit]

Description=Servico NAT com iptables

After=network.target



\[Service]

Type=oneshot

ExecStart=/usr/local/bin/internet start

ExecStop=/usr/local/bin/internet stop

RemainAfterExit=yes



\[Install]

WantedBy=multi-user.target





**4. Recarregue o systemd**

Sempre que criar ou alterar um serviço:



sudo systemctl daemon-reload







**5. Inicie o serviço**

sudo systemctl start nat.service





**6. Verifique se funcionou**

sudo systemctl status nat.service





**7. Habilite para iniciar automaticamente no boot**

sudo systemctl enable nat.service



Assim, toda vez que o Ubuntu iniciar, a regra NAT será aplicada automaticamente.



**8. Parar o serviço**

sudo systemctl stop nat.service



**9. Reiniciar o serviço**

sudo systemctl restart nat.service

