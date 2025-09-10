-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50) DEFAULT 'fas fa-question-circle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for name within the same type
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_type ON categories(name, type);

-- Insert default categories
INSERT INTO categories (id, name, type, icon) VALUES
-- Income categories
('salary', 'Gaji/Uang Saku', 'income', 'fas fa-money-bill-wave'),
('freelance', 'Freelance', 'income', 'fas fa-laptop'),
('gift', 'Hadiah', 'income', 'fas fa-gift'),
('other-income', 'Lainnya', 'income', 'fas fa-plus-circle'),

-- Expense categories  
('food', 'Makanan', 'expense', 'fas fa-utensils'),
('transport', 'Transportasi', 'expense', 'fas fa-car'),
('education', 'Pendidikan', 'expense', 'fas fa-graduation-cap'),
('entertainment', 'Hiburan', 'expense', 'fas fa-gamepad'),
('health', 'Kesehatan', 'expense', 'fas fa-heartbeat'),
('shopping', 'Belanja', 'expense', 'fas fa-shopping-cart'),
('bills', 'Tagihan', 'expense', 'fas fa-file-invoice'),
('other-expense', 'Lainnya', 'expense', 'fas fa-minus-circle')

ON CONFLICT (id) DO NOTHING;