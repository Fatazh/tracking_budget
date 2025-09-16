import { Transaction, MonthlyBalance, TransactionCategory, NewTransactionInput } from '@/types';

// Client-side API service layer for database operations

// Transaction services
export const addTransaction = async (transaction: NewTransactionInput): Promise<string> => {
  const payload = {
    ...transaction,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
  };

  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to add transaction');
  }

  const result = await response.json();
  return result.id;
};

export const getTransactions = async (userId: number, month?: string): Promise<Transaction[]> => {
  const url = new URL('/api/transactions', window.location.origin);
  if (month) {
    url.searchParams.set('month', month);
  }
  url.searchParams.set('userId', String(userId));
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  const transactions = await response.json();
  return transactions.map((t: any) => ({
    id: t.id != null ? String(t.id) : undefined,
    amount: Number(t.amount),
    type: t.type,
    description: t.description,
    category: t.category,
    date: new Date(t.date),
    createdAt: new Date(t.created_at ?? t.createdAt ?? t.date),
    userId: Number(t.user_id ?? t.userId ?? userId),
  }));
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update transaction');
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete transaction');
  }
};

// Monthly balance services
export const getMonthlyBalance = async (userId: number, month: string): Promise<MonthlyBalance | null> => {
  const response = await fetch(`/api/balance/${month}?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch monthly balance');
  }
  const balance = await response.json();
  if (!balance) return null;
  return {
    id: balance.id ? String(balance.id) : undefined,
    month: balance.month,
    initialBalance: Number(balance.initialBalance ?? balance.initial_balance ?? 0),
    currentBalance: Number(balance.currentBalance ?? balance.current_balance ?? 0),
    totalIncome: Number(balance.totalIncome ?? balance.total_income ?? 0),
    totalExpense: Number(balance.totalExpense ?? balance.total_expense ?? 0),
    lastUpdated: new Date(balance.lastUpdated ?? balance.last_updated ?? Date.now()),
  };
};

export const setMonthlyBalance = async (month: string, balance: Omit<MonthlyBalance, 'id' | 'lastUpdated'>): Promise<void> => {
  const response = await fetch(`/api/balance/${month}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(balance),
  });

  if (!response.ok) {
    throw new Error('Failed to set monthly balance');
  }
};

export const updateMonthlyBalance = async (month: string, updates: Partial<MonthlyBalance>): Promise<void> => {
  const response = await fetch(`/api/balance/${month}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update monthly balance');
  }
};

// Category services
export const getCategories = async (): Promise<TransactionCategory[]> => {
  const response = await fetch('/api/categories');

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
};

export const addCategory = async (category: Omit<TransactionCategory, 'id'>): Promise<TransactionCategory> => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add category');
  }

  return response.json();
};

export const updateCategory = async (id: string, category: Omit<TransactionCategory, 'id'>): Promise<TransactionCategory> => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update category');
  }

  return response.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
};

// Polling-based subscription simulation for client-side
export const subscribeToTransactions = (userId: number, month: string, callback: (transactions: Transaction[]) => void) => {
  const pollTransactions = async () => {
    try {
      const transactions = await getTransactions(userId, month);
      callback(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  // Initial fetch
  pollTransactions();
  // Set up polling every 5 seconds
  const intervalId = setInterval(pollTransactions, 5000);
  // Return cleanup function
  return () => clearInterval(intervalId);
};

export const subscribeToMonthlyBalance = (userId: number, month: string, callback: (balance: MonthlyBalance | null) => void) => {
  const pollBalance = async () => {
    try {
      const balance = await getMonthlyBalance(userId, month);
      callback(balance);
    } catch (error) {
      console.error('Error fetching monthly balance:', error);
    }
  };
  // Initial fetch
  pollBalance();
  // Set up polling every 5 seconds
  const intervalId = setInterval(pollBalance, 5000);
  // Return cleanup function
  return () => clearInterval(intervalId);
};
