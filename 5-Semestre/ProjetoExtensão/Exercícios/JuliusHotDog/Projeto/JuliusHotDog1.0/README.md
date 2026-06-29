# Julius Hot Dogs - Plataforma Web

## 🌭 Sobre o Projeto

Plataforma web mobile-first para o food truck Julius Hot Dogs, integrando landing page, cardápio online interativo e painel administrativo simplificado.

## ✨ Funcionalidades

### Para Clientes
- **Landing Page** - Apresentação da marca, produtos em destaque, localização e horários
- **Cardápio Online** - Catálogo completo com filtros por categoria
- **Personalização** - Customize seu pedido com opções especiais
- **Pedidos via WhatsApp** - Envio automático de pedidos formatados
- **Comanda Digital** - Acompanhamento do status do pedido

### Para Administração
- **Fila de Pedidos** - Visualização e gerenciamento de todos os pedidos
- **Controle de Estoque** - Gestão de ingredientes com alertas automáticos
- **Relatórios** - Análises de vendas, produtos mais vendidos e performance
- **Autorização Manual** - Aprovação personalizada de cada pedido

## 🚀 Como Usar

### Acesso Cliente
1. Acesse a landing page
2. Clique em "Ver Cardápio"
3. Escolha seus produtos e personalize
4. Adicione ao carrinho
5. Preencha seus dados e horário de retirada
6. Envie o pedido (será aberto o WhatsApp automaticamente)

### Acesso Administrativo
1. Acesse `/admin/login`
2. Credenciais de demonstração:
   - **Usuário:** julius
   - **Senha:** admin123
3. Gerencie pedidos, estoque e visualize relatórios

## 📱 PWA (Progressive Web App)

Esta aplicação pode ser instalada no celular como um app:
1. Abra no navegador mobile
2. Toque em "Adicionar à tela inicial"
3. Use como um aplicativo nativo!

## 🛠️ Tecnologias

- **React** - Framework frontend
- **React Router** - Navegação entre páginas
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e análises
- **Radix UI** - Componentes acessíveis
- **Sonner** - Notificações toast
- **LocalStorage** - Persistência de dados (cliente)

## 📊 Estrutura de Dados

Os dados são armazenados no LocalStorage do navegador:
- **Pedidos** - Todos os pedidos criados
- **Estoque** - Níveis atuais de cada ingrediente
- **Produtos** - Catálogo de produtos
- **Carrinho** - Itens sendo adicionados ao pedido

## 🔄 Fluxo de Pedidos

1. **Cliente** cria pedido → Ingredientes reservados temporariamente
2. **Sistema** envia mensagem formatada via WhatsApp
3. **Julius** autoriza ou nega o pedido
4. **Cliente** recebe confirmação
5. **Sistema** atualiza estoque definitivamente (se autorizado)

## ⚠️ Importante

- Esta é uma **versão de demonstração** que usa LocalStorage
- Para produção, recomenda-se integração com backend real
- Não use para armazenar dados sensíveis
- A integração WhatsApp usa links wa.me (sem API oficial)

## 🎨 Customização

Para personalizar o negócio, edite `/src/app/lib/data.ts`:
- Número do WhatsApp
- Endereço e horários
- Produtos e ingredientes
- Configurações de tempo

## 📝 Licença

Desenvolvido para Julius Hot Dogs - 2026
