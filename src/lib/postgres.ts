import { Pool, PoolClient } from 'pg';

// NeonDB PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for NeonDB
  },
  max: 10, // reduce maximum number of clients in the pool
  idleTimeoutMillis: 30000, // increase for cloud database
  connectionTimeoutMillis: 10000, // increase for cloud database
});

// Database connection helper
export const getDbClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

// Initialize database tables
export const initializeDatabase = async () => {
  const client = await getDbClient();
  
  try {
    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create monthly_balances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS monthly_balances (
        id VARCHAR(7) PRIMARY KEY, -- Format: YYYY-MM
        month VARCHAR(7) NOT NULL,
        initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_income DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_expense DECIMAL(10, 2) NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Close the pool
export const closeDatabase = async () => {
  await pool.end();
};

export default pool;