Squamata-gateway/
├── src/
│   ├── config/
│   │   └── db.js                # Configuração de conexão com o MongoDB
│   ├── controllers/
│   │   └── PaymentController.js  # Orquestração das requisições de pagamento
│   ├── models/
│   │   └── Transaction.js       # Schema da coleção 'transactions'
│   ├── providers/               # Implementação do Strategy Pattern
│   │   ├── PaymentStrategy.js   # Interface base (contrato)
│   │   ├── StripeStrategy.js    # Estratégia específica para Stripe
│   │   ├── PagBankStrategy.js   # Estratégia específica para PagBank
│   │   └── PixStrategy.js       # Estratégia específica para PIX
│   ├── routes/
│   │   └── paymentRoutes.js     # Definição dos endpoints da API
│   ├── services/
│   │   ├── PaymentFactory.js    # Fábrica que instancia o provedor correto
│   │   └── WebhookAdapter.js    # Tradutor de notificações dos bancos
│   └── app.js                   # Configuração do Express e Middlewares
├── tests/                       # Estrutura de testes automatizados
│   ├── integration/             # Testes de fluxo completo com o Banco
│   ├── unit/                    # Testes de lógica isolada (Factory/Strategies)
│   └── mocks/                   # Dados simulados para evitar chamadas reais
├── .env                         # Variáveis de ambiente (Porta, MongoDB URI)
├── gemini.md                    # Documentação de contexto para Agentes de IA
├── package.json                 # Dependências e scripts do projeto
├── readme.md                    # Documentação principal do projeto
└── server.js                    # Ponto de entrada (Bootstrap do sistema)