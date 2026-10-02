# Vino Bebidas — Sistema integrado (ERP/PDV + Loja online + Painel BI + App)

Projeto acadêmico (IFSP Catanduva) que implementa o sistema da **Vino Bebidas** a partir da documentação de
Análise OO (requisitos RF01–RF13, diagramas de classes, casos de uso, estado e arquitetura em camadas),
ampliado para um ERP completo de uma distribuidora de vinhos.

```
                   ┌──────────────────────────┐
  ERP / PDV  ────► │                          │
  (Blazor .NET)    │   API central (.NET 10)  │ ───► Banco único (SQLite ou SQL Server)
  Loja web   ────► │   ASP.NET Core + EF Core │
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
| ERP / PDV | `src/VinoBebidas.Erp` | Blazor (Interactive Server) | Frente de caixa, estoque, movimentações, pedidos, cadastros, financeiro, OCR, usuários |
| Loja + painel | `web` | React 19, Vite, TypeScript, Tailwind 4, TanStack Query, Recharts, SignalR | Catálogo de vinhos, conta, reserva/compra, entrega/retirada; `/admin` com BI ao vivo |
| App catálogo | `mobile` | React Native + Expo (TypeScript) | Catálogo no celular para clientes e consultores, distribuído por QR code |

### Por que React Native (Expo) no app?
Reaproveita TypeScript/React da loja web (mesmos tipos, mesma API), roda em Android e iPhone com um código só,
e o Expo gera o APK e a página de instalação com **QR code** sem precisar de Android Studio. A página
`/app` da loja mostra o QR apontando para o link configurado.

## Requisitos para rodar

- [.NET SDK 10](https://dotnet.microsoft.com/download) (o projeto usa `net10.0`)
- [Node.js 22+](https://nodejs.org)
- Opcional: SQL Server / LocalDB (o padrão é SQLite, que não precisa instalar nada)
- Para o app: celular com **Expo Go** (desenvolvimento) ou conta Expo para gerar o APK

## Como rodar (Windows)

Jeito rápido: clique com o botão direito em `iniciar.ps1` → **Executar com o PowerShell**. Ele abre API, ERP e loja.

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

- Padrão: **SQLite** em `src/VinoBebidas.Api/vinobebidas.db` (criado automaticamente).
- SQL Server: rode a API com `$env:ASPNETCORE_ENVIRONMENT="SqlServer"; dotnet run` (usa `appsettings.SqlServer.json`,
  LocalDB por padrão) ou troque `Banco:Provedor` e a connection string no `appsettings.json`.
- Recriar do zero: apague o `.db` ou use `"Banco": { "RecriarAoIniciar": true }` uma vez.
- Migrations (recomendado quando o modelo estabilizar):
  `dotnet tool install -g dotnet-ef` → `dotnet ef migrations add Inicial -p src/VinoBebidas.Infrastructure -s src/VinoBebidas.Api`
  → `"Banco": { "UsarMigrations": true }`.

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

- Estoque por depósito (Loja Centro, Loja Shopping, CD) com **reserva**: pedido online reserva; PDV só vende o disponível.
- Entrada de NF atualiza **custo médio** e pode gerar **conta a pagar**; transferência bloqueia se faltar saldo; ajuste por **contagem de inventário**.
- Venda do PDV: baixa estoque, grava kardex, lança receita; cancelamento devolve estoque e estorna receita.
- Pedido online: reserva (3 dias, retirada) ou compra (retirada ou entrega; frete grátis acima de R$ 300); reservas vencidas expiram sozinhas.
- Fluxo do pedido com transições válidas (confirmado → separação → pronto/em rota → concluído); ao concluir vira **venda do canal Online**.
- **Maioridade**: cadastro e pedido exigem 18+ (bebida alcoólica); portão de idade na loja.
- Concorrência otimista no saldo (duas vendas simultâneas não deixam o estoque negativo).

## Próximos passos sugeridos

1. Criar as migrations e testes automatizados (xUnit para serviços, Playwright para a loja).
2. Gateway de pagamento real (Pix/cartão) no `PedidoService` — hoje o pagamento online é simulado.
3. OCR real (Tesseract ou Azure AI Vision) implementando `IOcrService`.
4. RF07/RF08 folha de pagamento (salário, horas extras, FGTS, 13º, férias) e RF11 integração bancária (CNAB/Open Finance).
5. Emissão fiscal (NFC-e) no PDV e impressora térmica.
6. RF10 relatórios personalizados com exportação para Excel/PDF.

## Observação sobre esta versão

O código foi escrito e compilado com o .NET 10 SDK; a loja web foi compilada e verificada visualmente e o
app mobile passou no typecheck e no empacotamento do Metro. No ambiente onde foi gerado não havia acesso ao
NuGet, então a camada EF Core foi compilada contra uma cópia das assinaturas da API do EF — **rode
`dotnet build` na sua máquina** para confirmar com os pacotes reais (a primeira execução baixa os pacotes).
