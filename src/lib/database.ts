import { getDbClient } from '@/lib/postgres';
import { MonthlyBalance, Transaction, NewTransactionInput } from '@/types';

const MONTH_FORMAT = /^\d{4}-\d{2}$/;

const parseMonthString = (month: string): Date => {
  if (!MONTH_FORMAT.test(month)) {
    throw new Error('Invalid month format. Expected YYYY-MM.');
  }
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  return new Date(Date.UTC(year, monthIndex, 1));
};

const formatMonthValue = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid month value retrieved from database.');
  }
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Transaction services
export async function addTransaction(
  transaction: NewTransactionInput,
  userId: number
): Promise<number> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      `INSERT INTO transactions (user_id, category, amount, type, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        transaction.category,
        transaction.amount,
        transaction.type,
        transaction.description,
        transaction.date,
      ]
    );
    return result.rows[0].id;
  } finally {
    client.release();
  }
}

export async function getTransactions(userId: number, month?: string): Promise<Transaction[]> {
  const client = await getDbClient();
  try {
    let query = `
      SELECT id, user_id, category, amount, type, description, date, created_at
      FROM transactions
      WHERE user_id = $1`;
    const params: any[] = [userId];
    if (month) {
      query += ` AND TO_CHAR(date, 'YYYY-MM') = $2`;
      params.push(month);
    }
    query += ' ORDER BY date DESC, id DESC';
    const result = await client.query(query, params);
    return result.rows.map((row) => ({
      id: String(row.id),
      userId: row.user_id,
      category: row.category,
      amount: Number(row.amount),
      type: row.type,
      description: row.description,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
    }));
  } finally {
    client.release();
  }
}

export async function updateTransaction(
  id: string,
  userId: number,
  updates: Partial<Transaction>
): Promise<void> {
  const client = await getDbClient();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    const addField = (column: string, value: any) => {
      fields.push(`${column} = $${index}`);
      values.push(value);
      index++;
    };

    if (updates.category !== undefined) {
      addField('category', updates.category);
    }
    if (updates.amount !== undefined) {
      addField('amount', updates.amount);
    }
    if (updates.type !== undefined) {
      addField('type', updates.type);
    }
    if (updates.description !== undefined) {
      addField('description', updates.description);
    }
    if (updates.date !== undefined) {
      const dateValue = updates.date instanceof Date ? updates.date : new Date(updates.date);
      addField('date', dateValue);
    }

    if (fields.length === 0) {
      return;
    }

    const idPlaceholder = index;
    values.push(id);
    index++;
    const userPlaceholder = index;
    values.push(userId);

    const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${idPlaceholder} AND user_id = $${userPlaceholder}`;
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      throw new Error('Transaction not found');
    }
  } finally {
    client.release();
  }
}

export async function deleteTransaction(id: string, userId: number): Promise<void> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      throw new Error('Transaction not found');
    }
  } finally {
    client.release();
  }
}

// Monthly balance services
export async function getMonthlyBalance(userId: number, month: string): Promise<MonthlyBalance | null> {
  const client = await getDbClient();
  try {
    const monthDate = parseMonthString(month);
    const result = await client.query(
      'SELECT * FROM monthly_balances WHERE user_id = $1 AND month = $2',
      [userId, monthDate]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return {
      id: row.id != null ? String(row.id) : undefined,
      month: formatMonthValue(row.month),
      initialBalance: Number(row.initial_balance),
      currentBalance: Number(row.current_balance),
      totalIncome: Number(row.total_income),
      totalExpense: Number(row.total_expense),
      lastUpdated: new Date(row.last_updated ?? row.updated_at ?? row.month),
    };
  } finally {
    client.release();
  }
}

export async function setMonthlyBalance(
  userId: number,
  month: string,
  balance: Omit<MonthlyBalance, 'id' | 'lastUpdated'>
): Promise<void> {
  const client = await getDbClient();
  try {
    const monthDate = parseMonthString(month);
    await client.query(
      `INSERT INTO monthly_balances (user_id, month, initial_balance, current_balance, total_income, total_expense)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, month) DO UPDATE SET
         initial_balance = EXCLUDED.initial_balance,
         current_balance = EXCLUDED.current_balance,
         total_income = EXCLUDED.total_income,
         total_expense = EXCLUDED.total_expense,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, monthDate, balance.initialBalance, balance.currentBalance, balance.totalIncome, balance.totalExpense]
    );
  } finally {
    client.release();
  }
}

export async function updateMonthlyBalance(
  userId: number,
  month: string,
  updates: Partial<MonthlyBalance>
): Promise<void> {
  const client = await getDbClient();
  try {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    if (updates.initialBalance !== undefined) {
      fields.push(`initial_balance = $${paramIndex}`);
      values.push(updates.initialBalance);
      paramIndex++;
    }
    if (updates.currentBalance !== undefined) {
      fields.push(`current_balance = $${paramIndex}`);
      values.push(updates.currentBalance);
      paramIndex++;
    }
    if (updates.totalIncome !== undefined) {
      fields.push(`total_income = $${paramIndex}`);
      values.push(updates.totalIncome);
      paramIndex++;
    }
    if (updates.totalExpense !== undefined) {
      fields.push(`total_expense = $${paramIndex}`);
      values.push(updates.totalExpense);
      paramIndex++;
    }
    if (fields.length === 0) return;
    fields.push(`last_updated = CURRENT_TIMESTAMP`);
    const setClause = fields.join(', ');
    values.push(userId);
    const monthDate = parseMonthString(month);
    values.push(monthDate);
    const query = `UPDATE monthly_balances SET ${setClause} WHERE user_id = $${paramIndex} AND month = $${paramIndex + 1}`;
    await client.query(query, values);
  } finally {
    client.release();
  }
}

export const subscribeToMonthlyBalance = (
  userId: number,
  month: string,
  callback: (balance: MonthlyBalance | null) => void
) => {
  const pollBalance = async () => {
    try {
      const balance = await getMonthlyBalance(userId, month);
      callback(balance);
    } catch (error) {
      console.error('Error fetching monthly balance:', error);
    }
  };
  pollBalance();
  const intervalId = setInterval(pollBalance, 5000);
  return () => clearInterval(intervalId);
};
