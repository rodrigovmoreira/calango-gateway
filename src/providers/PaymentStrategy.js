/**
 * Interface Base para Estratégias de Pagamento.
 * Define o contrato que todos os gateways (Stripe, PagBank, Pix) devem seguir.
 */
export class PaymentStrategy {
  /**
   * Método obrigatório para processar um pagamento.
   * @param {number} amount - Valor total da transação.
   * @param {string} orderId - ID de referência do pedido no MongoDB.
   * @param {Object} credentials - Chaves de API enviadas pelo tenant.
   * @returns {Promise<{
   * success: boolean, 
   * transactionId: string, 
   * gateway: string, 
   * status: string, 
   * qrCode?: string,
   * copyPaste?: string
   * }>} Retorno padronizado.
   */
  async process(amount, orderId, credentials) {
    // LUTA ATIVA contra implementações incompletas:
    throw new Error(
      `Erro Crítico: O método process() não foi implementado na estratégia para o pedido ${orderId}.`
    );
  }
}