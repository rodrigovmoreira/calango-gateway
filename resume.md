# 📖 Documentação Técnica: Squamata Gateway
Esta documentação detalha o papel de cada arquivo e diretório no ecossistema do Squamata Gateway, um microsserviço focado em abstrair a complexidade de múltiplos provedores de pagamento.

## 📂 Arquivos de Inicialização (Root)
server.js: O ponto de entrada (Bootstrap) do sistema. Ele é responsável por carregar as variáveis de ambiente, garantir que a conexão com o MongoDB seja estabelecida com sucesso e colocar o servidor para "escutar" na porta definida no .env.

.env: Armazena segredos e configurações variáveis, como a porta do servidor e a URI de conexão do MongoDB local.

gemini.md: Arquivo de contexto mestre para IAs. Contém as "Regras de Ouro", padrões de arquitetura e o histórico de decisões do projeto.

package.json: Gerencia as dependências (Stripe, Mongoose, Jest) e define os scripts de execução e testes (como o npm run test:watch).

## 📂 Pasta src/ (Núcleo da Aplicação)
### ⚙️ src/config/
db.js: Contém a lógica de conexão utilizando o Mongoose. Implementa o padrão Fail-Fast: se o banco local não subir, o servidor encerra o processo para evitar transações sem registro.

### 🧠 src/controllers/
PaymentController.js: O orquestrador. Ele recebe a requisição, valida os dados, solicita à Factory o provedor correto e gerencia a persistência inicial da transação no banco de dados.

### 🗄️ src/models/
Transaction.js: Define o Schema do MongoDB para a coleção transactions. É a "memória" do Gateway, guardando o status da venda, o tenantId e a resposta bruta do banco para auditoria.

### 🔌 src/providers/ (Camada de Estratégias)
Aqui aplicamos o Strategy Pattern. A ideia é que a lógica de negócio do Gateway nunca mude, apenas o "tradutor" para cada banco.

PaymentStrategy.js: A interface/contrato. Define que toda forma de pagamento deve obrigatoriamente ter o método process().

Estratégias (Stripe-, PagBank-, PixStrategy.js): Arquivos que contêm a implementação técnica específica de cada instituição financeira. Eles se comunicam com as APIs externas e retornam um formato padronizado para o sistema.

### 🛣️ src/routes/
paymentRoutes.js: Mapeia os endpoints da API (como /v1/payments/create) e os direciona para as funções correspondentes no Controller.

### 🛠️ src/services/
PaymentFactory.js: Implementa o Factory Pattern. É o responsável por ler o method da requisição e decidir qual classe da pasta providers deve ser instanciada.

WebhookAdapter.js: Tradutor universal. Ele pega os dados confusos que chegam dos bancos via Webhook e os transforma no formato "Calango Standard".

## 📂 Pasta tests/ (Qualidade e Segurança)
unit/: Testes focados em pequenas partes isoladas, como verificar se a Factory escolhe o provedor certo ou se o Adapter traduz os dados corretamente.

integration/: Testes que verificam o fluxo completo, desde a chamada da API até a gravação real no MongoDB local do seu PC velho.

mocks/: Arquivos de dados "fakes". Eles simulam a resposta do Stripe ou PagBank para que você possa testar o sistema sem internet e sem gastar dinheiro real.