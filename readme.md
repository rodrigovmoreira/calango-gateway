# 🐊 Calango Gateway

O **Calango Gateway** é um microsserviço de abstração financeira de alto desempenho, projetado para centralizar e padronizar integrações com múltiplos provedores de pagamento (Stripe, PagBank, Pix, etc.) para todo o ecossistema de produtos Calango.

## 🚀 O Problema que Resolvemos
Em vez de cada projeto (Calango Food, Calango Shop, etc.) implementar sua própria lógica de pagamento e lidar com APIs complexas de terceiros, eles apenas "plugam" o Calango Gateway. Isso garante:
- **Código Limpo:** O projeto principal não conhece as regras de negócio do Stripe ou PagBank.
- **Agilidade Multi-Tenant:** Cada restaurante/cliente usa suas próprias chaves de API sem que precisemos alterar o código core.
- **Manutenção Centralizada:** Uma correção no Gateway atualiza todos os aplicativos conectados.

## 🛠️ Arquitetura Técnica
A plataforma utiliza o **Strategy Pattern** para garantir que todos os provedores falem a mesma língua.

### Fluxo de Operação:
1. **Requisição:** O App solicitante envia o valor, o método e as **credenciais do lojista**.
2. **Fábrica (Factory):** O Gateway identifica o provedor e instancia a classe correta.
3. **Processamento:** A estratégia executa a chamada para a API externa (ex: Stripe).
4. **Padronização:** O Gateway retorna um JSON padronizado, independente de qual banco processou a venda.

## 📁 Estrutura do Projeto
- `src/providers/`: Onde a "mágica" acontece. Cada arquivo é uma integração específica.
- `src/services/PaymentFactory.js`: O tomador de decisão que escolhe o provedor em tempo de execução.
- `src/controllers/`: Gerencia o fluxo de entrada e saída da API.
- `src/routes/`: Endpoints versionados (`/v1/...`).

## ⚙️ Como Executar
1. Instale as dependências: `npm install`
2. Configure o seu `.env` com as chaves mestras (se houver).
3. Inicie o servidor: `npm run dev` (Porta padrão: 3010).

---
*Desenvolvido com ☕ e foco em escalabilidade pela equipe Calango.*