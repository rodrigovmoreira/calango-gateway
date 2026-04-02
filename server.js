
import app from './src/app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Recriando o __dirname e __filename para o ambiente ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Define a porta do servidor
const PORT = process.env.PORT || 3010;

// Inicializa o banco de dados antes de subir o servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    showBanner();
    console.log(`\x1b[36m%s\x1b[0m`, `🐊 Calango Gateway [ON]`);
    console.log(`🚀 Porta: ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
  });
});

function showBanner() {
  try {
    const banner = fs.readFileSync(path.join(__dirname, 'banner.txt'), 'utf8');
    // Divide o banner em linhas e pinta cada uma de verde
    const lines = banner.split('\n');
    lines.forEach(line => {
      console.log('\x1b[92m%s\x1b[0m', line);
    });

    console.log('\x1b[32m%s\x1b[0m', '      Calango Gateway Online!\n');
  } catch (err) {
    console.log('Calango Gateway Starting...');
  }
}