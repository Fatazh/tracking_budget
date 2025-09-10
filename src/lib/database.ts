import { getDbClient } from '@/lib/postgres';
import { Transaction, MonthlyBalance, TransactionCategory } from '@/types';

// Transaction services
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  const client = await getDbClient();
  
  try {
    const result = await client.query(
      `INSERT INTO transactions (amount, type, description, category, date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [transaction.amount, transaction.type, transaction.description, transaction.category, transaction.date]
    );
    
    return result.rows[0].id.toString();
  } finally {
    client.release();
  }
};

export const getTransactions = async (month?: string): Promise<Transaction[]> => {
  const client = await getDbClient();
  
  try {
    let query = `
      SELECT id, amount, type, description, category, date, created_at 
      FROM transactions 
    `;
    const params: any[] = [];
    
    if (month) {
      query += ` WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`;
      const [year, monthNum] = month.split('-');
      params.push(parseInt(year), parseInt(monthNum));
    }
    
    query += ` ORDER BY date DESC, created_at DESC`;
    
    const result = await client.query(query, params);
    
    return result.rows.map(row => ({
      id: row.id.toString(),
      amount: parseFloat(row.amount),
      type: row.type,
      description: row.description,
      category: row.category,
      date: new Date(row.date),
      createdAt: new Date(row.created_at)
    }));
  } finally {
    client.release();
  }
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  const client = await getDbClient();
  
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.amount !== undefined) {
      fields.push(`amount = $${paramIndex++}`);
      values.push(updates.amount);
    }
    
    if (updates.type !== undefined) {
      fields.push(`type = $${paramIndex++}`);
      values.push(updates.type);
    }
    
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    
    if (updates.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    
    if (updates.date !== undefined) {
      fields.push(`date = $${paramIndex++}`);
      values.push(updates.date);
    }
    
    if (fields.length === 0) return;
    
    values.push(parseInt(id));
    
    const query = `
      UPDATE transactions 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
    `;
    
    await client.query(query, values);
  } finally {
    client.release();
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const client = await getDbClient();
  
  try {
    await client.query('DELETE FROM transactions WHERE id = $1', [parseInt(id)]);
  } finally {
    client.release();
  }
};

// Monthly balance services
export const getMonthlyBalance = async (month: string): Promise<MonthlyBalance | null> => {
  const client = await getDbClient();
  
  try {
    const result = await client.query(
      'SELECT * FROM monthly_balances WHERE id = $1',
      [month]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      month: row.month,
      initialBalance: parseFloat(row.initial_balance),
      currentBalance: parseFloat(row.current_balance),
      totalIncome: parseFloat(row.total_income),
      totalExpense: parseFloat(row.total_expense),
      lastUpdated: new Date(row.last_updated)
    };
  } finally {
    client.release();
  }
};

export const setMonthlyBalance = async (month: string, balance: Omit<MonthlyBalance, 'id' | 'lastUpdated'>): Promise<void> => {
  const client = await getDbClient();
  
  try {
    await client.query(
      `INSERT INTO monthly_balances (id, month, initial_balance, current_balance, total_income, total_expense) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) 
       DO UPDATE SET 
         initial_balance = EXCLUDED.initial_balance,
         current_balance = EXCLUDED.current_balance,
         total_income = EXCLUDED.total_income,
         total_expense = EXCLUDED.total_expense,
         last_updated = CURRENT_TIMESTAMP`,
      [month, balance.month, balance.initialBalance, balance.currentBalance, balance.totalIncome, balance.totalExpense]
    );
  } finally {
    client.release();
  }
};

export const updateMonthlyBalance = async (month: string, updates: Partial<MonthlyBalance>): Promise<void> => {
  const client = await getDbClient();
  
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (updates.initialBalance !== undefined) {
      fields.push(`initial_balance = $${paramIndex++}`);
      values.push(updates.initialBalance);
    }
    
    if (updates.currentBalance !== undefined) {
      fields.push(`current_balance = $${paramIndex++}`);
      values.push(updates.currentBalance);
    }
    
    if (updates.totalIncome !== undefined) {
      fields.push(`total_income = $${paramIndex++}`);
      values.push(updates.totalIncome);
    }
    
    if (updates.totalExpense !== undefined) {
      fields.push(`total_expense = $${paramIndex++}`);
      values.push(updates.totalExpense);
    }
    
    if (fields.length === 0) return;
    
    fields.push(`last_updated = CURRENT_TIMESTAMP`);
    values.push(month);
    
    const query = `
      UPDATE monthly_balances 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
    `;
    
    await client.query(query, values);
  } finally {
    client.release();
  }
};

// Category services
export const getCategories = async (): Promise<TransactionCategory[]> => {
  const client = await getDbClient();
  
  try {
    const result = await client.query(
      'SELECT id, name, type, icon FROM categories ORDER BY type, name'
    );
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as 'income' | 'expense',
      icon: row.icon
    }));
  } finally {
    client.release();
  }
};

export const addCategory = async (category: Omit<TransactionCategory, 'id'>): Promise<TransactionCategory> => {
  const client = await getDbClient();
  
  try {
    // Generate ID from name
    const id = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    const result = await client.query(
      'INSERT INTO categories (id, name, type, icon) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, category.name, category.type, category.icon || 'fas fa-question-circle']
    );
    
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      type: result.rows[0].type as 'income' | 'expense',
      icon: result.rows[0].icon
    };
  } finally {
    client.release();
  }
};

export const updateCategory = async (id: string, category: Omit<TransactionCategory, 'id'>): Promise<TransactionCategory> => {
  const client = await getDbClient();
  
  try {
    const result = await client.query(
      'UPDATE categories SET name = $1, type = $2, icon = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [category.name, category.type, category.icon || 'fas fa-question-circle', id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }
    
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      type: result.rows[0].type as 'income' | 'expense',
      icon: result.rows[0].icon
    };
  } finally {
    client.release();
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const client = await getDbClient();
  
  try {
    // Check if category is being used
    const usageCheck = await client.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category = $1',
      [id]
    );
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete category that is being used in transactions');
    }
    
    const result = await client.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }
  } finally {
    client.release();
  }
};

// PostgreSQL doesn't have real-time listeners like Firestore
// We'll implement polling-based updates for now
// For real-time functionality, you could consider using PostgreSQL LISTEN/NOTIFY
// or implement WebSocket connections

export const subscribeToTransactions = (month: string, callback: (transactions: Transaction[]) => void) => {
  // Implement polling every 5 seconds
  const pollTransactions = async () => {
    try {
      const transactions = await getTransactions(month);
      callback(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  // Initial fetch
  pollTransactions();
  
  // Set up polling
  const intervalId = setInterval(pollTransactions, 5000);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

export const subscribeToMonthlyBalance = (month: string, callback: (balance: MonthlyBalance | null) => void) => {
  // Implement polling every 5 seconds
  const pollBalance = async () => {
    try {
      const balance = await getMonthlyBalance(month);
      callback(balance);
    } catch (error) {
      console.error('Error fetching monthly balance:', error);
    }
  };
  
  // Initial fetch
  pollBalance();
  
  // Set up polling
  const intervalId = setInterval(pollBalance, 5000);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};