import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/postgres';

export async function POST() {
  const client = await getDbClient();
  
  try {
    // Create categories table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
          icon VARCHAR(50) DEFAULT 'fas fa-question-circle',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create unique index for name within the same type
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_type ON categories(name, type)
    `);

    // Insert default categories
    const defaultCategories = [
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
      { id: 'other-expense', name: 'Lainnya', type: 'expense', icon: 'fas fa-minus-circle' }
    ];

    for (const category of defaultCategories) {
      await client.query(`
        INSERT INTO categories (id, name, type, icon) 
        VALUES ($1, $2, $3, $4) 
        ON CONFLICT (id) DO NOTHING
      `, [category.id, category.name, category.type, category.icon]);
    }

    return NextResponse.json({ 
      message: 'Categories table setup completed successfully',
      categoriesCount: defaultCategories.length
    });
  } catch (error) {
    console.error('Error setting up categories:', error);
    return NextResponse.json(
      { error: 'Failed to setup categories table' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}