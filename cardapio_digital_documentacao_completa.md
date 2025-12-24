# Cardápio Digital para Vendas de Lanches — Documentação Completa

> Versão inicial (MVP) — Documento de requisitos, arquitetura, dados, APIs, telas e roadmap.

---

## 1. Visão Geral

**Objetivo:** criar um sistema de cardápio digital para vendas de lanches onde o cliente seleciona itens, personaliza ingredientes/adicionais, escolhe método de retirada/entrega, paga e recebe confirmação. O sistema serve para balcão, delivery próprio e retirada (takeaway).

**Público-alvo:** lanchonetes, food-trucks, pequenas redes de fast-food e estabelecimentos que querem digitalizar pedidos.

**Principais benefícios:** redução de filas, menor erro de pedido, upsell por adicionais, controle de estoque, relatórios de vendas.

---

## 2. Objetivos do produto

- Permitir que clientes façam pedidos via smartphone (QR code / link) ou navegador.
- Oferecer personalização por item (ingredientes, tamanho, molho, ponto, etc.).
- Suportar regras de preço (adicionais, descontos, combos, preço por tamanho).
- Processar pagamentos online e registrar pedidos para preparo.
- Painel administrativo para gerenciar menu, pedidos, estoque e relatórios.

---

## 3. Stakeholders

- Dono/Administrador do estabelecimento
- Atendentes/Operador de caixa
- Cozinha / Montagem (KDS)
- Cliente final
- Entregador (se delivery próprio)
- Equipe de suporte/DevOps

---

## 4. Personas (exemplos)

1. **Ana, 28, cliente** — quer pedir rápido, personalizar sem erro e pagar com cartão/pix.
2. **Carlos, 42, dono da lanchonete** — quer controlar menu, ver vendas e estoque.
3. **Mariana, 22, atendente** — precisa confirmar pedidos, enviar para cozinha e fechar pagamentos.

---

## 5. Escopo MVP (mínimo viável)

Funcionalidades essenciais a entregar primeiro:

- Página pública com menu categorizado.
- Seleção de itens e personalização básica (tamanhos, adicionais, excluir ingredientes).
- Carrinho e cálculo automático de preço.
- Finalizar pedido com escolha: retirada (no local) ou entrega (endereço).
- Pagamento: opção de pagamento no balcão (dinheiro/cartão) e link para pagamento online (Pix ou gateway simples).
- Recebimento de pedido no admin/painel e notificação sonora/visual.
- Histórico simples de pedidos e relatórios diários.

---

## 6. Funcionalidades completas (versão futura)

- Integração com gateways (Stripe, PagSeguro, Pagar.me).
- Integração com delivery externo (iFood, Uber Eats) — apenas para conciliação.
- Sistema de cupons e promoções.
- Combos dinâmicos e regras de preço (ex: 2 por 1, desconto por quantidade).
- Gerenciamento de estoque com bloqueio de itens (quando estoque baixo, item indisponível).
- KDS (Kitchen Display System) para preparo com timers e status.
- Painel para entregadores com roteirização básica.
- Suporte multilojas.
- Autenticação para clientes (opcional) com histórico e favoritos.
- Avaliação/feedback pós-pedido.

---

## 7. Requisitos Funcionais (detalhados)

### 7.1 Catálogo e Menu
- CRUD de categorias (Ex.: Sanduíches, Bebidas, Acompanhamentos).
- CRUD de itens de cardápio: nome, descrição, preço base, imagem, tempo estimado de preparo, disponibilidade.
- Opções/Modificadores por item (ex.: escolher 3 ingredientes grátis, adicionais cobrados, retirar ingrediente grátis).
- Variações por tamanho ou tipo (Pequeno/Médio/Grande) com alteração de preço.
- Marcações para itens sem lactose/vegetariano/vegan.

### 7.2 Customização
- Modificadores com regras: seleção única, múltipla, até N escolhas grátis, escolha com custo por unidade.
- Observações livres por item (campo texto curto).

### 7.3 Carrinho e Checkout
- Cálculo automático: subtotal por item, adicionais, impostos, taxas de entrega, descontos.
- Escolha de modalidade: retirada/entrega/mesa (opcional).
- Validação de endereço (básica) e cálculo de taxa de entrega por zona ou distância.
- Forma de pagamento: "Pagar online" (link/Pix/cartão) ou "Pagar no local".
- Geração de resumo e confirmação com número de pedido.

