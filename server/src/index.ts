// ⚠️ CRITICAL: Load environment variables FIRST, before anything else!
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express from 'express';
import cors from 'cors';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';
import accountsRouter from './routes/accounts';
import budgetsRouter from './routes/budgets';
import { errorHandler } from './middleware/errorHandler';
import pool from './db'; // Import the DB pool (which will now have env vars)

const app = express();
const PORT = Number(process.env.PORT) || 8081;

// ============================================================================
// Middleware
// ============================================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// Health & Status Checks
// ============================================================================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/status', async (_req, res) => {
  try {
    const dbHealth = await pool.query('SELECT 1 as health');
    res.json({
      status: 'ok',
      database: dbHealth.rowCount === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// API Routes
// ============================================================================

app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/budgets', budgetsRouter);

// ============================================================================
// 404 Handler
// ============================================================================

app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// ============================================================================
// Global Error Handler (MUST be last)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// Server Startup
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      🚀 BudgetPlanner Server Ready     ║
╚════════════════════════════════════════╝

  Host:     http://localhost:${PORT}
  API:      http://localhost:${PORT}/api
  Health:   http://localhost:${PORT}/api/health
  Status:   http://localhost:${PORT}/api/status
  
  Environment: ${process.env.NODE_ENV || 'development'}
  CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
  Database:    ${process.env.DB_HOST || 'undefined'}
  
  Ready to accept requests! 📝
`);
});

// ============================================================================
// Graceful Shutdown
// ============================================================================

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    console.log('✅ Server closed');
    try {
      await pool.end();
      console.log('✅ Database pool closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing database:', error);
      process.exit(1);
    }
  });
});

export default app;