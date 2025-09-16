'use client';

import { useState, useEffect } from 'react';
import { MonthlyBalance } from '@/types';
import { getMonthlyBalance, setMonthlyBalance, subscribeToMonthlyBalance } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface BalanceCardProps {
  currentMonth: string;
  onBalanceUpdate?: (balance: MonthlyBalance) => void;
}

// Utility function to check if a month is in the past
const isMonthInPast = (monthString: string): boolean => {
  const [year, month] = monthString.split('-').map(Number);
  const inputDate = new Date(year, month - 1); // month is 0-indexed in Date
  const currentDate = new Date();
  const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
  
  return inputDate < currentMonthDate;
};

export default function BalanceCard({ currentMonth, onBalanceUpdate }: BalanceCardProps) {
  const [balance, setBalance] = useState<MonthlyBalance | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialBalance, setInitialBalance] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Check if the current month is in the past
  const isReadOnly = isMonthInPast(currentMonth);

  const { data: session } = useSession();
  useEffect(() => {
    const user = session?.user as { id: number } | undefined;
    if (!user?.id) return;
    const unsubscribe = subscribeToMonthlyBalance(user.id, currentMonth, (newBalance: MonthlyBalance | null) => {
      setBalance(newBalance);
      setLoading(false);
      if (newBalance && onBalanceUpdate) {
        onBalanceUpdate(newBalance);
      }
    });
    return () => unsubscribe();
  }, [currentMonth, onBalanceUpdate, session]);

  const handleSetInitialBalance = async () => {
    const amount = parseFloat(initialBalance);
    if (isNaN(amount)) return;

    try {
      const newBalance: Omit<MonthlyBalance, 'id' | 'lastUpdated'> = {
        month: currentMonth,
        initialBalance: amount,
        currentBalance: amount,
        totalIncome: 0,
        totalExpense: 0,
      };

      await setMonthlyBalance(currentMonth, newBalance);
      setIsEditing(false);
      setInitialBalance('');
    } catch (error) {
      console.error('Error setting initial balance:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentMonthName = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Saldo Bulan {getCurrentMonthName()}
        </h2>
        
        {isReadOnly ? (
          // Read-only view for past months
          <div className="text-center py-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 text-sm mb-2">
                📅 Bulan ini sudah berlalu
              </p>
              <p className="text-gray-600 text-xs">
                Tidak dapat mengedit saldo awal untuk bulan yang sudah lewat
              </p>
            </div>
            <p className="text-gray-600 text-sm">Tidak ada data saldo untuk bulan ini</p>
          </div>
        ) : !isEditing ? (
          // Editable view for current month
          <div className="text-center py-8">
            <p className="text-gray-700 mb-4">Belum ada saldo awal untuk bulan ini</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Set Saldo Awal
            </button>
          </div>
        ) : (
          // Editing form for current month
          <div className="space-y-4">
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-800 mb-2">
                Saldo Awal Bulan
              </label>
              <input
                id="initialBalance"
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="Masukkan saldo awal..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSetInitialBalance}
                disabled={!initialBalance}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Simpan
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setInitialBalance('');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading text-navy-dark">
          Saldo Bulan {getCurrentMonthName()}
        </h2>
        {isReadOnly && (
          <div className="flex items-center text-gray-700 text-xs bg-gray-100 px-2 py-1 rounded-full">
            📅 Bulan Lalu
          </div>
        )}
      </div>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-700">Saldo Saat Ini</p>
          <p className={`text-3xl font-bold ${balance.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance.currentBalance)}
          </p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center shadow">
          <p className="text-xs text-gray-500">Saldo Awal</p>
          <p className="text-lg font-semibold text-navy-dark">
            {formatCurrency(balance.initialBalance)}
          </p>
        </div>
        {balance.currentBalance < 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ Saldo minus! Perhatikan pengeluaran Anda.
            </p>
          </div>
        )}
        {isReadOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm font-medium">
              📊 Ini adalah riwayat bulan {getCurrentMonthName()}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Data ini hanya untuk melihat riwayat, tidak dapat diedit
            </p>
          </div>
        )}
      </div>
    </div>
  );
}