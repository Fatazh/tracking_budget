import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/postgres';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await getDbClient();
  
  try {
    const { name, type, icon } = await request.json();
    const categoryId = params.id;
    
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }
    
    const result = await client.query(`
      UPDATE categories 
      SET name = $1, type = $2, icon = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 
      RETURNING *
    `, [name, type, icon || '📝', categoryId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const updatedCategory = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      type: result.rows[0].type as 'income' | 'expense',
      icon: result.rows[0].icon
    };
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await getDbClient();
  
  try {
    const categoryId = params.id;
    
    // Check if category is being used in transactions
    const usageCheck = await client.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category = $1',
      [categoryId]
    );
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used in transactions' },
        { status: 409 }
      );
    }
    
    const result = await client.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [categoryId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}