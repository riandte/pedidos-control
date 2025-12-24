# Documentação Completa - Sistema de Cardápio Digital e Gestão de Pedidos

## 1. Visão Geral
Este projeto é um sistema completo para automação de lanchonetes e restaurantes, composto por uma interface para o cliente final (Cardápio Digital) e um painel administrativo para gestão da loja, produtos e pedidos. O sistema permite desde a montagem do pedido pelo cliente até o controle de produção na cozinha (KDS).

---

## 2. Tecnologias Utilizadas

### Backend
- **Node.js & Express**: Servidor web robusto e escalável.
- **TypeScript**: Tipagem estática para maior segurança e manutenibilidade.
- **Prisma ORM**: Manipulação de banco de dados e migrações.
- **SQLite**: Banco de dados relacional (configurado para fácil deploy/desenvolvimento local).
- **JWT (JSON Web Token)**: Autenticação segura para áreas administrativas.

### Frontend
- **React.js (Vite)**: Interface de usuário moderna e performática.
- **TypeScript**: Integração de tipos com o backend.
- **CSS Modules / Variáveis CSS**: Estilização moderna e responsiva.
- **Lucide React**: Ícones leves e consistentes.

---

## 3. Arquitetura e Estrutura do Projeto

O projeto é dividido em dois diretórios principais (Monorepo):

```
/pedidos-control
│
├── /backend            # API RESTful
│   ├── /prisma         # Schema do banco e migrações
│   └── /src
│       ├── /controllers # Lógica de entrada/saída das requisições
│       ├── /services    # Regras de negócio puras
│       ├── /routes      # Definição dos endpoints
│       └── /models      # Definições de tipos (via Prisma)
│
└── /frontend           # Aplicação Web (SPA)
    ├── /src
    │   ├── /pages
    │   │   ├── /client  # Telas do consumidor (Cardápio, Detalhes)
    │   │   └── /admin   # Telas de gestão (Pedidos, KDS, Produtos)
    │   ├── /components  # Componentes reutilizáveis (Botões, Modais)
    │   └── /services    # Integração com a API (Axios)
```

---

## 4. Banco de Dados (Modelagem)

O sistema utiliza as seguintes entidades principais (definidas no `schema.prisma`):

### Usuários e Auth
- **User**: Administradores e Clientes. Possui nome, email/cpf, senha e role (ADMIN/CLIENTE).

### Catálogo
- **Configuracao**: Dados da loja (nome, endereço, status aberto/fechado).
- **Categoria**: Categorias de produtos (ex: Lanches, Bebidas). Possui ordem de exibição.
- **Produto**: O item vendável. Possui preço base, tempo de preparo e flag `permiteAdicionais`.
- **Ingrediente**: Matéria-prima base (ex: Bacon, Queijo).
- **GrupoAdicional**: Agrupador de opções (ex: "Escolha a Borda", "Adicionais"). Define mínimo e máximo de escolhas.
- **Adicional**: A opção selecionável dentro de um grupo. Pode ter preço extra.

### Vendas
- **Pedido**: O registro da venda. Contém cliente, status, total, tipo de entrega e observações.
- **PedidoItem**: Item do pedido (snapshot do produto no momento da venda).
- **PedidoItemAdicional**: Adicionais escolhidos para o item.

---

## 5. Fluxos do Sistema

### 5.1. Fluxo do Cliente (Cardápio)
1.  **Navegação**: O cliente acessa a rota `/` e visualiza as categorias e produtos ativos.
2.  **Detalhes e Personalização**: Ao clicar em um produto, abre-se a tela de detalhes (`/produto/:id`).
    *   Se o produto permite adicionais, o cliente escolhe opções (obrigatórias ou opcionais).
    *   O preço é recalculado em tempo real.
3.  **Carrinho**: O cliente adiciona itens à sacola. O carrinho (`CartDrawer`) permite revisar, alterar quantidades e remover itens.
4.  **Checkout**:
    *   O cliente informa nome e telefone.
    *   Escolhe o tipo de entrega (Retirada/Mesa/Entrega).
    *   O sistema gera um QR Code PIX (Simulação) para pagamento.
5.  **Acompanhamento**: Após finalizar, o pedido é enviado para o servidor com status `RECEBIDO`.

### 5.2. Fluxo Administrativo
1.  **Login**: Acesso via `/login` para usuários com role `ADMIN`.
2.  **Gestão de Produtos**:
    *   CRUD completo de produtos, categorias e ingredientes.
    *   Configuração de fichas técnicas e grupos de adicionais.
3.  **Gestão de Pedidos (Kanban)**:
    *   Tela `/admin/pedidos` exibe colunas: Recebidos, Em Preparo, Prontos.
    *   O gestor move os cards entre as colunas, atualizando o status do pedido.
4.  **KDS (Kitchen Display System)**:
    *   Tela `/kds` (Fullscreen) para uso na cozinha.
    *   Mostra apenas pedidos "EM_PREPARO".
    *   Cozinheiro marca como "PRONTO" ao finalizar.

---

## 6. Regras de Negócio e Status

### Ciclo de Vida do Pedido
1.  **RECEBIDO**: Pedido criado pelo cliente. Aguarda confirmação da loja.
2.  **EM_PREPARO**: Loja aceitou e iniciou a produção. Aparece no KDS.
3.  **PRONTO**: Produção finalizada. Aguardando retirada ou entregador.
4.  **FINALIZADO**: Pedido entregue e concluído.
5.  **CANCELADO**: Pedido invalidado.

### Regras de Preço
- **Total do Item** = (Preço Base do Produto + Soma dos Preços dos Adicionais) * Quantidade.
- **Total do Pedido** = Soma dos Totais dos Itens.

---

## 7. API Endpoints

### Público
- `GET /configuracoes`: Dados da loja.
- `GET /categorias`: Listagem de categorias ativas.
- `GET /produtos`: Listagem de produtos.
- `GET /produtos/:id`: Detalhes de um produto.
- `POST /pedidos`: Criação de novo pedido.
- `POST /auth/login`: Login administrativo.

### Privado (Requer Token Bearer)
- **Admin**:
    - `GET /admin/pedidos`: Listar todos os pedidos.
    - `PATCH /admin/pedidos/:id/status`: Alterar status.
    - `POST/PUT/DELETE /admin/produtos`: Gestão de produtos.
    - `POST/PUT/DELETE /admin/ingredientes`: Gestão de ingredientes.
    - `POST/PUT/DELETE /admin/grupos-adicionais`: Gestão de complementos.
    - `PUT /admin/configuracoes`: Alterar dados da loja.
- **KDS**:
    - `GET /kds/fila`: Fila de produção.
    - `PATCH /kds/pedidos/:id/pronto`: Marcar como pronto.

---

## 8. Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18+)
- NPM ou Yarn

### Passo a Passo

1.  **Configurar Backend**:
    ```bash
    cd backend
    npm install
    npx prisma migrate dev  # Cria o banco SQLite
    npx prisma db seed      # (Opcional) Popula com dados iniciais
    npm run dev             # Inicia em http://localhost:3333
    ```

2.  **Configurar Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev             # Inicia em http://localhost:5173
    ```

3.  **Acessar**:
    - Cliente: `http://localhost:5173`
    - Admin: `http://localhost:5173/admin` (Login necessário)

---

## 9. Próximos Passos (Roadmap Sugerido)
- [ ] Implementação de WebSockets para atualização em tempo real (sem polling).
- [ ] Integração real com gateway de pagamento (Mercado Pago / Stripe).
- [ ] Impressão térmica automática de pedidos.
- [ ] Relatórios financeiros e de vendas.
