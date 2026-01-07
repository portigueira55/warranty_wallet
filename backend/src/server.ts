import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import warrantyRoutes from './routes/warranty.routes';
import notificationRoutes from './routes/notification.routes';
import transferRoutes from './routes/transfer.routes';
import { errorHandler } from './middleware/errorHandler';
import { startNotificationScheduler } from './services/notification.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transfer', transferRoutes);

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Warranty Wallet API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      warranties: '/api/warranties',
      notifications: '/api/notifications',
      transfer: '/api/transfer',
    }
  });
});

// Serve PWA frontend (React app)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Handle client-side routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(errorHandler);

initDatabase().then(() => {
  startNotificationScheduler();
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin`);
  });
});

export default app;
