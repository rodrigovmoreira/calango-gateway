import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './src/routes/paymentRoutes.js';
// import './src/config/db.js'; // Descomente após criar o arquivo de conexão

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o servidor Express
const app = express();
const PORT = process.env.PORT || 3010;

// Middlewares
app.use(cors());
app.use(express.json());

// Determina a rota inicial do Gateway
app.use('/v1/payments', paymentRoutes);

// Rota de Health Check (Para saber se o PC velho está vivo)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    service: 'calango-gateway'
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🐊 Calango Gateway rodando na porta ${PORT}`);
});