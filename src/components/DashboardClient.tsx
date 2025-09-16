"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BalanceCard from '@/components/BalanceCard';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import CategoryManager from '@/components/CategoryManager';
import { MonthlyBalance } from '@/types';
import { recalculateMonthlyBalance, getCurrentMonth } from '@/lib/utils';

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sessionUser = session?.user as { id?: number } | undefined;
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, status, router]);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [balance, setBalance] = useState<MonthlyBalance | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const handleBalanceUpdate = useCallback((newBalance: MonthlyBalance) => {
    setBalance(newBalance);
  }, []);

  const handleTransactionChange = useCallback(async () => {
    if (balance && sessionUser?.id) {
      setIsRecalculating(true);
      try {
        await recalculateMonthlyBalance(sessionUser.id, currentMonth);
      } catch (error) {
        console.error('Failed to recalculate balance:', error);
      } finally {
        setIsRecalculating(false);
      }
    }
  }, [balance, currentMonth, sessionUser?.id]);

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthString = `${year}-${month}`;
      const displayName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      options.push({ value: monthString, label: displayName });
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-2">
            <div></div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Kelola Kategori"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-700">Kelola keuangan anak kos dengan mudah</p>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-800 mb-2">
            Pilih Bulan
          </label>
          <select
            id="month-select"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="w-full px-3 py-2 border text-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
          >
            {generateMonthOptions().map((option) => (
              <option key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Balance Card */}
        <div className="mb-6">
          <BalanceCard 
            currentMonth={currentMonth} 
            onBalanceUpdate={handleBalanceUpdate}
          />
        </div>

        {/* Quick Stats */}
        {balance && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm font-medium">Pemasukan</p>
              <p className="text-green-800 text-lg font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(balance.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm font-medium">Pengeluaran</p>
              <p className="text-red-800 text-lg font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(balance.totalExpense)}
              </p>
            </div>
          </div>
        )}

        {/* Transaction List with enhanced padding for sticky button */}
        <div className="pb-32">
          <TransactionList 
            currentMonth={currentMonth}
            onTransactionChange={handleTransactionChange}
          />
        </div>

        {/* Transaction Form (Floating) */}
        <TransactionForm 
          currentMonth={currentMonth}
          onTransactionAdded={handleTransactionChange} 
        />

        {/* Loading overlay when recalculating */}
        {isRecalculating && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-[70]">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="text-sm">Memperbarui saldo...</span>
            </div>
          </div>
        )}

        {/* Category Manager Modal */}
        {showCategoryManager && (
          <CategoryManager onClose={() => setShowCategoryManager(false)} />
        )}
      </div>
    </div>
  );
}
