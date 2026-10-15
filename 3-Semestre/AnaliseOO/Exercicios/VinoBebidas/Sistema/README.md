# Vino Bebidas — Sistema integrado (ERP/PDV + Loja online + Painel BI + App)

Projeto acadêmico (IFSP Catanduva) que implementa o sistema da **Vino Bebidas** a partir da documentação de
Análise OO (requisitos RF01–RF13, diagramas de classes, casos de uso, estado e arquitetura em camadas),
ampliado para um ERP completo de uma distribuidora de vinhos.

```
                   ┌──────────────────────────┐
  ERP / PDV  ────► │                          │
  (Blazor .NET)    │   API central (.NET 10)  │ ───► Banco único (PostgreSQL no Supabase;
  Loja web   ────► │   ASP.NET Core + EF Core │      SQLite local ou SQL Server como opção)
  (React)          │   SignalR /hubs/painel   │ ───► eventos ao vivo p/ o painel
  App mobile ────► │                          │
  (Expo/RN)        └──────────────────────────┘
```

**Tudo grava e lê de um lugar só:** nenhum cliente acessa o banco diretamente — ERP, loja, painel e app
falam com a mesma API, que é dona do banco. Uma venda no PDV aparece no painel da web em tempo real.

## O que tem em cada parte

| Parte | Pasta | Tecnologia | O que faz |
|---|---|---|---|
| API central | `src/VinoBebidas.Api` | ASP.NET Core 10, Minimal APIs, SignalR, OpenAPI | Regras de negócio, autenticação, eventos ao vivo, serve a loja compilada |
| Domínio | `src/VinoBebidas.Domain` | C# | Entidades e regras (estoque, venda, pedido, documento com máquina de estados) |
| Contratos | `src/VinoBebidas.Contracts` | C# | DTOs compartilhados entre API e ERP |
| Infraestrutura | `src/VinoBebidas.Infrastructure` | EF Core 10 | Banco, serviços, projeção de vendas (Holt-Winters), dados de demonstração |
| ERP / PDV | `src/VinoBebidas.Erp` | Blazor (Interactive Server) | Frente de caixa com abertura/fechamento, entradas e saídas, ordens de separação, relatórios, pedidos, cadastros, financeiro, OCR, usuários |
| Banco | `banco/supabase` | PostgreSQL 17 (Supabase) | Scripts do schema `vino` e do papel de acesso da API |
| Loja + painel | `web` | React 19, Vite, TypeScript, Tailwind 4, TanStack Query, Recharts, SignalR | Catálogo de vinhos, conta, reserva/compra, entrega/retirada; `/admin` com BI ao vivo |
| App catálogo | `mobile` | React Native + Expo (TypeScript) | Catálogo no celular para clientes e consultores, distribuído por QR code |

### Por que React Native (Expo) no app?
Reaproveita TypeScript/React da loja web (mesmos tipos, mesma API), roda em Android e iPhone com um código só,
e o Expo gera o APK e a página de instalação com **QR code** sem precisar de Android Studio. A página
`/app` da loja mostra o QR apontando para o link configurado.

## Requisitos para rodar