### 7.4 Pedidos e Fluxo de Preparo
- Status do pedido: Recebido → Em preparo → Pronto → Em rota (se delivery) → Entregue/Retirado → Cancelado.
- Notificações para cliente: pedido recebido, em preparo, pronto para retirada, entregue.
- Tela de pedidos no admin (fila), com filtro por status e prioridade.

### 7.5 Administração
- Gerenciar cardápio, categorias, modifiers, preços e horários (horário de funcionamento por dia).
- Visualizar pedidos em tempo real e histórico.
- Relatórios: vendas por período, itens mais vendidos, tickets médios.
- Configurações de impostos e taxas.
- Usuários e permissões (Administrador, Caixa, Cozinha).

### 7.6 Estoque
- Controle básico de estoque por ingrediente (consumo por item configurável).
- Sinalização de estoque baixo e bloqueio automático de itens quando falta ingrediente.

### 7.7 Relatórios e Financeiro
- Relatório diário, semanal e mensal de vendas.
- Conciliação de pagamentos (pagamentos online vs pedidos entregues).
- Exportação CSV/XLSX de vendas.

### 7.8 Segurança e Privacidade
- HTTPS obrigatório.
- Proteção contra CSRF e XSS nas interfaces administrativas.
- Armazenamento seguro de dados sensíveis (tokens de pagamento não guardar raw card data).
- Logs de auditoria para ações críticas no admin.

---

## 8. Requisitos Não Funcionais

- **Performance:** página inicial carregando menu em ≤ 1.5s em conexões móveis médias.
- **Escalabilidade:** suportar picos (ex.: 100 pedidos simultâneos no pico) — arquitetar com backend stateless e filas para processamento.
- **Disponibilidade:** 99.5% para operações criticas (recebimento de pedidos).
- **Segurança:** HTTPS, CSP, validação de inputs, armazenamento seguro de tokens.
- **Acessibilidade:** compatível com WCAG básico (contrastes, labels, navegação por teclado).

---

## 9. Arquitetura Recomendada (alta-nível)

- **Frontend:** React (SPA) ou PWA (Progressive Web App) para permitir funcionamento offline básico e instalação no celular.
- **Backend:** Node.js + Express / NestJS ou Python (FastAPI) — API REST (ou GraphQL opcional).
- **Banco de Dados:** PostgreSQL (relacional) para pedidos e catálogo; Redis para cache e filas leves.
- **Filas/Worker:** RabbitMQ / BullMQ (Redis) para jobs assíncronos (envio de notificações, conciliação de pagamento).
- **Armazenamento de imagens:** S3 (ou equivalente) para imagens de itens.
- **KDS:** aplicação web separada (ou rota no admin) que consome websockets para atualizações em tempo real.
- **Pagamentos:** integração com gateway (Stripe/Pagar.me/PagSeguro) + Pix (webhook para conciliação).
- **Hospedagem:** Docker + Kubernetes/Cloud Run ou VPS simples para MVP.

---

## 10. Modelo de Dados (principais tabelas)

> Tipos e campos sugeridos. Ajustar nomes conforme convenção do time.

### tabela: `categorias`
- id (uuid)
- nome (string)
- descricao (text)
- ordem (int)
- ativo (boolean)

### tabela: `itens`
- id (uuid)
- nome (string)
- descricao (text)
- preco_base (decimal)
- tempo_preparo_min (int)
- imagem_url (string)
- categoria_id (uuid)
- ativo (boolean)

### tabela: `variacoes`
- id (uuid)
- item_id (uuid)
- nome (string) (ex: Pequeno, Medio, Grande)
- preco (decimal)

### tabela: `modificadores` (grupos de opções)
- id (uuid)
- nome (string)
- tipo (enum: single/multiple)
- max_selections (int)
- selecionamento_gratis_qtd (int)

### tabela: `opcoes_modificador`
- id (uuid)
- modificador_id (uuid)
- nome (string)
- preco (decimal)

### tabela: `pedidos`
- id (uuid)
- numero (int) — seq por estabelecimento
- status (enum)
- cliente_nome (string)
- cliente_telefone (string)
- endereco (json)
- tipo_entrega (enum: retirada, entrega, local)
- subtotal (decimal)
- taxa_entrega (decimal)
- desconto (decimal)
- total (decimal)
- pagamento_status (enum)
- created_at, updated_at

### tabela: `pedido_itens`
- id (uuid)
- pedido_id (uuid)
- item_id (uuid)
- nome (string)
- preco_unitario (decimal)
- quantidade (int)
- observacao (text)

### tabela: `pedido_item_opcoes`
- id (uuid)
- pedido_item_id (uuid)
- opcao_modificador_id (uuid)
- nome (string)
- preco (decimal)

