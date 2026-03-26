# 🐊 Calango Gateway - Documentação de Contexto

## 📌 Visão Geral
O **Calango Gateway** é um microsserviço de abstração de pagamentos multi-tenant e stateless. Ele serve como uma camada intermediária entre os produtos do ecossistema Calango (ex: Calango Food e Calango Bot) e os provedores de pagamento (Stripe, PagBank, Pix).

## 🚀 Arquitetura e Tech Stack
- **Runtime:** Node.js v20+ (ESM) para suporte nativo a Top-Level Await e módulos modernos.

- **Framework:** Express.js para roteamento leve e performático.

- **Padrões de Projeto:**

- **Strategy Pattern:** Isola a lógica de cada provedor (Stripe, PagBank) em classes intercambiáveis.

- **Factory Pattern:** Instancia dinamicamente o provedor correto baseado no method ou provider solicitado.

- **Adapter Pattern:** Traduz webhooks heterogêneos para o formato padrão "Calango Standard".

## 🛠️ Estruturas Principais
### 1. PaymentStrategy (Interface)
Define o contrato obrigatório para todos os provedores. Cada novo provedor deve implementar o método `process(amount, orderId, credentials)`.

## Dependências Core
- **stripe**: SDK oficial para integração segura com Stripe.

- **axios**: Para chamadas REST em provedores sem SDK oficial ou para notificações de callback.

- **dotenv**: Gestão de variáveis de ambiente do Gateway (ex: segredos de criptografia).

- **cors**: Configurado para aceitar requisições apenas de domínios internos do ecossistema Calango.

### 2. Multi-Tenancy
O gateway não armazena chaves de API. O projeto solicitante (Calango Food) deve enviar as credenciais criptografadas do restaurante no corpo da requisição. Isso permite que cada restaurante use sua própria conta no Stripe/PagBank.

## 📑 Fluxo de Pagamento
1. Client (Frontend) -> Calango Food (Backend).
2. Calango Food -> Calango Gateway (Porta 3010).
3. Calango Gateway -> Provedor (Stripe/PagBank).
4. Provedor -> Calango Gateway (Webhook).
5. Calango Gateway -> Calango Food (Notificação de Sucesso).

## 📡 Endpoints v1
- `POST /v1/payments/create`: Inicia uma transação.
- `POST /v1/payments/webhook/:provider`: Recebe confirmações de pagamento.

## ⚠️ Regras de Ouro para Evolução (Patterns)

### 1. Contrato de Interface (PaymentStrategy)
Qualquer novo provedor de pagamento **DEVE** herdar de `PaymentStrategy` e implementar o método `process()`. Se o método não for sobrescrito, o sistema lançará um erro crítico para evitar falhas em produção.

### 2. Formato de Retorno Padronizado
O retorno de qualquer estratégia deve seguir rigorosamente este esquema para que o `OrderController` do projeto principal não quebre:
- `success`: boolean
- `transactionId`: string (ID do provedor)
- `gateway`: string (nome do provedor)
- `status`: string (pending, paid, failed)

### 3. Stateless & Multi-Tenancy
O Gateway deve ser, preferencialmente, **Stateless**. Ele não deve buscar chaves de API no próprio banco de dados; ele as recebe do projeto chamador. Isso permite que o Gateway escale horizontalmente sem depender de sincronização de estado complexa.

### 4. Tratamento de Webhooks
O `WebhookAdapter` é o único lugar onde a tradução de dados brutos dos bancos deve ocorrer. Ele converte os diferentes formatos (Stripe usa centavos, PagBank usa campos aninhados) em um objeto "Calango Standard".


## 🚀 Estratégia de Disponibilidade

### 1. Distribuição do SDK (NPM)
- O SDK será versionado e publicado no registro NPM (público ou privado).
- Ele é uma dependência estática; não consome recursos de CPU até ser chamado pelo projeto principal.

### 2. Hospedagem da API (Runtime)
- A API do Gateway (porta 3010) deve ser hospedada em ambiente de Long-Running Process (SaaS/PaaS).
- O endereço de produção da API deve ser injetado no SDK via variáveis de ambiente (`process.env.GATEWAY_URL`) para que o SDK saiba para onde enviar os dados, independentemente de onde o código foi baixado.

## 🏠 Ambiente de Execução (Home Lab)

### 1. Hardware
- **Servidor:** Host local (PC Antigo) rodando Linux (Debian/Ubuntu).
- **Endpoint Local:** `http://<IP_LOCAL>:3010`.

### 2. Túnel de Exposição
- Para integração com serviços externos (Webhooks do Stripe/PagBank), utilizamos um túnel reverso (Cloudflare Tunnel ou similar).
- O tráfego externo bate no domínio público e é redirecionado para a porta 3010 do hardware local.

### 3. Persistência
- O gerenciamento do processo Node.js é feito via **PM2**.
- Logs de erro são armazenados localmente para auditoria de transações falhas.

## 🗄️ Camada de Persistência (MongoDB)

### 1. Database: `calango_gateway`
Diferente do banco do Calango Food, este banco foca exclusivamente em **Logs Transacionais**.

### 2. Coleção `Transactions`
- **Objetivo:** Registrar o histórico de todas as tentativas de pagamento.
- **Campos Mandatórios:** `tenantId`, `orderId`, `gateway`, `amount` e `status`.
- **Campo `rawResponse`:** É obrigatório salvar a resposta bruta do provedor para fins de suporte técnico e disputa de estornos (chargebacks).

### 3. Integridade de Dados
- Nenhuma transação deve ser excluída. Alterações de estado (ex: de `pending` para `paid`) devem ser registradas no array `webhookHistory` para manter a trilha de auditoria.

---
*Documento atualizado em: 26/03/2026*