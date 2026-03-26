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
      savedTransactions.push({ 
        orderId: this.orderId, 
        amount: this.amount, 
        status: this.status,
        gateway: this.gateway,
        transactionId: this.transactionId
      });
      return Promise.resolve(this);
    });

    jest.spyOn(Transaction, 'findOne').mockImplementation((query) => {
      const found = savedTransactions.find(t => t.orderId === query.orderId);
      return Promise.resolve(found || null);
    });

    jest.spyOn(Transaction, 'deleteMany').mockImplementation(() => {
      savedTransactions = [];
      return Promise.resolve();
    });
  });

  // Limpa a coleção de transações após cada teste
  afterEach(async () => {
    savedTransactions = [];
  });

  // Fecha a conexão após todos os testes e restaura os mocks
  afterAll(async () => {
    jest.restoreAllMocks();
  });

  test('POST /v1/payments/create - Deve criar uma transação no banco e retornar 201', async () => {
    const payload = {
      tenantId: 'restaurante_01',
      amount: 150.50,
      orderId: 'ORDER_999',
      method: 'pix',
      credentials: { apiKey: 'fake_key', test: true }
    };

    const response = await request(app)
      .post('/v1/payments/create')
      .send(payload);

    // Verificações da Resposta HTTP
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.gateway).toBe('pix');
    expect(response.body.transactionId).toMatch(/^PIX-TEST-/); // PIX-TEST-* because test: true

    // Verificação no MongoDB Local
    const transactionInDb = await Transaction.findOne({ orderId: 'ORDER_999' });
    expect(transactionInDb).not.toBeNull();
    expect(transactionInDb.amount).toBe(150.50);
    expect(transactionInDb.status).toBe('pending');
  });


  test('POST /v1/payments/create - Deve retornar 400 se faltarem campos obrigatórios', async () => {
    const response = await request(app)
      .post('/v1/payments/create')
      .send({ amount: 100 }); // Payload incompleto

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Campos obrigatórios');
  });
});