### tabela: `estoque_ingredientes`
- id (uuid)
- nome (string)
- quantidade_atual (decimal)
- unidade (string)
- ponto_alarme (decimal)

### tabela: `consumo_por_item`
- id (uuid)
- item_id (uuid)
- ingrediente_id (uuid)
- quantidade (decimal)

---

## 11. APIs Principais (exemplos REST)

> Base: `https://api.sualoja.com/v1`

### Autenticação
- `POST /v1/auth/login` — recebe email/senha, retorna JWT.

### Menu
- `GET /v1/categorias` — lista categorias com itens.
- `GET /v1/itens/:id` — detalhes do item (inclui modificadores/variações).
- `POST /v1/admin/itens` — criar item (admin).

### Carrinho / Checkout
- `POST /v1/pedidos` — criar pedido. Payload inclui cliente, itens, opções, pagamento desejado.
  - Exemplo payload reduzido:
```
{
  "cliente": {"nome":"João","telefone":"+55..."},
  "tipo_entrega":"retirada",
  "itens":[{"item_id":"uuid","quantidade":1,"variacao_id":null,"opcoes":[{"opcao_id":"uuid"}], "observacao":"sem cebola"}],
  "pagamento": {"metodo":"pix"}
}
```

- `GET /v1/pedidos/:id` — status do pedido.

### Admin / Pedidos
- `GET /v1/admin/pedidos?status=recebido` — lista pedidos em fila.
- `PATCH /v1/admin/pedidos/:id/status` — atualizar status (ex: para `em_preparo`).

### Pagamentos
- `POST /v1/pagamentos/create` — cria transação no gateway, retorna link.
- Webhook: `POST /v1/webhooks/pagamentos` — gateway notifica pagamento confirmado.

### Relatórios
- `GET /v1/admin/relatorios/vendas?from=YYYY-MM-DD&to=YYYY-MM-DD`

---

## 12. Fluxos de Tela (UX) — Telas principais

1. **Landing / QR Scan** — página simples com nome da loja, horário, botão "Abrir cardápio" e QR code para mesas.
2. **Cardápio (categoria > itens)** — grid/lista de itens com foto, preço, botão "Personalizar".
3. **Modal de Personalização** — escolha variação, marcadores de modificadores, aviso de custo adicional, campo observação.
4. **Carrinho** — resumo, possibilidade de alterar quantidade, aplicar cupom.
5. **Checkout** — dados do cliente (nome, telefone), endereço (se entrega), escolha de pagamento, resumo final.
6. **Confirmação** — número do pedido, tempo estimado, botão para acompanhar status.
7. **Admin — Dashboard de Pedidos** — lista de pedidos em tempo real, filtros, ações (aceitar, preparar, marcar pronto).
8. **Admin — Gerenciamento de Menu** — CRUD para categorias, itens e modificadores.
9. **KDS (cozinha)** — tela limpa com pedidos empilhados, tempo estimado, botões para marcar pronto.

---

## 13. Regras de Negócio importantes

- Itens devem ter estoque derivado de ingredientes; venda decrementa estoque.
- Modificadores cobrados afetam o total do item.
- Horários de funcionamento bloqueiam criação de pedidos (ou aceitam apenas agendamento).
- Pagamentos online confirmados liberam automaticamente o pedido; para pagamento no local, status inicial `aguardando_pagamento` e só ir para entrega/rotas depois de confirmado manualmente.

---

## 14. Notificações

- **Cliente:** SMS/Whatsapp (opcional via integração), email (opcional), e notificações via web (se PWA) sobre status.
- **Loja/Admin:** som/alerta no painel de pedidos; envio de e-mail diário com resumo.
- **Webhook:** para integrar com serviços de pagamento e entrega.

---

## 15. Integrações sugeridas

- **Payments:** Stripe, Pagar.me, Gerencianet, ou gateways locais (aceitar Pix é prioridade no Brasil).
- **SMS/WhatsApp:** Twilio, Zenvia, or APIs brasileiras.
- **Delivery/Logística:** APIs para conciliação (se necessário).
- **Analytics:** Google Analytics / Mixpanel para monitorar conversões.

---

## 16. Segurança & Conformidade

- Não armazenar dados de cartão (usar tokenização do gateway).
- GDPR/LGPD: coleta mínima de dados; política de privacidade clara; possibilidade de exclusão de dados do cliente.
- Backups diários do banco.

---

## 17. Testes e QA

