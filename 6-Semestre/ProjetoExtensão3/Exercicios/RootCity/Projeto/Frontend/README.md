# 🌳 Cidade Raiz - Frontend

Interface web SPA (*Single Page Application*) da plataforma **Cidade Raiz**, desenvolvida para aproximar cidadãos e gestores municipais através da solicitação de mudas, agendamento de plantios urbanos e conscientização ambiental.

---

## 📌 Sumário

- [Visão Geral](#-visão-geral)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Executando a Aplicação](#-executando-a-aplicação)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🍃 Visão Geral

O frontend do **Cidade Raiz** oferece uma experiência responsiva e moderna:
- **Área Pública / Cidadão:** Consulta a espécies adequadas para calçadas e quintais, realização de pedidos de mudas, solicitação de plantios e leitura de artigos do blog.
- **Painel de Gestão:** Dashboard com gráficos, métricas, controle de requisições, emissão de relatórios (PDF e Excel) e administração de catálogo.

---

## 🛠️ Tecnologias Utilizadas

- **Framework & Biblioteca Base:** [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
- **Ferramenta de Build & Dev Server:** [Vite](https://vite.dev/)
- **Roteamento:** [React Router v7](https://reactrouter.com/) (com carregamento sob demanda `React.lazy`)
- **Gerenciamento de Estado de Servidor & Cache:** [TanStack Query v5 (React Query)](https://tanstack.com/query/latest)
- **Componentes & UI:**
  - [Material UI (MUI v9)](https://mui.com/) & [@mui/x-charts](https://mui.com/x/react-charts/) para dashboards analíticos
  - [Bootstrap 5](https://getbootstrap.com/)
  - [FontAwesome](https://fontawesome.com/) Icons
- **Exportação de Dados & Relatórios:**
  - [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
  - [XLSX (SheetJS)](https://sheetjs.com/)
- **Linting & Padronização:** ESLint com regras para React Hooks e TypeScript

---

## ✨ Funcionalidades Principais

- 🔐 **Autenticação Segura:** Autenticação via cookies HTTP-only, contexto global de usuário e controle de rotas protegidas (`RotaProtegida`).
- 🌱 **Solicitação & Acompanhamento de Mudas:** Formulário guiado para munícipes escolherem espécies e modalidades (retirada local ou plantio agendado).
- 📊 **Painel Administrativo & Gráficos:** Visualização analítica da distribuição de pedidos e espécies mais requisitadas.
- 📄 **Exportação de Relatórios:** Geração instantânea de relatórios nos formatos `.pdf` e `.xlsx`.
- ⚡ **Otimização de Carregamento:** Code-splitting de rotas, overlays de carregamento e Skeletons dedicados para melhor UX.

---

## 📁 Estrutura do Projeto

```text
src/
├── assets/
│   ├── components/      # Componentes compartilhados (Menu, Footer, Skeletons, Modais)
│   ├── media/           # Imagens e vetores
│   └── pages/           # Páginas da aplicação (HomePage, Login, Plantar, Gestao, Blog)
├── contexts/            # Contextos React (AuthContext, LoadingContext)
├── services/            # Clientes HTTP, chamadas à API e camada de autenticação
├── types/               # Tipagens TypeScript compartilhadas
├── App.tsx              # Configuração de rotas, providers e layout base
└── main.tsx             # Ponto de entrada da aplicação Vite
```

---

## 📋 Pré-requisitos

- **Node.js** (v18 ou superior recomendado)
- **npm**, **pnpm** ou **yarn**
- Backend do **Cidade Raiz** em execução (ou endpoint configurado)

---

## ⚙️ Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/guilhermebatista7/cidade-raiz-frontend.git
   cd cidade-raiz-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto:
   ```env
   # URL base do servidor Backend da API
   VITE_API_URL=http://localhost:3000/api
   ```

---

## 🚀 Executando a Aplicação

- **Modo Desenvolvimento:**
  ```bash
  npm run dev
  ```
  Acesse a aplicação no navegador em: `http://localhost:5173`

- **Build de Produção:**
  ```bash
  npm run build
  ```

- **Visualizar Build Localmente:**
  ```bash
  npm run preview
  ```

- **Verificação de Código (Linting):**
  ```bash
  npm run lint
  ```
