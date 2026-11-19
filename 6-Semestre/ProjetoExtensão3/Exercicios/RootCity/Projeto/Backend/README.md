# 🌱 Cidade Raiz - Backend API

API RESTful do ecossistema **Cidade Raiz**, uma plataforma voltada à gestão de arborização urbana, pedidos de mudas, plantios e engajamento comunitário em municípios.

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Recursos](#-arquitetura-e-recursos)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Executando a Aplicação](#-executando-a-aplicação)
- [Rotas da API](#-rotas-da-api)
- [Controle de Acesso (RBAC)](#-controle-de-acesso-rbac)

---

## 🌿 Visão Geral

O **Cidade Raiz (Backend)** gerencia:
- Cadastro e controle de acesso de munícipes, funcionários e administradores.
- Gestão de cidades conveniadas e configurações de entrega/retirada.
- Catálogo de espécies de árvores e controle de estoque de mudas.
- Fluxo de requisições de mudas e agendamento de plantios (solicitação, aprovação, recusa, retirada e conclusão).
- Postagens de conscientização e notícias (Blog).
- Geração de relatórios operacionais.
- Upload e validação de imagens utilizando Supabase Storage.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime & Linguagem:** [Node.js](https://nodejs.org/) com [TypeScript](https://www.typescriptlang.org/)
- **Framework Web:** [Express 5](https://expressjs.com/)
- **ORM & Banco de Dados:** [Prisma ORM](https://www.prisma.io/) com PostgreSQL (Driver Adapter: `@prisma/adapter-pg`)
- **Autenticação & Armazenamento:** [Supabase](https://supabase.com/) (Auth & Storage)
- **Validação de Dados:** [Zod](https://zod.dev/)
- **Upload & Manipulação de Arquivos:** [Multer](https://github.com/expressjs/multer) e [file-type](https://github.com/sindresorhus/file-type)
- **Segurança & Políticas:** [Helmet](https://helmetjs.github.io/) e [CORS](https://github.com/expressjs/cors)
- **Execução & Dev Tools:** [tsx](https://github.com/privatenumber/tsx) (TypeScript Execute & Watch)

---

## 🏗️ Arquitetura e Recursos

```text
src/
├── controllers/      # Camada de controle e orquestração de requisições
├── middlewares/      # Interceptadores (autenticação, RBAC, validação de upload)
├── routes/           # Definição e mapeamento dos endpoints da API
├── services/         # Regras de negócio da aplicação
├── generated/        # Artefatos gerados pelo Prisma Client
├── app.ts            # Configuração do Express, middlewares globais e rotas
└── server.ts         # Inicialização do servidor HTTP
prisma/
└── schema.prisma     # Modelagem de dados, enums e relações do banco
```

---

## 📋 Pré-requisitos

- **Node.js** (v18 ou superior recomendado)
- **npm** ou **yarn**
- Instância do **PostgreSQL** ativa (ou projeto no Supabase)
- Projeto configurado no **Supabase** (Auth e Storage Bucket)

---

## ⚙️ Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/guilhermebatista7/cidade-raiz-backend.git
   cd cidade-raiz-backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo `.env` na raiz do projeto com base no `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Preencha as variáveis de ambiente necessárias:
   ```env
   PORT=3000

   # Conexão com o banco de dados PostgreSQL
   DATABASE_URL="postgresql://usuario:senha@host:5432/cidade_raiz?schema=public"
   DIRECT_URL="postgresql://usuario:senha@host:5432/cidade_raiz?schema=public"

   # Supabase (Autenticação e Storage)
   SUPABASE_URL="https://seu-projeto.supabase.co"
   SUPABASE_ANON_KEY="sua-chave-publica-anon"
   ```

5. Gere os artefatos do Prisma Client:
   ```bash
   npx prisma generate
   ```

6. Execute as migrações do banco de dados (se aplicável):
   ```bash
   npx prisma migrate dev
   ```

---

## 🚀 Executando a Aplicação

- **Modo Desenvolvimento (com auto-reload):**
  ```bash
  npm start
  ```
  O servidor estará disponível por padrão em: `http://localhost:3000`

- **Build de Produção (Compilação TypeScript):**
  ```bash
  npm run build
  ```

---

## 🔌 Rotas da API

Todas as rotas estão sob o prefixo `/api`:

| Módulo | Prefixo | Descrição |
|---|---|---|
| **Auth** | `/api/auth` | Login, logout, refresh e dados de sessão |
| **Árvores** | `/api/arvores` | Catálogo de espécies, detalhes e disponibilidade |
| **Cidades** | `/api/cidades` | Municípios cadastrados e configurações de entrega |
| **Usuários** | `/api/usuario` | Gestão de perfis e dados de munícipes/equipe |
| **Requisições** | `/api/requisicao` | Solicitações de mudas, agendamentos e alterações de status |
| **Blog** | `/api/blog` | Artigos, notícias e conteúdos informativos |
| **Relatórios** | `/api/relatorio` | Métricas operacionais e exportação de dados |
| **Endereços** | `/api/endereco` | Gestão e validação de endereços de entrega/plantio |

---

## 🔐 Controle de Acesso (RBAC)

A plataforma utiliza controle de perfis de usuário baseado em papéis (*Roles*):
- `CIDADAO`: Visualiza árvores, solicita mudas e acompanha pedidos.
- `FUNCIONARIO`: Atende chamados, atualiza status de plantio e retiradas.
- `ADMIN_LOCAL`: Gerencia árvores, munícipes e operações dentro de sua cidade.
- `GLOBAL`: Administrador geral da plataforma com visão consolidada intermunicipal.
