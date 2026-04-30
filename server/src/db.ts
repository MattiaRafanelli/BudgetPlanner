import { Pool, QueryResult, PoolClient } from 'pg';

// ============================================================================
// PostgreSQL Connection Pool für Azure Database
// ============================================================================

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // ⚠️ WICHTIG für Azure!
  },
  // Connection Pool Settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Erhöht für Netzwerk-Latenzen
  statement_timeout: 30000, // Query Timeout
  query_timeout: 30000,
});

// ============================================================================
// Pool Event Listeners
// ============================================================================

pool.on('connect', (client: PoolClient) => {
  console.log('✅ [DB] New connection established');
});

pool.on('error', (err: Error, client: PoolClient) => {
  console.error('❌ [DB] Unexpected error on client:', err.message);
  console.error('   Stack:', err.stack);
  process.exit(-1); // Force restart bei kritischen Fehlern
});

pool.on('remove', () => {
  console.log('⚠️  [DB] Connection removed from pool');
});

// ============================================================================
// Connection Test on Startup
// ============================================================================

(async () => {
  try {
    console.log('\n🔄 [STARTUP] Testing PostgreSQL connection...');
    console.log(`   Host:     ${process.env.DB_HOST}`);
    console.log(`   Port:     ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User:     ${process.env.DB_USER}`);
    console.log(`   SSL:      Yes (rejectUnauthorized: false)`);
    console.log('');
    
    const client = await pool.connect();
    
    // Test basic query
    const result = await client.query('SELECT NOW() as now, version() as version');
    const { now, version } = result.rows[0];
    
    console.log('✅ [DB] Connection successful!');
    console.log(`   Server time: ${now}`);
    console.log(`   Version:     ${version.split(',')[0]}`);
    console.log('');
    
    client.release();
  } catch (error: any) {
    console.error('❌ [STARTUP] PostgreSQL connection FAILED!');
    console.error(`   Error:    ${error.message}`);
    console.error(`   Code:     ${error.code}`);
    console.error(`   Severity: ${error.severity}`);
    console.error('');
    console.error('   Troubleshooting checklist:');
    console.error('   ✓ Azure PostgreSQL server is running (Status: Ready)');
    console.error('   ✓ Firewall rules allow your IP (Networking → Firewall rules)');
    console.error('   ✓ SSL enforced (You have: rejectUnauthorized: false)');
    console.error('   ✓ Database credentials in .env are correct');
    console.error('   ✓ Database "budgetplanner" exists');
    console.error('   ✓ Network connectivity (ping, nslookup)');
    console.error('');
    console.error('   Common codes:');
    console.error('   ECONNREFUSED → Server not responding');
    console.error('   ENOTFOUND   → DNS resolution failed');
    console.error('   28000       → Auth failed (wrong password)');
    console.error('   3D000       → Database doesn\'t exist');
    console.error('');
    
    // Nicht crashen, aber warnen
    console.warn('⚠️  [WARNING] Continuing without DB connection...');
  }
})();

// ============================================================================
// Query Helper Functions
// ============================================================================

/**
 * Execute any SQL query with logging
 */
export const query = async (
  text: string,
  params?: any[]
): Promise<QueryResult> => {
  const start = Date.now();
  const queryPreview = text.substring(0, 50).replace(/\n/g, ' ');
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️  [DB] Slow query (${duration}ms): ${queryPreview}...`);
    } else {
      console.log(`✓ [DB] Query (${duration}ms): ${queryPreview}...`);
    }
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`❌ [DB] Query failed (${duration}ms): ${queryPreview}...`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code:  ${error.code}`);
    console.error(`   SQL:   ${text.substring(0, 150)}`);
    console.error(`   Params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Get single row (returns first row or null)
 */
export const getOne = async (
  text: string,
  params?: any[]
): Promise<any | null> => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

/**
 * Get multiple rows (returns array)
 */
export const getAll = async (
  text: string,
  params?: any[]
): Promise<any[]> => {
  const result = await query(text, params);
  return result.rows;
};

/**
 * Execute INSERT, UPDATE, DELETE (returns affected row count)
 */
export const execute = async (
  text: string,
  params?: any[]
): Promise<number> => {
  const result = await query(text, params);
  return result.rowCount || 0;
};

/**
 * Transaction support
 */
export const transaction = async (
  callback: (client: PoolClient) => Promise<any>
): Promise<any> => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('✓ [DB] Transaction started');
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    console.log('✓ [DB] Transaction committed');
    
    return result;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ [DB] Transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Health check - verify database is accessible
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rowCount === 1;
  } catch (error) {
    console.error('❌ [DB] Health check failed:', error);
    return false;
  }
};

/**
 * Get database stats and connection info
 */
export const getStats = async (): Promise<any> => {
  try {
    const result = await query(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity) as active_connections,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
        (SELECT sum(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public') as tables_size,
        (SELECT pg_database_size(current_database())) as database_size,
        version() as postgres_version
    `);
    
    const stats = result.rows[0];
    return {
      ...stats,
      database_size_mb: Math.round(stats.database_size / 1024 / 1024),
      tables_size_mb: Math.round((stats.tables_size || 0) / 1024 / 1024),
    };
  } catch (error) {
    console.error('❌ [DB] Failed to get database stats:', error);
    return null;
  }
};

/**
 * Close connection pool gracefully
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✅ [DB] Connection pool closed');
  } catch (error) {
    console.error('❌ [DB] Error closing pool:', error);
  }
};

export default pool;