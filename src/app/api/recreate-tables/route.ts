import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/postgres';

export async function POST() {
  const client = await getDbClient();
  
  try {
    console.log('Starting table recreation...');
    
    // Drop existing tables if they exist (in correct order due to dependencies)
    await client.query('DROP TABLE IF EXISTS transactions CASCADE');
    await client.query('DROP TABLE IF EXISTS monthly_balances CASCADE');
    
    console.log('Dropped existing tables');
    
    // Create transactions table
    await client.query(`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Created transactions table');

    // Create monthly_balances table
    await client.query(`
      CREATE TABLE monthly_balances (
        id VARCHAR(7) PRIMARY KEY, -- Format: YYYY-MM
        month VARCHAR(7) NOT NULL,
        initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_income DECIMAL(10, 2) NOT NULL DEFAULT 0,
        total_expense DECIMAL(10, 2) NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Created monthly_balances table');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    `);
    
    console.log('Created indexes');
    
    // Insert sample data for current month if needed
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    await client.query(`
      INSERT INTO monthly_balances (id, month, initial_balance, current_balance, total_income, total_expense)
      VALUES ($1, $2, 0, 0, 0, 0)
      ON CONFLICT (id) DO NOTHING
    `, [currentMonth, currentMonth]);
    
    console.log('Tables recreated successfully with sample data');
    
    return NextResponse.json({ 
      message: 'Database tables recreated successfully',
      tables_created: ['transactions', 'monthly_balances'],
      indexes_created: ['idx_transactions_date', 'idx_transactions_type'],
      sample_data: `Initial balance record for ${currentMonth}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error recreating tables:', error);
    
    let message = 'Failed to recreate database tables';
    let statusCode = 500;
    
    if (error.code === '28P01') {
      message = 'Database authentication failed. Please check your database credentials.';
      statusCode = 503;
    } else if (error.code === '3D000') {
      message = 'Database not found. Please create the TrackBudgetDb database first.';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      message = 'Cannot connect to PostgreSQL. Please ensure PostgreSQL is running.';
      statusCode = 503;
    }
    
    return NextResponse.json(
      { 
        error: message, 
        code: error.code,
        detail: error.message,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  } finally {
    client.release();
  }
}