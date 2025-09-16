export interface Transaction {
  id?: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
  userId: number;
}

export interface MonthlyBalance {
  id?: string;
  month: string; // Format: YYYY-MM
  initialBalance: number;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  lastUpdated: Date;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
}

export type NewTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'userId'>;

export const DEFAULT_CATEGORIES: TransactionCategory[] = [
  // Income categories
  { id: 'salary', name: 'Gaji/Uang Saku', type: 'income', icon: 'fas fa-money-bill-wave' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: 'fas fa-laptop' },
  { id: 'gift', name: 'Hadiah', type: 'income', icon: 'fas fa-gift' },
  { id: 'other-income', name: 'Lainnya', type: 'income', icon: 'fas fa-plus-circle' },
  
  // Expense categories  
  { id: 'food', name: 'Makanan', type: 'expense', icon: 'fas fa-utensils' },
  { id: 'transport', name: 'Transportasi', type: 'expense', icon: 'fas fa-car' },
  { id: 'education', name: 'Pendidikan', type: 'expense', icon: 'fas fa-graduation-cap' },
  { id: 'entertainment', name: 'Hiburan', type: 'expense', icon: 'fas fa-gamepad' },
  { id: 'health', name: 'Kesehatan', type: 'expense', icon: 'fas fa-heartbeat' },
  { id: 'shopping', name: 'Belanja', type: 'expense', icon: 'fas fa-shopping-cart' },
  { id: 'bills', name: 'Tagihan', type: 'expense', icon: 'fas fa-file-invoice' },
  { id: 'other-expense', name: 'Lainnya', type: 'expense', icon: 'fas fa-minus-circle' },
];
