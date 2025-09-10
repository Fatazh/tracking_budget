-- PostgreSQL Table Recreation Script
-- Run this in PostgreSQL to recreate all tables

-- Connect to the TrackBudgetDb database first
\c "TrackBudgetDb"

-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS monthly_balances CASCADE;

-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create monthly_balances table
CREATE TABLE monthly_balances (
    id VARCHAR(7) PRIMARY KEY, -- Format: YYYY-MM
    month VARCHAR(7) NOT NULL,
    initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_income DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_expense DECIMAL(10, 2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Insert initial balance record for current month
INSERT INTO monthly_balances (id, month, initial_balance, current_balance, total_income, total_expense)
VALUES (TO_CHAR(CURRENT_DATE, 'YYYY-MM'), TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 0, 0, 0, 0);

-- Verify tables were created
\dt

-- Show table structures
\d transactions
\d monthly_balances

-- Show current data
SELECT * FROM monthly_balances;

ECHO 'Tables recreated successfully!';