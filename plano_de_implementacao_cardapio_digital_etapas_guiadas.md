# Plano de Implementação — Cardápio Digital (Etapas Guiadas)

> Documento operacional para desenvolvimento passo a passo usando IA (ex: Trae IDE)

---

## Por que fazer por etapas? (resposta direta)

Sim, **é muito melhor por etapas**.

Se você tentar fazer tudo de uma vez:
- a IA mistura responsabilidades,
- erra regras de negócio,
- quebra o modelo de dados no meio do caminho,
- e você perde controle técnico.

Por etapas:
- você valida decisões cedo,
- detecta erro barato,
- reaproveita código,
- e mantém o projeto evolutivo.

Este documento define **EXATAMENTE** a ordem correta.

---

## Visão Geral das Etapas

1. Planejamento técnico
2. Modelagem de dados
3. Infraestrutura base do backend
4. APIs de catálogo (menu)
5. APIs de pedido e regras de negócio
6. Pagamento (Pix / mock)
7. Painel administrativo
8. KDS (cozinha)
9. Estoque
10. Frontend do cliente
11. Segurança, testes e ajustes
12. Deploy e operação

Cada etapa é **independente**, validável e testável.

---

## ETAPA 0 — Preparação do Projeto

### Objetivo
Garantir que a base esteja correta antes de escrever código.

### Entregáveis
- Repositório criado
- Stack definida
- Estrutura de pastas

### Decisões técnicas
- Backend: Node.js + Express
- Banco: PostgreSQL
- ORM: Prisma
- Frontend: React (PWA depois)
- API: REST

### Checklist
- [ ] Criar repositório Git
- [ ] Definir `.editorconfig` e `.env.example`
- [ ] Definir padrão de commits

---

## ETAPA 1 — Modelagem de Dados (CRÍTICA)

### Objetivo
Criar o **modelo definitivo** do sistema.

### O que implementar
- Todas as tabelas descritas na documentação:
  - categorias
  - itens
  - variacoes
  - modificadores
  - opcoes_modificador
  - pedidos
  - pedido_itens
  - pedido_item_opcoes
  - estoque_ingredientes
  - consumo_por_item
  - usuarios

### Regras
- UUID como chave primária
- Integridade referencial
- Campos de auditoria

### Entregáveis
- DDL SQL completo
- Schema Prisma

### Critério de aceite
- Modelo cobre 100% da documentação
- Nenhuma regra de negócio no código ainda

---

## ETAPA 2 — Infraestrutura do Backend

### Objetivo
Ter um backend funcional e saudável.

### O que implementar
- Express configurado
- Conexão com PostgreSQL
- Prisma configurado
- Middleware de erro global
- Logger básico

### Entregáveis
- Servidor sobe sem erro
- Health check `/health`

---

## ETAPA 3 — APIs de Catálogo (Menu)

### Objetivo
Permitir gerenciar e consumir o cardápio.

### APIs
- `GET /categorias`
- `POST /admin/categorias`
- `GET /itens`
- `POST /admin/itens`
- `GET /itens/:id`

### Regras
- Itens inativos não aparecem para cliente
- Admin vê tudo

### Entregáveis
- CRUD completo de categorias e itens

---

## ETAPA 4 — Modificadores e Variações

### Objetivo
Implementar personalização real dos lanches.

### O que implementar
- CRUD de modificadores
- CRUD de opções
- Associação item ↔ modificador

### Regras
- Limite de seleção respeitado
- Gratuidade aplicada corretamente

### Critério de aceite
- IA não pode permitir seleção inválida

---

## ETAPA 5 — Carrinho e Cálculo de Preço

### Objetivo
Garantir que **preço nunca erre**.

### O que implementar
- Serviço de cálculo de preço
- Validação de modificadores
- Subtotal, taxas e total

### Regras críticas
- Preço congelado no pedido
- Ingrediente removido não gera desconto

---

## ETAPA 6 — Criação de Pedido

### Objetivo
Registrar pedidos corretamente.

### Fluxo
1. Cliente envia pedido
2. Backend valida
3. Calcula total
4. Salva pedido
5. Retorna número do pedido

### Status iniciais
- `recebido`
- `aguardando_pagamento`

---

## ETAPA 7 — Pagamento (Pix / Mock)

### Objetivo
Simular ou integrar pagamento.

### O que implementar
- Geração de cobrança Pix (mock)
- Webhook simulado
- Atualização de status

### Regra
- Pedido só avança se pagamento confirmado

---

## ETAPA 8 — Painel Administrativo

### Objetivo
Operação diária da loja.

### Telas
- Login admin
- Lista de pedidos
- Alterar status
- Gerenciar menu

### Regras
- Apenas admin altera status

---

## ETAPA 9 — KDS (Cozinha)

### Objetivo
Organizar preparo.

### O que implementar
- Tela simples
- Pedidos em tempo real (polling ou websocket)
- Botão "pronto"

---

## ETAPA 10 — Estoque

### Objetivo
Evitar venda sem ingrediente.

### O que implementar
- Consumo por item
- Débito automático
- Bloqueio de itens

---

## ETAPA 11 — Frontend do Cliente

### Objetivo
Experiência rápida e clara.

### Telas
- Cardápio
- Modal de personalização
- Carrinho
- Checkout
- Acompanhamento do pedido

### Regra
- Mobile first

---

## ETAPA 12 — Segurança e Testes

### O que implementar
- JWT admin
- Validações
- Testes unitários (preço)
- Testes de fluxo

---

## ETAPA 13 — Deploy

### Objetivo
Colocar em produção.

### O que implementar
- Docker
- Variáveis de ambiente
- Backup automático

---

## Como usar este documento com a Trae IDE

### Estratégia recomendada

1. **Nunca peça tudo de uma vez**
2. Sempre diga:
   - etapa atual
   - o que deve ser entregue
   - o que NÃO deve ser feito ainda

### Exemplo de prompt ideal

> "Estamos na ETAPA 1 (Modelagem de Dados). Gere apenas o DDL PostgreSQL e o schema Prisma. Não implemente APIs nem frontend."

---

## Regra de ouro

👉 **Se uma etapa estiver mal feita, TODAS as próximas quebram.**

Valide cada fase antes de avançar.

---

**Fim do plano de implementação.**