- Testes unitários para regras de preço e cálculo.
- Testes de integração para checkout/pagamento (ambiente sandbox do gateway).
- Testes de carga para validar picos de pedidos.
- Testes manuais de UX em dispositivos móveis de diferentes tamanhos.

---

## 18. Métricas e KPIs

- Número de pedidos por dia
- Ticket médio
- Taxa de conversão (visitantes → pedido)
- Tempo médio de preparo
- Erro de pedido (reclamações)

---

## 19. Roadmap e Sprints (Exemplo de 4 sprints de 2 semanas)

**Sprint 1 — MVP básico**
- Tela de cardápio, seleção de item, carrinho, checkout básico (pagar no local), API de pedidos, painel simples.
- Entregável: aceitar pedidos via web e visualizar no admin.

**Sprint 2 — Pagamentos e notificações**
- Integração Pix (gerar link), webhook de confirmação, notificação cliente, números de pedido.
- Entregável: pedidos com pagamento online funcionando.

**Sprint 3 — Estoque e KDS**
- Controle de ingredientes/estoque, KDS básico com updates em tempo real.
- Entregável: itens bloqueiam quando sem estoque, pedidos chegam na cozinha.

**Sprint 4 — Relatórios e otimizações**
- Relatórios, exportação, melhorias de UX, otimização de performance.

---

## 20. Critérios de Aceitação (exemplos)

- Cliente consegue completar pedido personalizado com no máximo 5 passos.
- Pedido criado no sistema aparece no painel admin em <2s.
- Pagamentos Pix confirmados atualizam status automaticamente.
- Quando estoque de ingrediente chega a 0, item associado fica indisponível.

---

## 21. Plano de Deploy e Operação

- Pipeline CI/CD (GitHub Actions / GitLab CI) com builds automáticos.
- Deploy em container (Docker) para facilitar escalabilidade.
- Monitoramento: Sentry (erros), Prometheus/Grafana (metricas), alertas por e-mail/Slack.

---

## 22. Estimativa de esforço (alto nível)

- MVP (sprint 1+2): 6–8 semanas com 2 devs (frontend + backend) + 1 QA (estimativa média)
- Integrações + estoque + KDS: +4–6 semanas

---

## 23. Exemplo de SQL DDL (Postgres) — principais tabelas

```sql
CREATE TABLE categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(200) NOT NULL,
  descricao text,
  ordem int DEFAULT 0,
  ativo boolean DEFAULT true
);

CREATE TABLE itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  descricao text,
  preco_base numeric(10,2) NOT NULL DEFAULT 0,
  tempo_preparo_min int,
  imagem_url text,
  categoria_id uuid REFERENCES categorias(id),
  ativo boolean DEFAULT true
);

CREATE TABLE pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero bigint NOT NULL,
  status varchar(50),
  cliente_nome varchar(255),
  cliente_telefone varchar(50),
  endereco jsonb,
  tipo_entrega varchar(50),
  subtotal numeric(10,2),
  taxa_entrega numeric(10,2),
  desconto numeric(10,2),
  total numeric(10,2),
  pagamento_status varchar(50),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 24. Checklist final para iniciar o projeto (passo-a-passo)

1. Definir MVP e prioridades (confirmar combinações e regras de modificadores).
2. Escolher stack (frontend PWA + backend REST + gateway Pix).
3. Modelar banco e criar DDL inicial.
4. Implementar APIs básicas e frontend do cardápio.
5. Integrar pagamentos em sandbox.
6. Testes de fluxo completos (end-to-end).
7. Deploy e monitoramento.

---

## 25. Próximos passos que eu posso fazer pra você agora

- Gerar DDL completo para todas as tabelas do modelo apresentado.
- Criar endpoints REST com exemplos (Node.js + Express) prontos pra usar.
- Montar protótipo de telas em HTML/CSS/React (PWA).
- Gerar versão resumida do documento para apresentação ao dono da lanchonete.

---

## 26. Anexos / Exemplos rápidos

- Exemplo de JSON de pedido (para integração):
```
{
  "numero": 1023,
  "cliente":{"nome":"João","telefone":"+55..."},
  "itens":[
    {"item_id":"uuid","nome":"X-Burger","quantidade":1,"preco_unitario":18.50,
     "opcoes":[{"nome":"Bacon","preco":2.50},{"nome":"Cheddar","preco":1.50}]
    }
  ],
  "subtotal":22.50,
  "taxa_entrega":5.00,
  "total":27.50
}
```

---

*Documento gerado automaticamente — adapte nomes de campos e regras para o seu fluxo de negócio.*

