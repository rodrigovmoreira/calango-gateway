import { Router } from 'express';
import PaymentController from '../controllers/PaymentController.js';

const router = Router();

// Rota principal para criar pagamentos
router.post('/create', PaymentController.create);

// Rota para receber Webhooks (Stripe, PagBank, etc)
router.post('/webhook/:provider', PaymentController.handleWebhook);

export default router;