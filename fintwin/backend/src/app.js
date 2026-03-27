import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

import profileRouter from './routes/profile.js';
import simulateRouter from './routes/simulate.js';
import portfolioRouter from './routes/portfolio.js';
import rebalanceRouter from './routes/rebalance.js';
import projectRouter from './routes/project.js';
import insightRouter from './routes/insight.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/profile', profileRouter);
app.use('/api/simulate', simulateRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/rebalance', rebalanceRouter);
app.use('/api/project', projectRouter);
app.use('/api/insight', insightRouter);

app.use(errorHandler);

export default app;
