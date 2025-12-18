import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Importar rutas
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import manufacturerRoutes from './routes/manufacturer';
import adminRoutes from './routes/admin';
import ocrRoutes from './routes/ocr';

const app: Application = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ocr', ocrRoutes);

// Manejadores de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces para Codespaces

app.listen(PORT, HOST, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║  Warranty Wallet API Server          ║
  ║  Running on port ${PORT}                ║
  ║  Environment: ${config.nodeEnv.padEnd(20)}║
  ║  Health: http://localhost:${PORT}/health ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