- [.NET SDK 10](https://dotnet.microsoft.com/download) (o projeto usa `net10.0`)
- [Node.js 18+](https://nodejs.org) (recomendado 20/22+ para desenvolvimento mais recente)
- Opcional: SQL Server / LocalDB (o padrão é SQLite, que não precisa instalar nada)
- Para o app: celular com **Expo Go** (desenvolvimento) ou conta Expo para gerar o APK

## Como rodar (Windows)

Jeito rápido: dê dois cliques em **`Iniciar.cmd`**. Ele encerra a API/ERP que estiverem abertos, compila a versão atual,
sobe API, ERP e loja e abre o navegador. Pode rodar de novo sempre que o código mudar. A saída fica em `logs\api.log` e `logs\erp.log`.

Manual, em três terminais:

```powershell
# 1) API — cria o banco vinobebidas.db com ~6 meses de dados de demonstração na primeira execução
cd src\VinoBebidas.Api
dotnet run            # http://localhost:5080   (documentação interativa: http://localhost:5080/docs)

# 2) ERP / PDV
cd src\VinoBebidas.Erp
dotnet run            # http://localhost:5090

# 3) Loja web + painel (modo desenvolvimento)
cd web
npm install
npm run dev           # http://localhost:5173   (painel: http://localhost:5173/admin)
```

`npm run build` gera a loja dentro de `src/VinoBebidas.Api/wwwroot` — aí a própria API serve loja + painel em
`http://localhost:5080` (um único servidor para publicar).

### App mobile

```powershell
cd mobile
npm install
copy .env.example .env      # edite com o IP do PC que roda a API, ex.: http://192.168.0.10:5080
npx expo start              # escaneie o QR com o app Expo Go (celular na mesma rede Wi-Fi)
```

Para distribuir o APK com QR code: `npx eas-cli@latest build -p android --profile preview` (edite o
endereço em `eas.json`). Copie o link do APK para `AppMobile:UrlDownload` no `appsettings.json` da API — a
página `/app` da loja passa a mostrar o QR de download.

> Libere a porta 5080 no Firewall do Windows para o celular acessar a API pela rede.

## Logins de demonstração (senha `Vino@123`)

| Login | Perfil | Onde usar |
|---|---|---|
| `admin` | Administrador | ERP (tudo) e painel `/admin` |
| `gerente` | Gerente | ERP e painel |
| `financeiro` | Diretor Financeiro (CFO) | Financeiro, documentos, painel |
| `caixa` | Caixa | Frente de caixa |
| `vendedor` | Consultor | Frente de caixa |
| `estoque` | Estoquista | Produtos e movimentações |
| `estagiario` | Estagiário financeiro | Documentos (OCR) e contas |
| `cliente@vinobebidas.com.br` | Cliente | Loja online |

Funcionários também entram com o **CPF** no lugar do login (caso de uso *Login* da documentação).

## Banco de dados

### Supabase (PostgreSQL) — banco principal

O projeto **VinoBebidas** no Supabase (região `sa-east-1`, São Paulo) já está criado, com as 24 tabelas no
schema **`vino`** e os dados de demonstração carregados (~6 meses de vendas, kardex, caixas, ordens de separação,
contas a pagar). A API se conecta com o papel **`vino_app`**, que só enxerga esse schema.

- A conexão fica em `src/VinoBebidas.Api/appsettings.Local.json` (**fora do Git**, tem a senha do banco).
  Modelo sem senha: `appsettings.Supabase.exemplo.json`.
- Ao subir, a API testa `ConnectionStrings:VinoBebidas` e depois cada item de `Banco:ConexoesAlternativas`
  (pooler IPv4 `aws-1`, pooler `aws-0`, conexão direta IPv6) e usa a primeira que responder. O console mostra
  `Banco de dados: PostgreSQL (...)` e `GET /api/saude` informa o banco em uso.
- Se o console disser que nenhuma respondeu: no painel do Supabase clique em **Connect** → *Session pooler* e
  copie o **Host** para o `appsettings.Local.json`.
- `Banco:SeFalharUsarSqlite: true` faz a API subir no SQLite local quando não há internet (útil na apresentação).
  **Atenção:** nesse modo o que for gravado fica só na máquina — o console e o `/api/saude` avisam.
- `Banco:RecriarSeIncompativel: true` (só para dados de demonstração): se as tabelas do Supabase não baterem com as
  entidades desta versão, a API apaga as tabelas do schema `vino`, recria pelo EF Core e roda o seeder.
- Por que o schema `vino` e não o `public`? O `public` é exposto pela Data API do Supabase; no `vino` os dados só
  são acessados pela nossa API .NET. As tabelas têm RLS ligado sem políticas (ninguém além do dono acessa).
- **O Supabase hospeda o banco, não a API .NET.** A API e o ERP continuam rodando no seu PC (ou em um serviço
  como Azure App Service, Render ou Railway); todos passam a gravar no mesmo banco na nuvem.
- Scripts: `banco/supabase/` (papel + schema, tabelas e consulta de conferência do kardex).

### SQLite / SQL Server (opcionais)

- Sem `appsettings.Local.json` a API usa **SQLite** em `src/VinoBebidas.Api/vinobebidas.db` (criado e populado sozinho).
  Um `.db` criado pela versão anterior do sistema é copiado para `vinobebidas.v1-AAAAMMDD-HHMMSS.bak` e recriado.
- SQL Server: `$env:ASPNETCORE_ENVIRONMENT="SqlServer"; dotnet run` (usa `appsettings.SqlServer.json`).
- Recriar o SQLite do zero: apague o `.db` ou use `"Banco": { "RecriarAoIniciar": true }` uma vez.
- Migrations (quando o modelo estabilizar):
  `dotnet tool install -g dotnet-ef` → `dotnet ef migrations add Inicial -p src/VinoBebidas.Infrastructure -s src/VinoBebidas.Api`
  → `"Banco": { "UsarMigrations": true }`.

## Processos do ERP

### Frente de caixa (PDV)

1. **Abrir o caixa** informando a loja e o fundo de troco — sem caixa aberto a venda é recusada.
2. Bipar ou digitar o produto (`3*código` lança 3 unidades). Atalhos: `F2` produto, `F4` cliente, `F6` desconto,
   `F7` sangria, `F8` dinheiro, `F9` Pix, `F10` finalizar.
3. Vendedor (comissão), CPF/CNPJ no cupom, cliente identificado.
4. **Desconto com alçada**: caixa 5%, vendedor 10%, gerente 30%. Acima do limite pede login e senha de um supervisor,
   que fica registrado na venda.
5. Pagamento em várias formas: dinheiro (troco), débito, crédito parcelado com NSU, **Pix com QR code** (BR Code
   "copia e cola" com CRC16) e conferência do recebimento.
6. Bebida alcoólica exige confirmar a **maioridade** do cliente.
7. Cupom não fiscal com tributos aproximados (Lei 12.741), impressão em 80 mm e reimpressão em Vendas.
8. **Sangria / suprimento** e **fechamento** com contagem da gaveta, diferença (sobra/falta) e relatório de fechamento.

### Ordem de separação

- **Pedido online:** ao clicar em **Separar (emitir ordem)** na tela de Pedidos, o sistema emite a Ordem de Separação
  (`OS000001`) com os itens na ordem do endereço de armazenagem e abre o documento para impressão. A ordem acompanha
  o pedido (separada quando fica pronto, concluída na entrega, cancelada se o pedido cair).
- **Transferência entre depósitos:** solicitar → reserva o estoque na origem e emite a ordem → **conferir separação**
  (o que faltar libera a reserva) → **expedir** (baixa a origem, mercadoria em trânsito) → **receber no destino**
  (entrada conferida, divergência registrada).
- O endereço (corredor-prateleira-nível no CD, gôndola nas lojas) é editado em Estoque › Saldos.

### Entradas e saídas

- **Entrada por nota fiscal:** fornecedor, número/série, chave de acesso (44 dígitos), emissão, frete e outras
  despesas **rateados no custo**, custo médio recalculado, duplicatas no contas a pagar; aceita **importar o XML da NF-e**
  e recusa nota repetida.
- **Saída avulsa** só com motivo: quebra, avaria, vencimento, degustação, brinde, uso interno, devolução ao fornecedor.
- **Ajuste de inventário** pela quantidade contada. Todo lançamento gera comprovante numerado (`E`, `S`, `T`, `R`, `A`).

### Relatórios (imprimir ou exportar CSV)

Vendas por dia, produto (**curva ABC**), categoria, vendedor, operador, forma de pagamento, canal e loja ·
posição de estoque valorizada · **kardex** do produto com saldo a cada lançamento · entradas e saídas ·
fechamentos de caixa · fluxo de caixa realizado e previsto · **DRE gerencial**.

## Rastreabilidade com a documentação

| Requisito / artefato | Onde está |
|---|---|
| RF01 Cadastro de usuário | ERP › Usuários; `POST /api/usuarios` (CPF validado, senha com hash) |
| RF02 Controle de acesso | Toda tentativa de login gera `RegistroAcesso` (data/hora/IP/origem); ERP › Usuários › Registro de acessos |
| RF03/RF04 Digitalização e OCR | ERP › Documentos; `IOcrService` (troque por Tesseract/Azure Vision), arquivo original guardado e baixável |
| Diagrama de estado do documento | `Documento.VerificarPadrao` / `RegistrarAnalise`: Bloqueado → Disponível → Analisado |
| RF05/RF12 Análises e simulação | Painel: projeção Holt-Winters com faixa de 80%, previsão de fechamento do mês, ruptura de estoque |
| RF06 Alertas | Contas vencendo/atrasadas no ERP, no painel e em `GET /api/financeiro/alertas` |
| RF09/RF13 Relatórios e gráficos comparativos | Painel `/admin` (períodos 7/30/90/180 dias, mês vs. mês anterior, tabela de dados) e resumo financeiro |
| Energia/água (kWh, m³), IPTU, manutenção, folha | Lançamentos financeiros com consumo, setor e categoria |
| Cadastro bancário | Entidade `CadastroBancario` (base para a integração bancária) |
| Arquitetura em camadas + cliente-servidor + eventos | Domain → Infrastructure → Api; clientes via REST; eventos SignalR |

## Regras de negócio implementadas

- Estoque por depósito (Loja Centro, Loja Shopping, CD) com **reserva**: pedido online e ordem de transferência reservam; PDV só vende o disponível.
- Entrada de NF atualiza **custo médio** (com frete rateado) e gera **contas a pagar** em parcelas; ajuste por **contagem de inventário**.
- Venda do PDV: exige caixa aberto, baixa estoque, grava kardex, lança receita; cancelamento devolve estoque e estorna receita.
- O kardex sempre fecha com o saldo: saldo de implantação + entradas − saídas = saldo atual, por produto e depósito.
- Pedido online: reserva (3 dias, retirada) ou compra (retirada ou entrega; frete grátis acima de R$ 300); reservas vencidas expiram sozinhas.
- Fluxo do pedido com transições válidas (confirmado → separação → pronto/em rota → concluído); ao concluir vira **venda do canal Online**.
- **Maioridade**: cadastro e pedido exigem 18+ (bebida alcoólica); portão de idade na loja.
- Concorrência otimista no saldo (duas vendas simultâneas não deixam o estoque negativo).

## Próximos passos sugeridos

1. Criar as migrations e testes automatizados (xUnit para serviços, Playwright para a loja).
2. Gateway de pagamento real (Pix/cartão) no `PedidoService` — hoje o pagamento online é simulado.
3. OCR real (Tesseract ou Azure AI Vision) implementando `IOcrService`.
4. RF07/RF08 folha de pagamento (salário, horas extras, FGTS, 13º, férias) e RF11 integração bancária (CNAB/Open Finance).
5. Emissão fiscal (NFC-e) e TEF integrado no PDV (hoje o cupom é não fiscal e o NSU é digitado).
6. Publicar a API e o ERP em um serviço de hospedagem para acesso fora da rede local.

## Como esta versão foi verificada

- **Supabase:** tabelas criadas e conferidas contra o modelo do EF Core (274 colunas, 35 chaves estrangeiras, 55 índices);
  dados carregados e validados no próprio banco (kardex fecha com o saldo em todos os produtos e depósitos, nenhuma venda
  com pagamento ou itens divergentes).
- **Regras de negócio e API:** seeder e fluxos novos (caixa, venda com alçada, NF com frete, ordem de separação,
  relatórios, pedido online) executados de ponta a ponta contra um banco em memória.
- **Telas do ERP:** renderizadas com dados reais dessa API e conferidas visualmente; os cliques foram simulados.
- **O que só dá para confirmar na sua máquina:** o ambiente onde o código foi gerado não acessa o NuGet nem o Supabase
  por rede, então a compilação com os pacotes reais do EF Core/Npgsql e a conexão da API com o Supabase acontecem pela
  primeira vez no seu `dotnet run`. Se aparecer erro, o console da API mostra o motivo.
