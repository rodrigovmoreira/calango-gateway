import express from 'express';
import cors from 'cors';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/v1/payments', paymentRoutes);

// Health Check para monitorar o status da aplicação
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

export default app;