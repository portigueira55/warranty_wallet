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

app.use('/admin', express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transfer', transferRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Warranty Wallet API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      warranties: '/api/warranties',
      notifications: '/api/notifications',
      transfer: '/api/transfer',
      admin: '/admin'
    }
  });
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
