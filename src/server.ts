import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { todoRouter } from './routes/todos.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Auth endpoints are rate limited separately since they're the most likely
// target for brute-force or credential-stuffing attempts.
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'premium-todo-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/todos', todoRouter);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

connectDatabase()
  .then(() => {
    app.listen(env.PORT, () => console.log(`✓ API running at http://localhost:${env.PORT}`));
  })
  .catch((error) => {
    console.error('✗ MongoDB connection failed');
    console.error(error);
    process.exit(1);
  });
