import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import mongoose from 'mongoose';
import Transaction from '../../src/models/Transaction.js';

describe('PaymentController Integration Tests', () => {
  let savedTransactions = [];

  // Configura mocks do Mongoose antes de rodar os testes
  beforeAll(async () => {
    jest.spyOn(mongoose, 'connect').mockResolvedValue(true);
    jest.spyOn(mongoose.connection, 'close').mockResolvedValue(true);

    jest.spyOn(Transaction.prototype, 'save').mockImplementation(function () {
      const existingTxIndex = savedTransactions.findIndex(t => t.transactionId === this.transactionId && this.transactionId !== undefined);
      const txData = { 
        orderId: this.orderId, 
        amount: this.amount, 
        status: this.status,
        gateway: this.gateway,
        transactionId: this.transactionId,
        webhookHistory: this.webhookHistory || []
      };

      if (existingTxIndex !== -1) {
        savedTransactions[existingTxIndex] = txData;
      } else {
        savedTransactions.push(txData);
      }
      return Promise.resolve(this);
    });

    jest.spyOn(Transaction, 'findOne').mockImplementation((query) => {
      let found = null;
      if (query.transactionId) {
        found = savedTransactions.find(t => t.transactionId === query.transactionId);
      } else if (query.orderId) {
        found = savedTransactions.find(t => t.orderId === query.orderId);
      }

      if (found) {
        // Return a mocked mongoose document with save method
        return Promise.resolve({
          ...found,
          save: function() {
            const index = savedTransactions.findIndex(t => t.transactionId === this.transactionId);
            if (index !== -1) {
              savedTransactions[index] = { ...this };
            }
            return Promise.resolve(this);
          }
        });
      }
      return Promise.resolve(null);
    });

    jest.spyOn(Transaction, 'deleteMany').mockImplementation(() => {
      savedTransactions = [];
      return Promise.resolve();
    });
  });

  afterEach(async () => {
    savedTransactions = [];
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('Validações Gerais', () => {
    test('POST /v1/payments/create - Deve retornar 400 se faltarem campos obrigatórios', async () => {
      const response = await request(app)
        .post('/v1/payments/create')
        .send({ amount: 100 }); // Payload incompleto

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Campos obrigatórios');
    });
  });

  describe('Provider: PIX', () => {
    let createdTransactionId;

    test('POST /v1/payments/create - Cria transação PIX', async () => {
      const payload = {
        tenantId: 'rest_01',
        amount: 150.50,
        orderId: 'ORDER_PIX',
        method: 'pix',
        credentials: { test: true }
      };

      const response = await request(app).post('/v1/payments/create').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.gateway).toBe('pix');
      expect(response.body.transactionId).toMatch(/^PIX-TEST-/);

      const transactionInDb = await Transaction.findOne({ orderId: 'ORDER_PIX' });
      expect(transactionInDb.status).toBe('pending');
      createdTransactionId = transactionInDb.transactionId;
    });

    test('POST /v1/payments/webhook/pix - Processa webhook PIX com sucesso', async () => {
      // Mock inicial
      savedTransactions.push({
        transactionId: 'PIX-TEST-123',
        status: 'pending',
        amount: 150.50,
        webhookHistory: []
      });

      const webhookPayload = {
        txid: 'PIX-TEST-123',
        status: 'CONCLUIDO',
        valor: 150.50
      };

      const response = await request(app).post('/v1/payments/webhook/pix').send(webhookPayload);
      
      expect(response.status).toBe(200);

      const updatedTx = await Transaction.findOne({ transactionId: 'PIX-TEST-123' });
      expect(updatedTx.status).toBe('paid');
      expect(updatedTx.webhookHistory.length).toBe(1);
      expect(updatedTx.webhookHistory[0].status).toBe('paid');
    });
  });

  describe('Provider: Stripe', () => {
    let createdTransactionId;

    test('POST /v1/payments/create - Cria transação Stripe', async () => {
      const payload = {
        tenantId: 'rest_02',
        amount: 50.00,
        orderId: 'ORDER_STRIPE',
        method: 'stripe',
        credentials: { test: true }
      };

      const response = await request(app).post('/v1/payments/create').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.gateway).toBe('stripe');
      expect(response.body.transactionId).toMatch(/^STP-/);
    });

    test('POST /v1/payments/webhook/stripe - Processa webhook Stripe com sucesso', async () => {
      savedTransactions.push({
        transactionId: 'STP-999',
        status: 'pending',
        amount: 50.00,
        webhookHistory: []
      });

      const webhookPayload = {
        id: 'STP-999',
        type: 'payment_intent.succeeded',
        data: { object: { amount: 5000 } } // 50.00 reais em centavos
      };

      const response = await request(app).post('/v1/payments/webhook/stripe').send(webhookPayload);
      
      expect(response.status).toBe(200);

      const updatedTx = await Transaction.findOne({ transactionId: 'STP-999' });
      expect(updatedTx.status).toBe('paid');
    });
  });

  describe('Provider: PagBank', () => {
    let createdTransactionId;

    test('POST /v1/payments/create - Cria transação PagBank via método "card"', async () => {
      const payload = {
        tenantId: 'rest_03',
        amount: 80.00,
        orderId: 'ORDER_PAGBANK',
        method: 'card', // method 'card' maps to Pagbank natively
        credentials: { test: true }
      };

      const response = await request(app).post('/v1/payments/create').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.gateway).toBe('pagbank');
      expect(response.body.transactionId).toMatch(/^PGB-/);
    });

    test('POST /v1/payments/webhook/pagbank - Processa webhook PagBank com sucesso', async () => {
      savedTransactions.push({
        transactionId: 'PGB-777',
        status: 'pending',
        amount: 80.00,
        webhookHistory: []
      });

      const webhookPayload = {
        charges: [
          {
            id: 'PGB-777',
            status: 'PAID',
            amount: { value: 8000 }
          }
        ]
      };

      const response = await request(app).post('/v1/payments/webhook/pagbank').send(webhookPayload);
      
      expect(response.status).toBe(200);

      const updatedTx = await Transaction.findOne({ transactionId: 'PGB-777' });
      expect(updatedTx.status).toBe('paid');
    });
  });
});