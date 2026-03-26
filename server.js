import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './src/routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = 3010;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/v1/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`🐊 Calango Gateway rodando na porta ${PORT}`);
});