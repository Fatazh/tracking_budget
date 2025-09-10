'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionCategory } from '@/types';
import { addTransaction, getCategories } from '@/lib/api';

interface TransactionFormProps {
  currentMonth: string;
  onTransactionAdded?: () => void;
}

// Utility function to check if a month is in the past
const isMonthInPast = (monthString: string): boolean => {
  const [year, month] = monthString.split('-').map(Number);
  const inputDate = new Date(year, month - 1); // month is 0-indexed in Date
  const currentDate = new Date();
  const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
  
  return inputDate < currentMonthDate;
};

export default function TransactionForm({ currentMonth, onTransactionAdded }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: '',
    category: '',
    date: currentMonth + '-01', // Default to first day of the current month
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Check if the current month is in the past
  const isReadOnly = isMonthInPast(currentMonth);
  
  // Get current month name for display
  const getCurrentMonthName = () => {
    const [year, month] = currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };
  
  // Enhanced scroll detection for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) return;

    setIsSubmitting(true);
    try {
      const transaction: Omit<Transaction, 'id' | 'createdAt'> = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description,
        category: formData.category,
        date: new Date(formData.date),
      };

      await addTransaction(transaction);
      
      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        description: '',
        category: '',
        date: currentMonth + '-01', // Reset to first day of current month
      });
      
      setIsOpen(false);
      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <>
      {/* Truly Fixed Floating Action Button */}
      {!isReadOnly ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`floating-button bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-4 border-white animate-pulse hover:animate-none backdrop-blur-sm ${
            isScrolled ? 'ring-4 ring-blue-300 ring-opacity-30 shadow-2xl' : 'shadow-xl'
          }`}
          style={{
            bottom: '24px',
            right: '24px',
            transform: isScrolled ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      ) : (
        <div 
          className={`floating-button transition-all duration-300 ${
            isScrolled ? 'opacity-80 scale-105' : 'opacity-60 scale-100'
          }`}
          style={{
            bottom: '24px',
            right: '24px'
          }}
        >
          <div className="bg-gray-400 text-white p-4 rounded-full shadow-xl cursor-not-allowed border-4 border-white backdrop-blur-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-90 backdrop-blur-sm pointer-events-none">
            Tidak dapat menambah transaksi ke bulan lalu
          </div>
        </div>
      )}

      {/* Modal with Enhanced Z-Index */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative" style={{ zIndex: 10001 }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Tambah Transaksi</h2>
                <p className="text-sm text-gray-600">{getCurrentMonthName()}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                      formData.type === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    💰 Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                    className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    💸 Pengeluaran
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-800 mb-2">
                  Jumlah (Rp)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-800 mb-2">
                  Kategori
                </label>
                {categoriesLoading ? (
                  <div className="w-full px-3 py-2 border text-gray-50 border-gray-300 rounded-lg bg-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border text-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    required
                  >
                    <option value="" className="text-gray-900">Pilih kategori...</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id} className="text-gray-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                {!categoriesLoading && filteredCategories.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Belum ada kategori {formData.type === 'income' ? 'pemasukan' : 'pengeluaran'}. 
                    Tambahkan kategori di pengaturan.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
                  Deskripsi
                </label>
                <input
                  id="description"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Makan siang di kantin"
                  className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-800 mb-2">
                  Tanggal
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={`${currentMonth}-01`}
                  max={`${currentMonth}-31`}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Hanya dapat menambah transaksi untuk bulan {getCurrentMonthName()}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}