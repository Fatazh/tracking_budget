import { getDbClient } from '@/lib/postgres';
import { MonthlyBalance } from '@/types';

// Monthly balance services
export async function getMonthlyBalance(userId: number, month: string): Promise<MonthlyBalance | null> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      'SELECT * FROM monthly_balances WHERE user_id = $1 AND month = $2',
      [userId, month]
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
}

export async function setMonthlyBalance(
  userId: number,
  month: string,
  balance: Omit<MonthlyBalance, 'id' | 'lastUpdated'>
): Promise<void> {
  const client = await getDbClient();
  try {
    await client.query(
      `INSERT INTO monthly_balances (user_id, month, initial_balance, current_balance, total_income, total_expense) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, month) DO UPDATE SET initial_balance = EXCLUDED.initial_balance, current_balance = EXCLUDED.current_balance, total_income = EXCLUDED.total_income, total_expense = EXCLUDED.total_expense, last_updated = CURRENT_TIMESTAMP`,
      [userId, month, balance.initialBalance, balance.currentBalance, balance.totalIncome, balance.totalExpense]
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
    values.push(month);
    const query = `UPDATE monthly_balances SET ${setClause} WHERE user_id = $${paramIndex} AND month = $${paramIndex+1}`;
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
