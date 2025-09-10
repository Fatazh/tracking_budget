'use client';

import { useState, useEffect } from 'react';
import { TransactionCategory } from '@/types';

const FONTAWESOME_OPTIONS = [
  // General icons
  'fas fa-home', 'fas fa-user', 'fas fa-heart', 'fas fa-star', 'fas fa-cog', 'fas fa-bell',
  // Financial icons
  'fas fa-money-bill-wave', 'fas fa-coins', 'fas fa-credit-card', 'fas fa-wallet', 'fas fa-piggy-bank', 'fas fa-chart-line',
  // Food & Dining
  'fas fa-utensils', 'fas fa-coffee', 'fas fa-wine-glass', 'fas fa-pizza-slice', 'fas fa-hamburger', 'fas fa-ice-cream',
  // Transportation
  'fas fa-car', 'fas fa-bus', 'fas fa-bicycle', 'fas fa-motorcycle', 'fas fa-plane', 'fas fa-train',
  // Shopping
  'fas fa-shopping-cart', 'fas fa-shopping-bag', 'fas fa-store', 'fas fa-gift', 'fas fa-tag', 'fas fa-receipt',
  // Entertainment
  'fas fa-gamepad', 'fas fa-film', 'fas fa-music', 'fas fa-headphones', 'fas fa-tv', 'fas fa-camera',
  // Health & Medical
  'fas fa-heartbeat', 'fas fa-pills', 'fas fa-user-md', 'fas fa-hospital', 'fas fa-first-aid', 'fas fa-dumbbell',
  // Education & Work
  'fas fa-graduation-cap', 'fas fa-book', 'fas fa-laptop', 'fas fa-briefcase', 'fas fa-pen', 'fas fa-calculator',
  // Utilities & Bills
  'fas fa-file-invoice', 'fas fa-bolt', 'fas fa-wifi', 'fas fa-phone', 'fas fa-home', 'fas fa-wrench',
  // Miscellaneous
  'fas fa-plus-circle', 'fas fa-minus-circle', 'fas fa-question-circle', 'fas fa-info-circle', 'fas fa-exclamation-triangle', 'fas fa-check-circle'
];

interface CategoryManagerProps {
  onClose: () => void;
}

export default function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'fas fa-question-circle'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEdit = (category: TransactionCategory) => {
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon || 'fas fa-question-circle'
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'expense', icon: 'fas fa-question-circle' });
    setEditingId(null);
    setIsAdding(false);
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Kelola Kategori</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-800 mb-3">
              {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama kategori"
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Jenis
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="income" className="text-gray-900">Pemasukan</option>
                    <option value="expense" className="text-gray-900">Pengeluaran</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Icon Font Awesome (Pilih atau ketik class)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {FONTAWESOME_OPTIONS.map((iconClass) => (
                    <button
                      key={iconClass}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconClass })}
                      className={`p-2 text-lg border text-black rounded-lg hover:bg-gray-100 flex items-center justify-center w-10 h-10 ${
                        formData.icon === iconClass ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                      }`}
                      title={iconClass}
                    >
                      <i className={iconClass}></i>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Atau ketik class Font Awesome (misal: fas fa-home)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingId ? 'Update' : 'Tambah'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full mb-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-blue-500 hover:text-blue-500 transition-colors font-medium"
          >
            + Tambah Kategori Baru
          </button>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {/* Income Categories */}
          <div>
            <h3 className="font-medium text-green-700 mb-3 flex items-center">
              <i className="fas fa-money-bill-wave mr-2"></i> Kategori Pemasukan ({incomeCategories.length})
            </h3>
            <div className="space-y-2">
              {incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <i className={`${category.icon} text-xl text-green-600`}></i>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Hapus"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {incomeCategories.length === 0 && (
                <p className="text-gray-600 text-center py-4">Belum ada kategori pemasukan</p>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h3 className="font-medium text-red-700 mb-3 flex items-center">
              <i className="fas fa-minus-circle mr-2"></i> Kategori Pengeluaran ({expenseCategories.length})
            </h3>
            <div className="space-y-2">
              {expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-3">
                    <i className={`${category.icon} text-xl text-red-600`}></i>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Hapus"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <p className="text-gray-600 text-center py-4">Belum ada kategori pengeluaran</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}