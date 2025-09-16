import { MonthlyBalance, Transaction } from '@/types';
import { getTransactions, updateMonthlyBalance, getMonthlyBalance } from '@/lib/api';

export const recalculateMonthlyBalance = async (userId: number, month: string) => {
  try {
    // Get current balance data
    const currentBalance = await getMonthlyBalance(userId, month);
    if (!currentBalance) return;

    // Get all transactions for the month
    const transactions = await getTransactions(userId, month);
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const newCurrentBalance = currentBalance.initialBalance + totalIncome - totalExpense;
    
    // Update balance in PostgreSQL
    await updateMonthlyBalance(month, {
      totalIncome,
      totalExpense,
      currentBalance: newCurrentBalance,
    });
    
    return {
      ...currentBalance,
      totalIncome,
      totalExpense,
      currentBalance: newCurrentBalance,
    };
  } catch (error) {
    console.error('Error recalculating balance:', error);
    throw error;
  }
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthDisplayName = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};
