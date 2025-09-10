import { NextRequest, NextResponse } from 'next/server';
import { getDbClient } from '@/lib/postgres';

export async function GET() {
  const client = await getDbClient();
  
  try {
    const result = await client.query(`
      SELECT id, name, type, icon 
      FROM categories 
      ORDER BY type, name
    `);
    
    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type as 'income' | 'expense',
      icon: row.icon
    }));
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const client = await getDbClient();
  
  try {
    const { name, type, icon } = await request.json();
    
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Generate ID from name
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    const result = await client.query(`
      INSERT INTO categories (id, name, type, icon) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [id, name, type, icon || '📝']);
    
    const newCategory = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      type: result.rows[0].type as 'income' | 'expense',
      icon: result.rows[0].icon
    };
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}