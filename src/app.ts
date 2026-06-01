import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOrigins } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import studentsRoutes from './modules/students/students.routes.js';
import topicsRoutes from './modules/topics/topics.routes.js';
import resultsRoutes from './modules/results/results.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
      credentials: true,
    }),
  );
  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api/topics', topicsRoutes);
  app.use('/api/results', resultsRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(errorHandler);

  return app;
}
