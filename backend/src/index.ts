import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import organizationsRoutes from './routes/organizations';
import subscriptionsRoutes from './routes/subscriptions';
import attackSurfaceRoutes from './routes/attackSurface';
import logIntelligenceRoutes from './routes/logIntelligence';
import cloudMonitorRoutes from './routes/cloudMonitor';
import pentestRoutes from './routes/pentest';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/attack-surface', attackSurfaceRoutes);
app.use('/api/logs', logIntelligenceRoutes);
app.use('/api/cloud', cloudMonitorRoutes);
app.use('/api/pentest', pentestRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
async function start() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('Database connected');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

