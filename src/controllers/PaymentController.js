import { PaymentFactory } from '../services/PaymentFactory.js';
import Transaction from '../models/Transaction.js';

class PaymentController {
  /**
   * Cria uma intenção de pagamento (Pix, Cartão, etc)
   */
  async create(req, res) {
    try {
      const { tenantId, amount, orderId, method, credentials } = req.body;

      if (!tenantId || !amount || !orderId || !method) {
        return res.status(400).json({ 
          error: "Campos obrigatórios: tenantId, amount, orderId, method." 
        });
      }

      // 1. Instancia a estratégia correta (Stripe, PagBank, Pix)
      const strategy = PaymentFactory.create(method);

      // 1.5. Registra a transação no banco como pending
      const transaction = new Transaction({
        tenantId,
        orderId,
        amount,
        gateway: method,
        status: 'pending'
      });
      await transaction.save();

      // 2. Processa o pagamento usando as credenciais específicas do restaurante (Tenant)
      // Passamos as credentials para que o Gateway seja "stateless" (não precise de DB próprio agora)
      const result = await strategy.process(amount, orderId, credentials);

      if (!result.success) {
        transaction.status = 'failed';
        transaction.rawResponse = result.error || result;
        await transaction.save();
        return res.status(402).json(result);
      }

      // Atualiza a transação com ID do gateway e os detalhes
      transaction.transactionId = result.transactionId;
      transaction.status = result.status || 'pending';
      transaction.rawResponse = result;
      await transaction.save();

      return res.status(201).json(result);

    } catch (error) {
      console.error(`❌ [Calango Gateway] Erro no processamento:`, error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Recebe notificações de confirmação dos bancos
   */
  async handleWebhook(req, res) {
    const { provider } = req.params;
    const payload = req.body;

    console.log(`📩 Webhook recebido do provedor: ${provider}`);
    
    // Aqui usaremos o WebhookAdapter que você já tem para padronizar a resposta
    // e depois notificar o Calango Food via axios.post
    
    return res.status(200).send('OK');
  }
}

export default new PaymentController();