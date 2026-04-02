import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import transactionsRouter from './routes/transactions';
import categoriesRouter  from './routes/categories';
import accountsRouter    from './routes/accounts';
import budgetsRouter     from './routes/budgets';
import { errorHandler }  from './middleware/errorHandler';

dotenv.config();

const app  = express();
const PORT = Number(process.env.PORT) || 8080;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories',   categoriesRouter);
app.use('/api/accounts',     accountsRouter);
app.use('/api/budgets',      budgetsRouter);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
