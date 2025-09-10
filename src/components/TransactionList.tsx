'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionCategory } from '@/types';
import { subscribeToTransactions, deleteTransaction, getCategories } from '@/lib/api';
import { format } from 'date-fns';

interface TransactionListProps {
  currentMonth: string;
  onTransactionChange?: () => void;
}

// Utility function to check if a month is in the past
const isMonthInPast = (monthString: string): boolean => {
  const [year, month] = monthString.split('-').map(Number);
  const inputDate = new Date(year, month - 1); // month is 0-indexed in Date
  const currentDate = new Date();
  const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
  
  return inputDate < currentMonthDate;
};

export default function TransactionList({ currentMonth, onTransactionChange }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  
  // Check if the current month is in the past
  const isReadOnly = isMonthInPast(currentMonth);
  
  // Get current month name for display
  const getCurrentMonthName = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(currentMonth, (newTransactions) => {
      setTransactions(newTransactions);
      setLoading(false);
      if (onTransactionChange) onTransactionChange();
    });

    return () => unsubscribe();
  }, [currentMonth, onTransactionChange]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || {
      name: categoryId,
      icon: 'fas fa-question-circle',
      type: 'expense' as const
    };
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Riwayat Transaksi</h3>
          {isReadOnly && (
            <p className="text-sm text-gray-600">
              📅 {getCurrentMonthName()} (Hanya Lihat)
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-black'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              filter === 'income' ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-black'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              filter === 'expense' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-black'
            }`}
          >
            Keluar
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <p className="text-gray-600 mb-2">
            {filter === 'all' ? 'Belum ada transaksi' : 
             filter === 'income' ? 'Belum ada pemasukan' : 'Belum ada pengeluaran'}
          </p>
          <p className="text-sm text-gray-500">
            {isReadOnly ? 
              `Tidak ada riwayat untuk ${getCurrentMonthName()}` :
              'Tap tombol + untuk menambah transaksi'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const categoryInfo = getCategoryInfo(transaction.category);
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <i className={`${categoryInfo.icon} text-xl text-blue-600`}></i>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {categoryInfo.name} • {format(transaction.date, 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  {!isReadOnly ? (
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id!)}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                      title="Hapus transaksi"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {filteredTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-800">
            <span>Total {filter === 'all' ? 'transaksi' : filter === 'income' ? 'pemasukan' : 'pengeluaran'}:</span>
            <span className="font-medium text-gray-900">
              {filteredTransactions.length} transaksi
            </span>
          </div>
        </div>
      )}
    </div>
  );
}