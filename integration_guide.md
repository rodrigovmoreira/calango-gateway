# Guia de Integração - Teste de $0,01 (Sandbox)

A partir do ponto de vista do **desenvolvedor do Calango Food**, aqui está o passo a passo para testar a comunicação com o Gateway:

### 1. Dados que o Desenvolvedor do Calango Food Precisa
Ele precisará conhecer:
- **A URL base do Gateway:** Que será `http://localhost:3010` (no seu ambiente local/homelab).
- **A Rota de Criação de Pagamentos:** `POST /v1/payments/create`

### 2. Enviando a Requisição (Exemplo Node.js/Axios no Calango Food)
Para simular um pagamento PIX de 0,01 centavo, o dev do Calango Food deve executar o seguinte no fluxo de checkout (após o pedido ser fechado):

```javascript
const response = await axios.post('http://localhost:3010/v1/payments/create', {
  tenantId: "REST_123",            // ID do seu restaurante
  orderId: "PEDIDO_999",           // O ID gerado na sua base do Food
  amount: 0.01,                    // O valor em reais
  method: "pix",                   // O provedor a ser acionado (cairá na Factory)
  credentials: {
    test: true                     // Flag MÁGICA para o Gateway entender que é sandbox
  }
});

// A resposta será o retorno padrão
console.log(response.data);
```

### 3. O que o Calango Food vai receber de volta?
De acordo com o contrato [gemini.md](file:///home/rmoreira/Squamata-gateway/gemini.md), a promessa de retorno no caso do PIX sandbox será:

```json
{
  "success": true,
  "transactionId": "PIX-TEST-XXXXXX",
  "gateway": "pix",
  "status": "pending",
  "qrCode": "000201...",
  "copyPaste": "000201..."
}
```
O dev do Calango Food deve pegar o `qrCode` e o `copyPaste` para exibir na tela final do App para o usuário.

### 4. Preparação para o Webhook (Próximo Passo)
O dev também precisará criar uma rota `POST /api/webhooks/gateway` **LÁ NO CALANGO FOOD** para que o Gateway avise quando o Pix for realmente pago em produção (por agora, o sandbox devolve `pending`).
